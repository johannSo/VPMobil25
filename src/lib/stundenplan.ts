import { parseStringPromise } from 'xml2js';
import { TimetableData, TimetableEntry } from './types';

const FALLBACK_VALUE = '---';

function getFallbackDate(dateStr: string): string {
  const y = parseInt(dateStr.slice(0, 4));
  const m = parseInt(dateStr.slice(4, 6)) - 1;
  const d = parseInt(dateStr.slice(6, 8));
  const date = new Date(y, m, d);
  return date.toLocaleDateString('de-DE', { 
    weekday: 'long', 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
}

function cleanValue(val: any): string {
  const actualVal = typeof val === 'string' ? val : (val?._ || '');
  if (!actualVal || actualVal === '&nbsp;' || actualVal.trim() === '' || actualVal === FALLBACK_VALUE) {
    return FALLBACK_VALUE;
  }
  return actualVal.trim();
}

export async function fetchStundenplan(
  school: string,
  user: string,
  pass: string,
  dateStr?: string
): Promise<TimetableData> {
  let targetDateStr = dateStr;
  if (!targetDateStr) {
    const now = new Date();
    targetDateStr = now.toISOString().split('T')[0].replace(/-/g, '');
  }
  
  const url = `https://www.stundenplan24.de/${school}/wplan/wdatenk/WPlanKl_${targetDateStr}.xml`;
  const credentials = Buffer.from(`${user}:${pass}`).toString('base64');

  try {
    const response = await fetch(url, {
      headers: { 'Authorization': `Basic ${credentials}` },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Ungültiger Benutzername oder Passwort.');
      }
      
      const y = parseInt(targetDateStr.slice(0, 4));
      const m = parseInt(targetDateStr.slice(4, 6)) - 1;
      const d = parseInt(targetDateStr.slice(6, 8));
      const dayOfWeek = new Date(y, m, d).getDay(); // 0 = Sunday, 6 = Saturday
      
      return {
        title: 'Stundenplan',
        date: getFallbackDate(targetDateStr),
        entries: [],
        availableClasses: [],
        availableRooms: [],
        availableTeachers: [],
        currentDateStr: targetDateStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      };
    }

    const xml = await response.text();
    const result = await parseStringPromise(xml);

    const kopf = result.WplanVp?.Kopf?.[0] || {};
    const datum = kopf.DatumPlan?.[0] || 'Unbekanntes Datum';
    const zeitstempel = kopf.zeitstempel?.[0] || '';

    const dayNotes: string[] = [];
    
    // Extract notes from ZusatzInfo and FreieTexte
    const zusatzInfoLines = result.WplanVp?.ZusatzInfo?.[0]?.ZiZeile || [];
    const freieTexte = result.WplanVp?.FreieTexte?.[0]?.Ft || [];

    [...zusatzInfoLines, ...freieTexte].forEach(line => {
      const text = cleanValue(line);
      if (text !== FALLBACK_VALUE && !dayNotes.includes(text)) {
        dayNotes.push(text);
      }
    });

    const entries: TimetableEntry[] = [];
    const classSet = new Set<string>();
    const roomSet = new Set<string>();
    const teacherSet = new Set<string>();

    const klassen = result.WplanVp?.Klassen?.[0]?.Kl || [];

    for (const kl of klassen) {
      const className = cleanValue(kl.Kurz?.[0]);
      if (className !== FALLBACK_VALUE) classSet.add(className);
      
      const stunden = kl.Pl?.[0]?.Std || [];

      for (const std of stunden) {
        const entry: TimetableEntry = {
          class: className,
          hour: cleanValue(std.St?.[0]),
          subject: cleanValue(std.Fa?.[0]),
          teacher: cleanValue(std.Le?.[0]),
          room: cleanValue(std.Ra?.[0]),
          info: cleanValue(std.If?.[0]),
        };
        
        entries.push(entry);
        if (entry.room !== FALLBACK_VALUE) roomSet.add(entry.room);
        if (entry.teacher !== FALLBACK_VALUE) teacherSet.add(entry.teacher);
      }
    }

    return {
      title: 'Stundenplan',
      date: `${datum} (Aktualisiert: ${zeitstempel})`,
      entries,
      availableClasses: Array.from(classSet).sort(),
      availableRooms: Array.from(roomSet).sort(),
      availableTeachers: Array.from(teacherSet).sort(),
      currentDateStr: targetDateStr,
      dayNotes: dayNotes.length > 0 ? dayNotes : undefined,
    };
  } catch (error: any) {
    if (error.message.includes('fetch')) {
      throw new Error('Verbindung zum Server fehlgeschlagen.');
    }
    throw error;
  }
}

