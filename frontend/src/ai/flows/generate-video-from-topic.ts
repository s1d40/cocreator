'use server';
/**
 * @fileOverview AI flow to generate a short video from a topic or URL.
 *
 * - generateVideoFromTopic - A function that initiates the video generation process.
 * - GenerateVideoFromTopicInput - The input type for the generateVideoFromTopic function.
 * - GenerateVideoFromTopicOutput - The return type for the generateVideoFromTopic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import * as fs from 'fs';
import { Readable } from 'stream';

import wav from 'wav';

const GenerateVideoFromTopicInputSchema = z.object({
  topic: z.string().describe('The topic or URL to generate a video from.'),
  aspectRatio: z.enum(['16:9', '9:16']).default('16:9').describe('The aspect ratio of the video.'),
  voiceName: z.string().optional().describe('The voice name for the narration.'),
});
export type GenerateVideoFromTopicInput = z.infer<typeof GenerateVideoFromTopicInputSchema>;

const GenerateVideoFromTopicOutputSchema = z.object({
  videoDataUri: z.string().describe('The generated video as a data URI.'),
});
export type GenerateVideoFromTopicOutput = z.infer<typeof GenerateVideoFromTopicOutputSchema>;

export async function generateVideoFromTopic(input: GenerateVideoFromTopicInput): Promise<GenerateVideoFromTopicOutput> {
  return generateVideoFromTopicFlow(input);
}

const generateScriptPrompt = ai.definePrompt({
  name: 'generateScriptPrompt',
  input: { schema: GenerateVideoFromTopicInputSchema },
  prompt: `You are a video script writer. Write a short script based on the following topic: {{{topic}}}. The script should be concise and suitable for a short video.`,
});

const generateVoicePrompt = ai.definePrompt({
  name: 'generateVoicePrompt',
  input: { schema: z.object({ script: z.string(), voiceName: z.string().optional() }) },
  output: { schema: z.object({ media: z.string() }) },
  prompt: `Generate voice audio from the following script: {{{script}}}.{{
    #if voiceName
  }} Use voice: {{{voiceName}}}.{{
    /if
  }}`, config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const generateVideoPrompt = ai.definePrompt({
  name: 'generateVideoPrompt',
  input: { schema: z.object({ script: z.string(), aspectRatio: z.string() }) },
  output: { schema: z.object({ operation: z.any() }) },
  prompt: `Generate a video based on the following script: {{{script}}}.`,
});

const generateVideoFromTopicFlow = ai.defineFlow(
  {
    name: 'generateVideoFromTopicFlow',
    inputSchema: GenerateVideoFromTopicInputSchema,
    outputSchema: GenerateVideoFromTopicOutputSchema,
  },
  async input => {
    const { text: script } = await generateScriptPrompt(input);

    let voiceResult = await generateVoiceFromScript(script!, input.voiceName);

    const { operation } = await ai.generate({
      model: googleAI.model('veo-2.0-generate-001'),
      prompt: script,
      config: {
        durationSeconds: 5,
        aspectRatio: input.aspectRatio,
      },
    });

    if (!operation) {
      throw new Error('Expected the model to return an operation');
    }

    // Wait until the operation completes. Note that this may take some time, maybe even up to a minute. Design the UI accordingly.
    let currentOperation = operation;
    while (!currentOperation.done) {\n      currentOperation = await ai.checkOperation(currentOperation);
      // Sleep for 5 seconds before checking again.
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    if (currentOperation.error) {
      throw new Error('failed to generate video: ' + currentOperation.error.message);
    }

    const video = currentOperation.output?.message?.content.find((p) => !!p.media);
    if (!video) {
      throw new Error('Failed to find the generated video');
    }

    const videoDataUri = await downloadVideoAsDataUri(video);

    return { videoDataUri };
  }
);

async function generateVoiceFromScript(script: string, voiceName?: string): Promise<{ media: string }> {
  const { media } = await ai.generate({
    model: googleAI.model('gemini-2.5-flash-preview-tts'),
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voiceName || 'Algenib' },
        },
      },
    },
    prompt: script,
  });

  if (!media) {
    throw new Error('no media returned');
  }
  const audioBuffer = Buffer.from(
    media.url.substring(media.url.indexOf(',') + 1),
    'base64'
  );
  return {
    media: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
  };
}

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

async function downloadVideoAsDataUri(video: any): Promise<string> {
  const fetch = (await import('node-fetch')).default;
  const videoDownloadResponse = await fetch(`${video.media!.url}&key=${process.env.GEMINI_API_KEY}`);
  const buffer = await videoDownloadResponse.buffer();
  const videoBase64 = buffer.toString('base64');
  return `data:video/mp4;base64,${videoBase64}`;
}

