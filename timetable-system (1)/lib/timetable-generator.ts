import type { TimetableData, GeneratedTimetable, TimetableEntry } from "@/types/timetable"

export function generateTimetable(data: TimetableData): GeneratedTimetable {
  const entries: TimetableEntry[] = []
  const conflicts: string[] = []
  const usedSlots = new Set<string>() // Format: "day-time-room"
  const teacherSchedule = new Map<string, string[]>() // teacherId -> occupied slots

  // Initialize teacher schedules
  data.teachers.forEach((teacher) => {
    teacherSchedule.set(teacher.id, [])
  })

  // Sort subjects by hours per week (descending) for better allocation
  const sortedSubjects = [...data.subjects].sort((a, b) => b.hoursPerWeek - a.hoursPerWeek)

  for (const subject of sortedSubjects) {
    let allocatedHours = 0
    const targetHours = subject.hoursPerWeek

    // Find available teachers for this subject
    const availableTeachers = data.teachers.filter(
      (teacher) => teacher.subjects.includes(subject.id) || teacher.subjects.length === 0,
    )

    if (availableTeachers.length === 0) {
      conflicts.push(`No teachers available for ${subject.name}`)
      continue
    }

    // Try to allocate hours for this subject
    for (const timeSlot of data.timeSlots) {
      if (allocatedHours >= targetHours) break

      // Skip lunch break slots
      if (
        timeSlot.startTime >= data.constraints.lunchBreakStart &&
        timeSlot.startTime < data.constraints.lunchBreakEnd
      ) {
        continue
      }

      // Find available teacher
      const availableTeacher = availableTeachers.find((teacher) => {
        const teacherSlots = teacherSchedule.get(teacher.id) || []
        const slotKey = `${timeSlot.day}-${timeSlot.startTime}`

        // Check if teacher is available and hasn't exceeded daily limit
        const dailySlots = teacherSlots.filter((slot) => slot.startsWith(timeSlot.day))
        return (
          !teacherSlots.includes(slotKey) &&
          dailySlots.length < teacher.maxHoursPerDay &&
          !teacher.unavailableSlots.includes(slotKey)
        )
      })

      if (!availableTeacher) continue

      // Find available room
      const roomType = subject.requiresLab ? "lab" : "classroom"
      const availableRoom = data.rooms.find((room) => {
        const roomSlotKey = `${timeSlot.day}-${timeSlot.startTime}-${room.id}`
        return (room.type === roomType || room.type === "auditorium") && !usedSlots.has(roomSlotKey)
      })

      if (!availableRoom) {
        if (allocatedHours === 0) {
          conflicts.push(`No ${roomType} available for ${subject.name}`)
        }
        continue
      }

      // Create timetable entry
      const entry: TimetableEntry = {
        id: `${subject.id}-${timeSlot.id}-${Date.now()}`,
        day: timeSlot.day,
        timeSlot: `${timeSlot.startTime} - ${timeSlot.endTime}`,
        subject,
        teacher: availableTeacher,
        room: availableRoom,
        type: subject.requiresLab ? "lab" : "lecture",
      }

      entries.push(entry)

      // Mark slot as used
      const roomSlotKey = `${timeSlot.day}-${timeSlot.startTime}-${availableRoom.id}`
      const teacherSlotKey = `${timeSlot.day}-${timeSlot.startTime}`

      usedSlots.add(roomSlotKey)
      teacherSchedule.get(availableTeacher.id)?.push(teacherSlotKey)

      allocatedHours++
    }

    // Check if we couldn't allocate enough hours
    if (allocatedHours < targetHours) {
      conflicts.push(`${subject.name}: Only allocated ${allocatedHours}/${targetHours} hours`)
    }
  }

  // Calculate statistics
  const totalHours = entries.length
  const totalRoomSlots = data.rooms.length * data.timeSlots.length
  const usedRoomSlots = usedSlots.size
  const roomUtilization = (usedRoomSlots / totalRoomSlots) * 100

  const teacherWorkload: { [teacherId: string]: number } = {}
  data.teachers.forEach((teacher) => {
    teacherWorkload[teacher.id] = teacherSchedule.get(teacher.id)?.length || 0
  })

  return {
    entries,
    conflicts,
    statistics: {
      totalHours,
      roomUtilization,
      teacherWorkload,
    },
  }
}
