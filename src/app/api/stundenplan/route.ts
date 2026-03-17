import { fetchStundenplan } from '@/lib/stundenplan';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { school, user, pass, date } = await request.json();
    
    if (!school || !user || !pass) {
      return NextResponse.json({ error: 'Missing login data.' }, { status: 400 });
    }

    const data = await fetchStundenplan(school, user, pass, date);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'An error occurred during fetch.' }, { status: 500 });
  }
}
