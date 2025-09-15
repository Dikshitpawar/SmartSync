"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Plus, Users, UserCheck, Building, Settings } from "lucide-react"
import type {
  TimetableData,
  Batch,
  Division,
  BatchSubject,
  SubjectFacultyAssignment,
  Faculty,
  Room,
  ScheduleConfig,
} from "@/types/timetable"

interface AdvancedAdminFormProps {
  onSubmit: (data: TimetableData) => void
  isGenerating: boolean
  onReset: () => void
}

export function AdvancedAdminForm({ onSubmit, isGenerating, onReset }: AdvancedAdminFormProps) {
  const [batches, setBatches] = useState<Batch[]>([])
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>({
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    slotsPerDay: 8,
    slotDuration: 60,
    breakSlots: [4, 7],
    lunchSlot: 4,
    startTime: "09:00",
  })

  const addBatch = () => {
    const newBatch: Batch = {
      id: `batch-${Date.now()}`,
      name: "",
      year: 1,
      divisions: [],
      subjects: [],
    }
    setBatches([...batches, newBatch])
  }

  const updateBatch = (id: string, updates: Partial<Batch>) => {
    setBatches(batches.map((batch) => (batch.id === id ? { ...batch, ...updates } : batch)))
  }

  const deleteBatch = (id: string) => {
    setBatches(batches.filter((batch) => batch.id !== id))
  }

  const addDivision = (batchId: string) => {
    const newDivision: Division = {
      id: `division-${Date.now()}`,
      name: "",
      batchId,
      studentCount: 0,
    }
    setBatches(
      batches.map((batch) =>
        batch.id === batchId ? { ...batch, divisions: [...batch.divisions, newDivision] } : batch,
      ),
    )
  }

  const updateDivision = (batchId: string, divisionId: string, updates: Partial<Division>) => {
    setBatches(
      batches.map((batch) =>
        batch.id === batchId
          ? {
              ...batch,
              divisions: batch.divisions.map((div) => (div.id === divisionId ? { ...div, ...updates } : div)),
            }
          : batch,
      ),
    )
  }

  const deleteDivision = (batchId: string, divisionId: string) => {
    setBatches(
      batches.map((batch) =>
        batch.id === batchId ? { ...batch, divisions: batch.divisions.filter((div) => div.id !== divisionId) } : batch,
      ),
    )
  }

  const addBatchSubject = (batchId: string) => {
    const newSubject: BatchSubject = {
      id: `subject-${Date.now()}`,
      name: "",
      code: "",
      type: "lecture",
      frequency: 3,
      priority: "medium",
      lectureHours: 1,
      labHours: 2,
      assignedFaculty: [],
    }
    setBatches(
      batches.map((batch) => (batch.id === batchId ? { ...batch, subjects: [...batch.subjects, newSubject] } : batch)),
    )
  }

  const updateBatchSubject = (batchId: string, subjectId: string, updates: Partial<BatchSubject>) => {
    setBatches(
      batches.map((batch) =>
        batch.id === batchId
          ? {
              ...batch,
              subjects: batch.subjects.map((subject) =>
                subject.id === subjectId ? { ...subject, ...updates } : subject,
              ),
            }
          : batch,
      ),
    )
  }

  const deleteBatchSubject = (batchId: string, subjectId: string) => {
    setBatches(
      batches.map((batch) =>
        batch.id === batchId
          ? { ...batch, subjects: batch.subjects.filter((subject) => subject.id !== subjectId) }
          : batch,
      ),
    )
  }

  const addFacultyAssignment = (batchId: string, subjectId: string) => {
    const newAssignment: SubjectFacultyAssignment = {
      facultyId: "",
      type: "lecture",
      divisionIds: [],
    }
    setBatches(
      batches.map((batch) =>
        batch.id === batchId
          ? {
              ...batch,
              subjects: batch.subjects.map((subject) =>
                subject.id === subjectId
                  ? { ...subject, assignedFaculty: [...subject.assignedFaculty, newAssignment] }
                  : subject,
              ),
            }
          : batch,
      ),
    )
  }

  const updateFacultyAssignment = (
    batchId: string,
    subjectId: string,
    assignmentIndex: number,
    updates: Partial<SubjectFacultyAssignment>,
  ) => {
    setBatches(
      batches.map((batch) =>
        batch.id === batchId
          ? {
              ...batch,
              subjects: batch.subjects.map((subject) =>
                subject.id === subjectId
                  ? {
                      ...subject,
                      assignedFaculty: subject.assignedFaculty.map((assignment, index) =>
                        index === assignmentIndex ? { ...assignment, ...updates } : assignment,
                      ),
                    }
                  : subject,
              ),
            }
          : batch,
      ),
    )
  }

  const deleteFacultyAssignment = (batchId: string, subjectId: string, assignmentIndex: number) => {
    setBatches(
      batches.map((batch) =>
        batch.id === batchId
          ? {
              ...batch,
              subjects: batch.subjects.map((subject) =>
                subject.id === subjectId
                  ? {
                      ...subject,
                      assignedFaculty: subject.assignedFaculty.filter((_, index) => index !== assignmentIndex),
                    }
                  : subject,
              ),
            }
          : batch,
      ),
    )
  }

  const addFaculty = () => {
    const newFaculty: Faculty = {
      id: `faculty-${Date.now()}`,
      name: "",
      email: "",
      maxHoursPerDay: 6,
      maxHoursPerWeek: 30,
    }
    setFaculty([...faculty, newFaculty])
  }

  const updateFaculty = (id: string, updates: Partial<Faculty>) => {
    setFaculty(faculty.map((f) => (f.id === id ? { ...f, ...updates } : f)))
  }

  const deleteFaculty = (id: string) => {
    setFaculty(faculty.filter((f) => f.id !== id))
  }

  // Room Management
  const addRoom = () => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name: "",
      type: "classroom",
      capacity: 60,
    }
    setRooms([...rooms, newRoom])
  }

  const updateRoom = (id: string, updates: Partial<Room>) => {
    setRooms(rooms.map((room) => (room.id === id ? { ...room, ...updates } : room)))
  }

  const deleteRoom = (id: string) => {
    setRooms(rooms.filter((room) => room.id !== id))
  }

  const handleSubmit = () => {
    const data: TimetableData = {
      batches,
      faculty,
      rooms,
      scheduleConfig,
    }
    onSubmit(data)
  }

  const isFormValid = () => {
    return (
      batches.length > 0 && batches.some((batch) => batch.subjects.length > 0) && faculty.length > 0 && rooms.length > 0
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedule" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="batches" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Batches & Subjects
          </TabsTrigger>
          <TabsTrigger value="faculty" className="flex items-center gap-1">
            <UserCheck className="h-4 w-4" />
            Faculty
          </TabsTrigger>
          <TabsTrigger value="rooms" className="flex items-center gap-1">
            <Building className="h-4 w-4" />
            Rooms
          </TabsTrigger>
        </TabsList>

        {/* Schedule Configuration */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Configuration</CardTitle>
              <CardDescription>Configure working days, slots, and break timings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Working Days</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={day}
                          checked={scheduleConfig.workingDays.includes(day)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setScheduleConfig({
                                ...scheduleConfig,
                                workingDays: [...scheduleConfig.workingDays, day],
                              })
                            } else {
                              setScheduleConfig({
                                ...scheduleConfig,
                                workingDays: scheduleConfig.workingDays.filter((d) => d !== day),
                              })
                            }
                          }}
                        />
                        <Label htmlFor={day} className="capitalize">
                          {day}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="slotsPerDay">Slots Per Day</Label>
                  <Input
                    id="slotsPerDay"
                    type="number"
                    value={scheduleConfig.slotsPerDay}
                    onChange={(e) =>
                      setScheduleConfig({
                        ...scheduleConfig,
                        slotsPerDay: Number.parseInt(e.target.value) || 8,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="slotDuration">Slot Duration (minutes)</Label>
                  <Input
                    id="slotDuration"
                    type="number"
                    value={scheduleConfig.slotDuration}
                    onChange={(e) =>
                      setScheduleConfig({
                        ...scheduleConfig,
                        slotDuration: Number.parseInt(e.target.value) || 60,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={scheduleConfig.startTime}
                    onChange={(e) =>
                      setScheduleConfig({
                        ...scheduleConfig,
                        startTime: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="lunchSlot">Lunch Break Slot</Label>
                  <Input
                    id="lunchSlot"
                    type="number"
                    value={scheduleConfig.lunchSlot || ""}
                    onChange={(e) =>
                      setScheduleConfig({
                        ...scheduleConfig,
                        lunchSlot: Number.parseInt(e.target.value) || undefined,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batches" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Batches, Divisions & Subjects</h3>
            <Button onClick={addBatch} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Batch
            </Button>
          </div>

          {batches.map((batch) => (
            <Card key={batch.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">Batch: {batch.name || "Unnamed Batch"}</CardTitle>
                  <Button variant="destructive" size="sm" onClick={() => deleteBatch(batch.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Batch Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Batch Name</Label>
                    <Input
                      value={batch.name}
                      onChange={(e) => updateBatch(batch.id, { name: e.target.value })}
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input
                      type="number"
                      value={batch.year}
                      onChange={(e) => updateBatch(batch.id, { year: Number.parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                {/* Divisions */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Divisions</Label>
                    <Button size="sm" variant="outline" onClick={() => addDivision(batch.id)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Division
                    </Button>
                  </div>

                  {batch.divisions.map((division) => (
                    <div key={division.id} className="flex gap-2 items-center mb-2">
                      <Input
                        value={division.name}
                        onChange={(e) => updateDivision(batch.id, division.id, { name: e.target.value })}
                        placeholder="Division name (e.g., A, B, C)"
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={division.studentCount}
                        onChange={(e) =>
                          updateDivision(batch.id, division.id, { studentCount: Number.parseInt(e.target.value) || 0 })
                        }
                        placeholder="Student count"
                        className="w-32"
                      />
                      <Button variant="destructive" size="sm" onClick={() => deleteDivision(batch.id, division.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Batch Subjects */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-base font-semibold">Subjects for this Batch</Label>
                    <Button size="sm" variant="outline" onClick={() => addBatchSubject(batch.id)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Subject
                    </Button>
                  </div>

                  {batch.subjects.map((subject) => (
                    <Card key={subject.id} className="mb-4">
                      <CardContent className="pt-4">
                        {/* Subject Basic Info */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label>Subject Name</Label>
                            <Input
                              value={subject.name}
                              onChange={(e) => updateBatchSubject(batch.id, subject.id, { name: e.target.value })}
                              placeholder="e.g., Data Structures"
                            />
                          </div>
                          <div>
                            <Label>Subject Code</Label>
                            <Input
                              value={subject.code}
                              onChange={(e) => updateBatchSubject(batch.id, subject.id, { code: e.target.value })}
                              placeholder="e.g., CS201"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <div>
                            <Label>Type</Label>
                            <Select
                              value={subject.type}
                              onValueChange={(value: "lecture" | "lab" | "both") =>
                                updateBatchSubject(batch.id, subject.id, { type: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="lecture">Lecture Only</SelectItem>
                                <SelectItem value="lab">Lab Only</SelectItem>
                                <SelectItem value="both">Both</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Frequency/Week</Label>
                            <Input
                              type="number"
                              value={subject.frequency}
                              onChange={(e) =>
                                updateBatchSubject(batch.id, subject.id, {
                                  frequency: Number.parseInt(e.target.value) || 1,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Priority</Label>
                            <Select
                              value={subject.priority}
                              onValueChange={(value: "high" | "medium" | "low") =>
                                updateBatchSubject(batch.id, subject.id, { priority: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-end">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteBatchSubject(batch.id, subject.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Faculty Assignments for this Subject */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label className="font-medium">Faculty Assignments</Label>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addFacultyAssignment(batch.id, subject.id)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Assign Faculty
                            </Button>
                          </div>

                          {subject.assignedFaculty.map((assignment, index) => (
                            <div
                              key={index}
                              className="grid grid-cols-4 gap-2 items-center mb-2 p-2 bg-gray-50 rounded"
                            >
                              <div>
                                <Label className="text-sm">Faculty</Label>
                                <Select
                                  value={assignment.facultyId}
                                  onValueChange={(value) =>
                                    updateFacultyAssignment(batch.id, subject.id, index, { facultyId: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select faculty" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {faculty.map((f) => (
                                      <SelectItem key={f.id} value={f.id}>
                                        {f.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-sm">Type</Label>
                                <Select
                                  value={assignment.type}
                                  onValueChange={(value: "lecture" | "lab" | "both") =>
                                    updateFacultyAssignment(batch.id, subject.id, index, { type: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="lecture">Lecture</SelectItem>
                                    <SelectItem value="lab">Lab</SelectItem>
                                    <SelectItem value="both">Both</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-sm">Divisions</Label>
                                <Select
                                  value={assignment.divisionIds?.join(",") || "all"}
                                  onValueChange={(value) => {
                                    const divisionIds = value === "all" ? [] : value.split(",").filter(Boolean)
                                    updateFacultyAssignment(batch.id, subject.id, index, { divisionIds })
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">All Divisions</SelectItem>
                                    {batch.divisions.map((division) => (
                                      <SelectItem key={division.id} value={division.id}>
                                        Division {division.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteFacultyAssignment(batch.id, subject.id, index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Faculty Tab - Simplified */}
        <TabsContent value="faculty" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Faculty</h3>
            <Button onClick={addFaculty} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Faculty
            </Button>
          </div>

          {faculty.map((f) => (
            <Card key={f.id}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>Faculty Name</Label>
                    <Input
                      value={f.name}
                      onChange={(e) => updateFaculty(f.id, { name: e.target.value })}
                      placeholder="e.g., Dr. John Smith"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={f.email}
                      onChange={(e) => updateFaculty(f.id, { email: e.target.value })}
                      placeholder="john.smith@university.edu"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Max Hours/Day</Label>
                    <Input
                      type="number"
                      value={f.maxHoursPerDay}
                      onChange={(e) => updateFaculty(f.id, { maxHoursPerDay: Number.parseInt(e.target.value) || 6 })}
                    />
                  </div>
                  <div>
                    <Label>Max Hours/Week</Label>
                    <Input
                      type="number"
                      value={f.maxHoursPerWeek}
                      onChange={(e) => updateFaculty(f.id, { maxHoursPerWeek: Number.parseInt(e.target.value) || 30 })}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button variant="destructive" size="sm" onClick={() => deleteFaculty(f.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Rooms Tab */}
        <TabsContent value="rooms" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Rooms</h3>
            <Button onClick={addRoom} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Room
            </Button>
          </div>

          {rooms.map((room) => (
            <Card key={room.id}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>Room Name</Label>
                    <Input
                      value={room.name}
                      onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                      placeholder="e.g., Room 101"
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={room.type}
                      onValueChange={(value: "classroom" | "lab" | "auditorium") =>
                        updateRoom(room.id, { type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="classroom">Classroom</SelectItem>
                        <SelectItem value="lab">Lab</SelectItem>
                        <SelectItem value="auditorium">Auditorium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Capacity</Label>
                    <Input
                      type="number"
                      value={room.capacity}
                      onChange={(e) => updateRoom(room.id, { capacity: Number.parseInt(e.target.value) || 60 })}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button variant="destructive" size="sm" onClick={() => deleteRoom(room.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onReset}>
          Reset All
        </Button>
        <Button onClick={handleSubmit} disabled={!isFormValid() || isGenerating} className="min-w-32">
          {isGenerating ? "Generating..." : "Generate Timetable"}
        </Button>
      </div>
    </div>
  )
}
