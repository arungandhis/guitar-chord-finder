import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { youtubeUrl } = await request.json();
  const backendUrl = process.env.TRANSCRIBE_BACKEND_URL || localStorage.getItem('transcribe_backend_url');

  if (!backendUrl) {
    return NextResponse.json({ error: 'Backend URL not configured' }, { status: 500 });
  }

  try {
    // Start transcription job
    const response = await fetch(`${backendUrl}/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ youtube_url: youtubeUrl }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `Failed to start transcription: ${error}` }, { status: response.status });
    }

    const { job_id } = await response.json();
    return NextResponse.json({ jobId: job_id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to connect to transcription service' }, { status: 500 });
  }
}