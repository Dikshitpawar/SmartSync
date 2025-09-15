export interface Batch {
  id: string
  name: string
  year: number
  divisions: Division[]
  subjects: BatchSubject[] // subjects specific to this batch
}

export interface Division {
  id: string
  name: string
  batchId: string
  studentCount: number
}

export interface Subject {
  id: string
  name: string
  code: string
  type: "lecture" | "lab" | "both"
  frequency: number // times per week
  priority: "high" | "medium" | "low"
  lectureHours: number // hours per session
  labHours: number // hours per session (usually 2)
  requiresSpecialRoom?: boolean
  roomType?: "classroom" | "lab" | "auditorium"
}

export interface Faculty {
  id: string
  name: string
  email: string
  subjects: string[] // subject IDs they can teach
  maxHoursPerDay: number
  maxHoursPerWeek: number
  unavailableSlots: string[] // format: "day-slot" e.g., "monday-1"
  preferredSlots?: string[]
}

export interface Room {
  id: string
  name: string
  type: "classroom" | "lab" | "auditorium"
  capacity: number
  equipment?: string[]
}

export interface ScheduleConfig {
  workingDays: string[] // ["monday", "tuesday", ...]
  slotsPerDay: number
  slotDuration: number // in minutes
  breakSlots: number[] // slot numbers that are breaks
  lunchSlot?: number
  startTime: string // "09:00"
}

export interface TimetableData {
  batches: Batch[]
  faculty: Faculty[]
  rooms: Room[]
  scheduleConfig: ScheduleConfig
}

export interface BatchSubject {
  id: string
  name: string
  code: string
  type: "lecture" | "lab" | "both"
  frequency: number // times per week
  priority: "high" | "medium" | "low"
  lectureHours: number // hours per session
  labHours: number // hours per session (usually 2)
  requiresSpecialRoom?: boolean
  roomType?: "classroom" | "lab" | "auditorium"
  assignedFaculty: SubjectFacultyAssignment[] // faculty assigned to teach this subject
}

export interface SubjectFacultyAssignment {
  facultyId: string
  type: "lecture" | "lab" | "both"
  divisionIds?: string[] // if empty, applies to all divisions in the batch
}

export interface TimetableEntry {
  id: string
  day: string
  slot: number
  batchId: string
  divisionId: string
  subject: Subject
  faculty: Faculty
  room: Room
  type: "lecture" | "lab"
  duration: number // number of continuous slots
}

export interface BatchTimetable {
  batchId: string
  divisionId: string
  entries: TimetableEntry[]
}

export interface FacultyTimetable {
  facultyId: string
  entries: TimetableEntry[]
  totalHours: number
  dailyHours: { [day: string]: number }
}

export interface GeneratedTimetable {
  batchTimetables: BatchTimetable[]
  facultyTimetables: FacultyTimetable[]
  conflicts: Conflict[]
  statistics: TimetableStatistics
  roomUtilization: RoomUtilization[]
}

export interface Conflict {
  type: "faculty_clash" | "room_clash" | "overload" | "constraint_violation"
  message: string
  severity: "high" | "medium" | "low"
  affectedEntries: string[] // entry IDs
}

export interface TimetableStatistics {
  totalBatches: number
  totalDivisions: number
  totalSubjects: number
  totalFaculty: number
  totalHours: number
  averageFacultyLoad: number
  roomUtilizationPercentage: number
  conflictCount: number
  successRate: number
}

export interface RoomUtilization {
  roomId: string
  roomName: string
  totalSlots: number
  occupiedSlots: number
  utilizationPercentage: number
  schedule: { [day: string]: { [slot: number]: string } } // subject name
}

export type ViewMode = "batch" | "faculty" | "room" | "conflicts"
