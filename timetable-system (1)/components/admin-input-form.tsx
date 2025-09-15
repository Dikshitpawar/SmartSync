"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Users, BookOpen, MapPin, Clock, Loader2 } from "lucide-react"
import type { TimetableData, Subject, Teacher, Room, TimeSlot } from "@/types/timetable"

interface AdminInputFormProps {
  onSubmit: (data: TimetableData) => void
  isGenerating: boolean
  onReset: () => void
}

export function AdminInputForm({ onSubmit, isGenerating, onReset }: AdminInputFormProps) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])

  // Form states for adding new items
  const [newSubject, setNewSubject] = useState({ name: "", code: "", hoursPerWeek: 3, requiresLab: false })
  const [newTeacher, setNewTeacher] = useState({ name: "", subjects: [] as string[], maxHoursPerDay: 6 })
  const [newRoom, setNewRoom] = useState({ name: "", type: "classroom" as const, capacity: 30 })

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  const timeOptions = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"]

  // Initialize with default time slots
  useState(() => {
    const defaultSlots: TimeSlot[] = []
    days.forEach((day) => {
      timeOptions.forEach((time, index) => {
        if (index < timeOptions.length - 1) {
          defaultSlots.push({
            id: `${day.toLowerCase()}-${time}`,
            day,
            startTime: time,
            endTime: timeOptions[index + 1],
            duration: 60,
          })
        }
      })
    })
    setTimeSlots(defaultSlots)
  })

  const addSubject = () => {
    if (newSubject.name && newSubject.code) {
      setSubjects([...subjects, { ...newSubject, id: Date.now().toString() }])
      setNewSubject({ name: "", code: "", hoursPerWeek: 3, requiresLab: false })
    }
  }

  const addTeacher = () => {
    if (newTeacher.name) {
      setTeachers([...teachers, { ...newTeacher, id: Date.now().toString(), unavailableSlots: [] }])
      setNewTeacher({ name: "", subjects: [], maxHoursPerDay: 6 })
    }
  }

  const addRoom = () => {
    if (newRoom.name) {
      setRooms([...rooms, { ...newRoom, id: Date.now().toString() }])
      setNewRoom({ name: "", type: "classroom", capacity: 30 })
    }
  }

  const handleSubmit = () => {
    const data: TimetableData = {
      subjects,
      teachers,
      rooms,
      timeSlots,
      constraints: {
        maxSubjectsPerDay: 6,
        breakDuration: 15,
        lunchBreakStart: "12:00",
        lunchBreakEnd: "14:00",
      },
    }
    onSubmit(data)
  }

  const isFormValid = subjects.length > 0 && teachers.length > 0 && rooms.length > 0

  return (
    <div className="space-y-6">
      <Tabs defaultValue="subjects" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="subjects" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Subjects
          </TabsTrigger>
          <TabsTrigger value="teachers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Teachers
          </TabsTrigger>
          <TabsTrigger value="rooms" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Rooms
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Schedule
          </TabsTrigger>
        </TabsList>

        {/* Subjects Tab */}
        <TabsContent value="subjects">
          <Card>
            <CardHeader>
              <CardTitle>Subjects Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="subject-name">Subject Name</Label>
                  <Input
                    id="subject-name"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                    placeholder="e.g., Data Structures"
                  />
                </div>
                <div>
                  <Label htmlFor="subject-code">Subject Code</Label>
                  <Input
                    id="subject-code"
                    value={newSubject.code}
                    onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                    placeholder="e.g., CS201"
                  />
                </div>
                <div>
                  <Label htmlFor="hours-per-week">Hours/Week</Label>
                  <Input
                    id="hours-per-week"
                    type="number"
                    value={newSubject.hoursPerWeek}
                    onChange={(e) => setNewSubject({ ...newSubject, hoursPerWeek: Number.parseInt(e.target.value) })}
                    min="1"
                    max="10"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addSubject} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subject
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requires-lab"
                  checked={newSubject.requiresLab}
                  onCheckedChange={(checked) => setNewSubject({ ...newSubject, requiresLab: !!checked })}
                />
                <Label htmlFor="requires-lab">Requires Lab Session</Label>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Added Subjects ({subjects.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((subject) => (
                    <Badge key={subject.id} variant="secondary" className="flex items-center gap-2">
                      {subject.code} - {subject.name} ({subject.hoursPerWeek}h)
                      {subject.requiresLab && <span className="text-xs">+Lab</span>}
                      <button
                        onClick={() => setSubjects(subjects.filter((s) => s.id !== subject.id))}
                        className="ml-1 hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teachers Tab */}
        <TabsContent value="teachers">
          <Card>
            <CardHeader>
              <CardTitle>Teachers Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="teacher-name">Teacher Name</Label>
                  <Input
                    id="teacher-name"
                    value={newTeacher.name}
                    onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                    placeholder="e.g., Dr. Smith"
                  />
                </div>
                <div>
                  <Label htmlFor="max-hours">Max Hours/Day</Label>
                  <Input
                    id="max-hours"
                    type="number"
                    value={newTeacher.maxHoursPerDay}
                    onChange={(e) => setNewTeacher({ ...newTeacher, maxHoursPerDay: Number.parseInt(e.target.value) })}
                    min="1"
                    max="8"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addTeacher} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Teacher
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Added Teachers ({teachers.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {teachers.map((teacher) => (
                    <Badge key={teacher.id} variant="secondary" className="flex items-center gap-2">
                      {teacher.name} (Max: {teacher.maxHoursPerDay}h/day)
                      <button
                        onClick={() => setTeachers(teachers.filter((t) => t.id !== teacher.id))}
                        className="ml-1 hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rooms Tab */}
        <TabsContent value="rooms">
          <Card>
            <CardHeader>
              <CardTitle>Rooms Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="room-name">Room Name</Label>
                  <Input
                    id="room-name"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                    placeholder="e.g., Room 101"
                  />
                </div>
                <div>
                  <Label htmlFor="room-type">Room Type</Label>
                  <Select value={newRoom.type} onValueChange={(value: any) => setNewRoom({ ...newRoom, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classroom">Classroom</SelectItem>
                      <SelectItem value="lab">Laboratory</SelectItem>
                      <SelectItem value="auditorium">Auditorium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom({ ...newRoom, capacity: Number.parseInt(e.target.value) })}
                    min="10"
                    max="200"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addRoom} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Room
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Added Rooms ({rooms.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {rooms.map((room) => (
                    <Badge key={room.id} variant="secondary" className="flex items-center gap-2">
                      {room.name} ({room.type}, {room.capacity} seats)
                      <button
                        onClick={() => setRooms(rooms.filter((r) => r.id !== room.id))}
                        className="ml-1 hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {days.map((day) => (
                    <div key={day} className="text-center">
                      <h4 className="font-medium mb-2">{day}</h4>
                      <div className="text-sm text-muted-foreground">
                        {timeSlots.filter((slot) => slot.day === day).length} slots
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  Default schedule: 9:00 AM - 5:00 PM with lunch break from 12:00 PM - 2:00 PM
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6">
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || isGenerating}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Timetable...
            </>
          ) : (
            "Generate Timetable"
          )}
        </Button>
        <Button onClick={onReset} variant="outline" disabled={isGenerating} size="lg">
          Reset All
        </Button>
      </div>

      {!isFormValid && (
        <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
          Please add at least one subject, teacher, and room to generate a timetable.
        </div>
      )}
    </div>
  )
}
