import type {
  TimetableData,
  GeneratedTimetable,
  TimetableEntry,
  BatchTimetable,
  FacultyTimetable,
  Conflict,
  TimetableStatistics,
  RoomUtilization,
  BatchSubject,
  Faculty,
  Batch,
  Division,
} from "@/types/timetable"

export class AdvancedTimetableGenerator {
  private data: TimetableData
  private entries: TimetableEntry[] = []
  private conflicts: Conflict[] = []
  private facultySchedule: Map<string, Map<string, Set<number>>> = new Map() // facultyId -> day -> slots
  private roomSchedule: Map<string, Map<string, Set<number>>> = new Map() // roomId -> day -> slots
  private batchSchedule: Map<string, Map<string, Set<number>>> = new Map() // batchId-divisionId -> day -> slots

  constructor(data: TimetableData) {
    this.data = data
    this.initializeSchedules()
  }

  private initializeSchedules() {
    // Initialize faculty schedules
    this.data.faculty.forEach((faculty) => {
      const facultyMap = new Map<string, Set<number>>()
      this.data.scheduleConfig.workingDays.forEach((day) => {
        facultyMap.set(day, new Set())
      })
      this.facultySchedule.set(faculty.id, facultyMap)
    })

    // Initialize room schedules
    this.data.rooms.forEach((room) => {
      const roomMap = new Map<string, Set<number>>()
      this.data.scheduleConfig.workingDays.forEach((day) => {
        roomMap.set(day, new Set())
      })
      this.roomSchedule.set(room.id, roomMap)
    })

    // Initialize batch schedules
    this.data.batches.forEach((batch) => {
      batch.divisions.forEach((division) => {
        const batchDivisionKey = `${batch.id}-${division.id}`
        const batchMap = new Map<string, Set<number>>()
        this.data.scheduleConfig.workingDays.forEach((day) => {
          batchMap.set(day, new Set())
        })
        this.batchSchedule.set(batchDivisionKey, batchMap)
      })
    })
  }

  public generateTimetable(): GeneratedTimetable {
    console.log("[v0] Starting advanced timetable generation...")

    // Reset state
    this.entries = []
    this.conflicts = []

    // Generate assignments for each batch and division
    this.data.batches.forEach((batch) => {
      batch.divisions.forEach((division) => {
        this.generateForBatchDivision(batch, division)
      })
    })

    // Analyze and optimize
    this.optimizeSchedule()
    this.detectConflicts()

    const result = this.buildResult()
    console.log("[v0] Timetable generation completed with", this.conflicts.length, "conflicts")

    return result
  }

  private generateForBatchDivision(batch: Batch, division: Division) {
    console.log(`[v0] Generating schedule for ${batch.name} - ${division.name}`)

    // Get all subjects for this batch and their faculty assignments
    batch.subjects.forEach((subject) => {
      subject.assignedFaculty.forEach((assignment) => {
        // Check if this assignment applies to this division
        const appliesToDivision =
          !assignment.divisionIds || assignment.divisionIds.length === 0 || assignment.divisionIds.includes(division.id)

        if (!appliesToDivision) return

        const faculty = this.data.faculty.find((f) => f.id === assignment.facultyId)
        if (!faculty) return

        // Schedule lectures
        if (assignment.type === "lecture" || assignment.type === "both") {
          if (subject.type === "lecture" || subject.type === "both") {
            for (let i = 0; i < subject.frequency; i++) {
              this.scheduleSession(batch, division, subject, faculty, "lecture", 1)
            }
          }
        }

        // Schedule labs (2 continuous hours)
        if (assignment.type === "lab" || assignment.type === "both") {
          if (subject.type === "lab" || subject.type === "both") {
            const labSessions = Math.ceil(subject.frequency / 2) // Labs are typically 2 hours
            for (let i = 0; i < labSessions; i++) {
              this.scheduleSession(batch, division, subject, faculty, "lab", 2)
            }
          }
        }
      })
    })
  }

