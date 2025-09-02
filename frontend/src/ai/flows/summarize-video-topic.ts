'use server';
/**
 * @fileOverview Summarizes a video topic or URL using GenAI.
 *
 * - summarizeVideoTopic - A function that takes a topic or URL and returns a summary.
 * - SummarizeVideoTopicInput - The input type for the summarizeVideoTopic function.
 * - SummarizeVideoTopicOutput - The return type for the summarizeVideoTopic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeVideoTopicInputSchema = z.object({
  topic: z.string().describe('The topic or URL to summarize.'),
});
export type SummarizeVideoTopicInput = z.infer<typeof SummarizeVideoTopicInputSchema>;

const SummarizeVideoTopicOutputSchema = z.object({
  summary: z.string().describe('A summary of the topic.'),
  progress: z.string().describe('Progress of the summarization process.'),
});
export type SummarizeVideoTopicOutput = z.infer<typeof SummarizeVideoTopicOutputSchema>;

export async function summarizeVideoTopic(input: SummarizeVideoTopicInput): Promise<SummarizeVideoTopicOutput> {
  return summarizeVideoTopicFlow(input);
}

const summarizeVideoTopicPrompt = ai.definePrompt({
  name: 'summarizeVideoTopicPrompt',
  input: {schema: SummarizeVideoTopicInputSchema},
  output: {schema: SummarizeVideoTopicOutputSchema},
  prompt: `Summarize the following topic or URL in one paragraph:\n\n{{{topic}}}`,
});

const summarizeVideoTopicFlow = ai.defineFlow(
  {
    name: 'summarizeVideoTopicFlow',
    inputSchema: SummarizeVideoTopicInputSchema,
    outputSchema: SummarizeVideoTopicOutputSchema,
  },
  async input => {
    const {output} = await summarizeVideoTopicPrompt(input);
    return {
      ...output!,
      progress: 'The topic has been summarized successfully.',
    };
  }
);
