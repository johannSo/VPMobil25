'use client';

import { TimetableEntry } from '@/lib/types';
import { CheckCircle2, XCircle } from 'lucide-react';

interface TimetableTableProps {
  entries: TimetableEntry[];
  showClassColumn: boolean;
}

function isCancelledEntry(entry: TimetableEntry): boolean {
  const combinedText = `${entry.subject} ${entry.info} ${entry.teacher} ${entry.room}`.toLowerCase();
  return ['ausfall', 'entfall', 'fällt aus', 'faellt aus', 'cancel'].some(keyword =>
    combinedText.includes(keyword)
  );
}

function changeFlags(infoRaw: string) {
  const info = (infoRaw || '').toLowerCase();
  if (!info || info === '---') return { room: false, teacher: false, hour: false, class: false, subject: false };

  // Room changes often mention "raum", "zimmer", "r." or "geändert"
  const room = /(raum|r\.|zimmer)/.test(info);
  // Teacher changes: "für", "vertretung", "vtr", "lehr", "statt"
  const teacher = /(für|vertret|vtr|lehr)/.test(info);
  // Hour changes: "verlegt", "st.", "std", "zeit"
  const hour = /(verlegt|st\.|std|zeit|block|uhr)/.test(info);
  // Class changes: "klasse", "kurs", "kl.", "gruppe"
  const className = /(klasse|kurs|kl\.|gruppe)/.test(info);
  // Subject changes: "fach", "statt" (if not teacher)
  const subject = /fach/.test(info) || ( /statt/.test(info) && !teacher );

  return { room, teacher, hour, class: className, subject };
}

export default function TimetableTable({ entries, showClassColumn }: TimetableTableProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div
          className="flex items-center justify-center"
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
          }}
        >
          <CheckCircle2 className="w-7 h-7" strokeWidth={1.75} />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
            Keine Einträge
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Für diese Auswahl gibt es keine Vertretungen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto table-wrap">
      <table
        className="w-full"
        style={{ borderCollapse: 'collapse' }}
        role="table"
        aria-label="Vertretungsplan"
      >
        {/* Accessible column headers (visually hidden) */}
        <thead className="sr-only">
          <tr>
            <th scope="col">Stunde</th>
            <th scope="col">Fach</th>
            {showClassColumn && <th scope="col">Klasse</th>}
            <th scope="col">Lehrer</th>
            <th scope="col">Raum</th>
            <th scope="col">Info</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => {
            const cancelled = isCancelledEntry(e);
            const flags = changeFlags(e.info);
            
            // Combine textual flags with direct flags from data
            const roomChanged = flags.room || e.roomChanged;
            const teacherChanged = flags.teacher || e.teacherChanged;
            const hourChanged = flags.hour || e.hourChanged;
            const classChanged = flags.class; // Usually not in XML flags
            const subjectChanged = flags.subject || e.subjectChanged;
            
            const isLast = i === entries.length - 1;

            // Use a specific red color if var might be failing
            const redColor = '#F7768E';

            return (
              <tr
                key={i}
                className={`table-row ${cancelled ? 'cancelled' : ''}`}
                style={{
                  borderBottom: isLast ? 'none' : `1px solid ${cancelled ? 'var(--color-danger-border)' : 'var(--color-border-subtle)'}`,
                }}
              >
                {/* Hour */}
                <td
                  className="text-center font-bold text-base"
                  style={{
                    padding: '1rem 0.75rem 1rem 1.25rem',
                    color: cancelled || hourChanged ? redColor : 'var(--color-text)',
                    width: 52,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {e.hour}
                </td>

                {/* Subject */}
                <td
                  style={{
                    padding: '1rem 1rem',
                    minWidth: 100,
                  }}
                >
                  <div className="flex items-center gap-2">
                    {cancelled && (
                      <XCircle
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: redColor }}
                        strokeWidth={2}
                        aria-label="Ausfall"
                      />
                    )}
                    <span
                      className="font-semibold text-base"
                      style={{
                        color: cancelled || subjectChanged ? redColor : 'var(--color-text)',
                        textDecorationLine: cancelled ? 'line-through' : 'none',
                        textDecorationColor: redColor,
                      }}
                    >
                      {e.subject}
                    </span>
                  </div>
                </td>

                {/* Class (conditional) */}
                {showClassColumn && (
                  <td
                    className="text-sm font-medium"
                    style={{
                      padding: '1rem 1rem',
                      color: cancelled || classChanged ? redColor : 'var(--color-text-secondary)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {e.class}
                  </td>
                )}

                {/* Teacher */}
                <td
                  className="text-sm font-medium"
                  style={{
                    padding: '1rem 1rem',
                    color: cancelled || teacherChanged ? redColor : 'var(--color-text-secondary)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {e.teacher}
                </td>

                {/* Room */}
                <td
                  className="text-sm font-semibold"
                  style={{
                    padding: '1rem 1rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span
                    className="badge"
                    style={{
                      background: cancelled || roomChanged ? 'var(--color-danger-bg)' : 'var(--color-primary-light)',
                      color: cancelled || roomChanged ? redColor : 'var(--color-primary)',
                      border: cancelled || roomChanged ? `1px solid var(--color-danger-border)` : 'none',
                    }}
                  >
                    {e.room}
                  </span>
                </td>

                {/* Info */}
                <td
                  className="text-sm"
                  style={{
                    padding: '1rem 1.25rem 1rem 0.75rem',
                    color: cancelled ? redColor : 'var(--color-text-secondary)',
                    fontStyle: e.info && e.info !== '---' ? 'normal' : 'italic',
                    maxWidth: 260,
                  }}
                >
                  {e.info || ''}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}


