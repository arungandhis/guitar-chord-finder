import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');
  const backendUrl = process.env.TRANSCRIBE_BACKEND_URL || localStorage.getItem('transcribe_backend_url');

  if (!backendUrl || !jobId) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    const response = await fetch(`${backendUrl}/transcribe/status/${jobId}`);
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch status' }, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to connect' }, { status: 500 });
  }
}