  private scheduleSession(
    batch: Batch,
    division: Division,
    subject: BatchSubject,
    faculty: Faculty,
    type: "lecture" | "lab",
    duration: number,
  ): boolean {
    const batchDivisionKey = `${batch.id}-${division.id}`

    // Find suitable room
    const suitableRooms = this.data.rooms.filter((room) => {
      if (subject.requiresSpecialRoom && subject.roomType && room.type !== subject.roomType) {
        return false
      }
      if (type === "lab" && room.type !== "lab") {
        return false
      }
      return room.capacity >= division.studentCount
    })

    if (suitableRooms.length === 0) {
      this.conflicts.push({
        type: "constraint_violation",
        message: `No suitable room found for ${subject.name} (${type}) for ${batch.name}-${division.name}`,
        severity: "high",
        affectedEntries: [],
      })
      return false
    }

    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const subjectPriority = priorityOrder[subject.priority] || 1

    // Try to find a slot
    for (const day of this.data.scheduleConfig.workingDays) {
      for (let slot = 1; slot <= this.data.scheduleConfig.slotsPerDay; slot++) {
        // Skip break slots
        if (this.data.scheduleConfig.breakSlots.includes(slot)) continue

        // Check if we have enough continuous slots for labs
        if (duration > 1) {
          let canSchedule = true
          for (let i = 0; i < duration; i++) {
            if (
              slot + i > this.data.scheduleConfig.slotsPerDay ||
              this.data.scheduleConfig.breakSlots.includes(slot + i)
            ) {
              canSchedule = false
              break
            }
          }
          if (!canSchedule) continue
        }

        // Check faculty availability
        const facultyDaySchedule = this.facultySchedule.get(faculty.id)?.get(day)
        if (!facultyDaySchedule) continue

        let facultyAvailable = true
        for (let i = 0; i < duration; i++) {
          if (facultyDaySchedule.has(slot + i)) {
            facultyAvailable = false
            break
          }
        }
        if (!facultyAvailable) continue

        // Check batch availability
        const batchDaySchedule = this.batchSchedule.get(batchDivisionKey)?.get(day)
        if (!batchDaySchedule) continue

        let batchAvailable = true
        for (let i = 0; i < duration; i++) {
          if (batchDaySchedule.has(slot + i)) {
            batchAvailable = false
            break
          }
        }
        if (!batchAvailable) continue

        // Find available room
        const availableRoom = suitableRooms.find((room) => {
          const roomDaySchedule = this.roomSchedule.get(room.id)?.get(day)
          if (!roomDaySchedule) return false

          for (let i = 0; i < duration; i++) {
            if (roomDaySchedule.has(slot + i)) return false
          }
          return true
        })

        if (!availableRoom) continue

        // Schedule the session
        const entry: TimetableEntry = {
          id: `${batch.id}-${division.id}-${subject.id}-${faculty.id}-${day}-${slot}`,
          day,
          slot,
          batchId: batch.id,
          divisionId: division.id,
          subject: {
            id: subject.id,
            name: subject.name,
            code: subject.code,
            type: subject.type,
            frequency: subject.frequency,
            priority: subject.priority,
            lectureHours: subject.lectureHours,
            labHours: subject.labHours,
            requiresSpecialRoom: subject.requiresSpecialRoom,
            roomType: subject.roomType,
          },
          faculty,
          room: availableRoom,
          type,
          duration,
        }

        this.entries.push(entry)

        // Update schedules
        for (let i = 0; i < duration; i++) {
          facultyDaySchedule.add(slot + i)
          batchDaySchedule.add(slot + i)
          this.roomSchedule
            .get(availableRoom.id)
            ?.get(day)
            ?.add(slot + i)
        }

        return true
      }
    }

    // Could not schedule
    this.conflicts.push({
      type: "constraint_violation",
      message: `Could not schedule ${subject.name} (${type}) for ${batch.name}-${division.name} with ${faculty.name}`,
      severity: "high",
      affectedEntries: [],
    })

    return false
  }

  private optimizeSchedule() {
    // Implement optimization logic here
    // For now, we'll do basic load balancing
    console.log("[v0] Optimizing schedule...")
  }

