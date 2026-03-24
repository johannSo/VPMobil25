export type FilterMode = 'class' | 'room' | 'teacher';

export interface TimetableEntry {
  class: string;
  hour: string;
  subject: string;
  teacher: string;
  room: string;
  info: string;
}

export interface TimetableData {
  title: string;
  date: string;
  entries: TimetableEntry[];
  availableClasses: string[];
  availableRooms: string[];
  availableTeachers: string[];
  currentDateStr: string;
  dayNotes?: string[];
  isWeekend?: boolean;
}

export interface Favorite {
  mode: FilterMode;
  value: string;
}

export interface Credentials {
  school: string;
  user: string;
  pass: string;
}

export interface SearchItem {
  id: string;
  name: string;
  type: FilterMode;
}
