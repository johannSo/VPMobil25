'use client';

import { TimetableEntry } from '@/lib/types';
import { CheckCircle2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

export default function TimetableTable({ entries, showClassColumn }: TimetableTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y-2 divide-zinc-50 dark:divide-zinc-900">
        <tbody className="divide-y-2 divide-zinc-50 dark:divide-zinc-900 bg-white dark:bg-black">
          {entries.length === 0 ? (
            <tr>
              <td colSpan={showClassColumn ? 6 : 5} className="px-8 py-24 text-center">
                <div className="flex flex-col items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-zinc-100 dark:text-zinc-900" />
                  <p className="text-[11px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-widest">Keine besonderen Vorkommnisse</p>
                </div>
              </td>
            </tr>
          ) : (
            entries.map((e, i) => {
              const isCancelled = isCancelledEntry(e);

              return (
                <tr
                  key={i}
                  className={cn(
                    "border-b last:border-0",
                    isCancelled
                      ? 'border-red-200 bg-red-50/90 dark:border-red-950/60 dark:bg-red-950/20'
                      : 'border-zinc-50 dark:border-zinc-900/50'
                  )}
                >
                  <td className={cn(
                    "px-3 sm:px-8 py-4 sm:py-6 text-sm font-black italic w-12 text-center",
                    isCancelled ? 'text-red-700 dark:text-red-300' : 'text-black dark:text-white'
                  )}>{e.hour}</td>
                  <td className={cn(
                    "px-3 sm:px-8 py-4 sm:py-6 text-base font-black tracking-tighter italic min-w-[100px]",
                    isCancelled ? 'text-red-700 dark:text-red-300' : 'text-black dark:text-white'
                  )}>{e.subject}</td>
                  {showClassColumn && (
                    <td className={cn(
                      "px-3 sm:px-8 py-4 sm:py-6 text-xs font-bold",
                      isCancelled ? 'text-red-600 dark:text-red-300/90' : 'text-zinc-500 dark:text-zinc-400'
                    )}>{e.class}</td>
                  )}
                  <td className={cn(
                    "px-3 sm:px-8 py-4 sm:py-6 text-xs font-bold",
                    isCancelled ? 'text-red-600 dark:text-red-300/90' : 'text-zinc-500 dark:text-zinc-400'
                  )}>{e.teacher}</td>
                  <td className={cn(
                    "px-3 sm:px-8 py-4 sm:py-6 text-sm font-black text-center",
                    isCancelled
                      ? 'bg-red-100/80 text-red-700 dark:bg-red-950/40 dark:text-red-200'
                      : 'bg-zinc-50/30 text-black dark:bg-zinc-900/30 dark:text-white'
                  )}>{e.room}</td>
                  <td className={cn(
                    "px-3 sm:px-8 py-4 sm:py-6 text-xs italic font-bold leading-relaxed",
                    isCancelled ? 'text-red-600 dark:text-red-300/90' : 'text-zinc-400 dark:text-zinc-500'
                  )}>{e.info}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