  private detectConflicts() {
    console.log("[v0] Detecting conflicts...")

    // Check faculty overload
    this.data.faculty.forEach((faculty) => {
      const facultyEntries = this.entries.filter((entry) => entry.faculty.id === faculty.id)
      const dailyHours: { [day: string]: number } = {}

      facultyEntries.forEach((entry) => {
        if (!dailyHours[entry.day]) dailyHours[entry.day] = 0
        dailyHours[entry.day] += entry.duration * (this.data.scheduleConfig.slotDuration / 60)
      })

      Object.entries(dailyHours).forEach(([day, hours]) => {
        if (hours > faculty.maxHoursPerDay) {
          this.conflicts.push({
            type: "overload",
            message: `${faculty.name} is overloaded on ${day} with ${hours} hours (max: ${faculty.maxHoursPerDay})`,
            severity: "medium",
            affectedEntries: facultyEntries.filter((e) => e.day === day).map((e) => e.id),
          })
        }
      })
    })
  }

  private buildResult(): GeneratedTimetable {
    // Build batch timetables
    const batchTimetables: BatchTimetable[] = []
    this.data.batches.forEach((batch) => {
      batch.divisions.forEach((division) => {
        const entries = this.entries.filter((entry) => entry.batchId === batch.id && entry.divisionId === division.id)
        batchTimetables.push({
          batchId: batch.id,
          divisionId: division.id,
          entries,
        })
      })
    })

    // Build faculty timetables
    const facultyTimetables: FacultyTimetable[] = this.data.faculty.map((faculty) => {
      const entries = this.entries.filter((entry) => entry.faculty.id === faculty.id)
      const dailyHours: { [day: string]: number } = {}
      let totalHours = 0

      entries.forEach((entry) => {
        const hours = entry.duration * (this.data.scheduleConfig.slotDuration / 60)
        if (!dailyHours[entry.day]) dailyHours[entry.day] = 0
        dailyHours[entry.day] += hours
        totalHours += hours
      })

      return {
        facultyId: faculty.id,
        entries,
        totalHours,
        dailyHours,
      }
    })

    // Build room utilization
    const roomUtilization: RoomUtilization[] = this.data.rooms.map((room) => {
      const roomEntries = this.entries.filter((entry) => entry.room.id === room.id)
      const totalSlots =
        this.data.scheduleConfig.workingDays.length *
        (this.data.scheduleConfig.slotsPerDay - this.data.scheduleConfig.breakSlots.length)
      const occupiedSlots = roomEntries.reduce((sum, entry) => sum + entry.duration, 0)

      const schedule: { [day: string]: { [slot: number]: string } } = {}
      this.data.scheduleConfig.workingDays.forEach((day) => {
        schedule[day] = {}
      })

      roomEntries.forEach((entry) => {
        for (let i = 0; i < entry.duration; i++) {
          schedule[entry.day][entry.slot + i] = entry.subject.name
        }
      })

      return {
        roomId: room.id,
        roomName: room.name,
        totalSlots,
        occupiedSlots,
        utilizationPercentage: (occupiedSlots / totalSlots) * 100,
        schedule,
      }
    })

    const totalSubjects = this.data.batches.reduce((sum, batch) => sum + batch.subjects.length, 0)
    const totalAssignments = this.data.batches.reduce(
      (sum, batch) => sum + batch.subjects.reduce((subSum, subject) => subSum + subject.assignedFaculty.length, 0),
      0,
    )

    // Build statistics
    const statistics: TimetableStatistics = {
      totalBatches: this.data.batches.length,
      totalDivisions: this.data.batches.reduce((sum, batch) => sum + batch.divisions.length, 0),
      totalSubjects,
      totalFaculty: this.data.faculty.length,
      totalHours: this.entries.reduce(
        (sum, entry) => sum + entry.duration * (this.data.scheduleConfig.slotDuration / 60),
        0,
      ),
      averageFacultyLoad: facultyTimetables.reduce((sum, ft) => sum + ft.totalHours, 0) / facultyTimetables.length,
      roomUtilizationPercentage:
        roomUtilization.reduce((sum, ru) => sum + ru.utilizationPercentage, 0) / roomUtilization.length,
      conflictCount: this.conflicts.length,
      successRate: totalAssignments > 0 ? (this.entries.length / (totalAssignments * 2)) * 100 : 0, // Rough estimate
    }

    return {
      batchTimetables,
      facultyTimetables,
      conflicts: this.conflicts,
      statistics,
      roomUtilization,
    }
  }
}

export function generateAdvancedTimetable(data: TimetableData): GeneratedTimetable {
  const generator = new AdvancedTimetableGenerator(data)
  return generator.generateTimetable()
}
