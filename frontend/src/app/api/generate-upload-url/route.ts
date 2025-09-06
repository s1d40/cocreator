
import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

// Create a new GCS storage client
const storage = new Storage();

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'Missing filename or contentType' },
        { status: 400 }
      );
    }

    // Get the project ID from environment variables. 
    // Make sure you have GCP_PROJECT_ID set in your .env.local file.
    const projectId = process.env.GCP_PROJECT_ID;
    if (!projectId) {
        return NextResponse.json(
            { error: 'GCP_PROJECT_ID environment variable not set.' },
            { status: 500 }
        );
    }

    // Construct the bucket name based on the Terraform configuration
    const bucketName = `${projectId}-my-content-pipeline-file-uploads`;

    const options = {
      version: 'v4' as const,
      action: 'write' as const,
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: contentType,
    };

    // Get a v4 signed URL for uploading a file
    const [url] = await storage
      .bucket(bucketName)
      .file(filename)
      .getSignedUrl(options);

    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
