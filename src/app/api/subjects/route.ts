import { fetchStundenplan } from '@/lib/stundenplan';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const RequestSchema = z.object({
  school: z.string().min(1, 'Schulnummer fehlt.'),
  user: z.string().min(1, 'Benutzername fehlt.'),
  pass: z.string().min(1, 'Passwort fehlt.'),
  filterMode: z.enum(['class', 'room', 'teacher']),
  selectedValue: z.string().min(1, 'Auswahl fehlt.'),
});

function getPastWeekdays(daysCount: number): string[] {
  const dates: string[] = [];
  const curr = new Date();
  
  // Starting from today, gather the past N weekdays
  while (dates.length < daysCount) {
    const dayOfWeek = curr.getDay();
    // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const y = curr.getFullYear();
      const m = String(curr.getMonth() + 1).padStart(2, '0');
      const d = String(curr.getDate()).padStart(2, '0');
      dates.push(`${y}${m}${d}`);
    }
    curr.setDate(curr.getDate() - 1);
  }
  return dates;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = RequestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ 
        error: result.error.issues[0].message || 'Ungültige Anfrage.' 
      }, { status: 400 });
    }

    const { school, user, pass, filterMode, selectedValue } = result.data;
    
    // Fetch last 15 weekdays (3 weeks)
    const dates = getPastWeekdays(15);
    
    // Fetch all in parallel. fetchStundenplan might throw 401 or network errors.
    const settled = await Promise.allSettled(
      dates.map(dateStr => fetchStundenplan(school, user, pass, dateStr))
    );

    const subjectSet = new Set<string>();
    let authError = false;

    settled.forEach(res => {
      if (res.status === 'fulfilled') {
        res.value.entries.forEach(e => {
          let isMatch = false;
          if (filterMode === 'class') isMatch = e.class === selectedValue;
          else if (filterMode === 'room') isMatch = e.room === selectedValue;
          else if (filterMode === 'teacher') isMatch = e.teacher === selectedValue;
          
          if (isMatch && e.subject && e.subject !== '---') {
            subjectSet.add(e.subject);
          }
        });
      } else if (res.reason && res.reason.message && res.reason.message.includes('Ungültig')) {
        authError = true;
      }
    });

    if (subjectSet.size === 0 && authError) {
       return NextResponse.json({ 
         error: 'Ungültiger Benutzername oder Passwort.' 
       }, { status: 401 });
    }

    return NextResponse.json({
      subjects: Array.from(subjectSet).sort()
    });
  } catch (e: any) {
    console.error('API Error (Subjects):', e);
    return NextResponse.json({ 
      error: e.message || 'Interner Serverfehler beim Laden der Fächer.' 
    }, { status: 500 });
  }
}
