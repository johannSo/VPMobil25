import { fetchStundenplan } from '@/lib/stundenplan';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const RequestSchema = z.object({
  school: z.string().min(1, 'Schulnummer fehlt.'),
  user: z.string().min(1, 'Benutzername fehlt.'),
  pass: z.string().min(1, 'Passwort fehlt.'),
  date: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = RequestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ 
        error: result.error.issues[0].message 
      }, { status: 400 });
    }

    const { school, user, pass, date } = result.data;
    const data = await fetchStundenplan(school, user, pass, date);
    
    return NextResponse.json(data);
  } catch (e: any) {
    console.error('API Error:', e);
    return NextResponse.json({ 
      error: e.message || 'Interner Serverfehler beim Laden des Stundenplans.' 
    }, { status: 500 });
  }
}
