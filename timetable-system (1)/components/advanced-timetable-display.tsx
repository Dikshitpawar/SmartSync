"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Users, UserCheck, Building, AlertTriangle, Download } from "lucide-react"
import type { GeneratedTimetable, ViewMode, BatchTimetable, FacultyTimetable } from "@/types/timetable"

interface AdvancedTimetableDisplayProps {
  timetable: GeneratedTimetable
  onReset: () => void
}

export function AdvancedTimetableDisplay({ timetable, onReset }: AdvancedTimetableDisplayProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("batch")
  const [selectedBatch, setSelectedBatch] = useState<string>("")
  const [selectedFaculty, setSelectedFaculty] = useState<string>("")

  const timeSlots = Array.from({ length: 8 }, (_, i) => {
    const hour = 9 + i
    return `${hour.toString().padStart(2, "0")}:00`
  })

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

  const renderBatchTimetable = (batchTimetable: BatchTimetable) => {
    const entries = batchTimetable.entries

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-6 gap-2 text-sm font-medium">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-center">Time</div>
          {days.map((day) => (
            <div key={day} className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-center">
              {day}
            </div>
          ))}
        </div>

        {timeSlots.map((time, slotIndex) => (
          <div key={time} className="grid grid-cols-6 gap-2">
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded text-center font-medium">{time}</div>
            {days.map((day) => {
              const dayEntry = entries.find(
                (entry) => entry.day.toLowerCase() === day.toLowerCase() && entry.slot === slotIndex + 1,
              )

              return (
                <div key={`${day}-${time}`} className="p-2 border rounded min-h-[80px]">
                  {dayEntry ? (
                    <div
                      className={`p-2 rounded text-xs ${
                        dayEntry.type === "lab"
                          ? "bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700"
                          : "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700"
                      }`}
                    >
                      <div className="font-semibold">{dayEntry.subject.name}</div>
                      <div className="text-gray-600 dark:text-gray-400">{dayEntry.faculty.name}</div>
                      <div className="text-gray-500 dark:text-gray-500">{dayEntry.room.name}</div>
                      <Badge variant={dayEntry.type === "lab" ? "secondary" : "default"} className="mt-1">
                        {dayEntry.type}
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-center text-xs pt-6">Free</div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  const renderFacultyTimetable = (facultyTimetable: FacultyTimetable) => {
    const entries = facultyTimetable.entries

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-6 gap-2 text-sm font-medium">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-center">Time</div>
          {days.map((day) => (
            <div key={day} className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-center">
              {day}
            </div>
          ))}
        </div>

        {timeSlots.map((time, slotIndex) => (
          <div key={time} className="grid grid-cols-6 gap-2">
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded text-center font-medium">{time}</div>
            {days.map((day) => {
              const dayEntry = entries.find(
                (entry) => entry.day.toLowerCase() === day.toLowerCase() && entry.slot === slotIndex + 1,
              )

              return (
                <div key={`${day}-${time}`} className="p-2 border rounded min-h-[80px]">
                  {dayEntry ? (
                    <div
                      className={`p-2 rounded text-xs ${
                        dayEntry.type === "lab"
                          ? "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-700"
                          : "bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700"
                      }`}
                    >
                      <div className="font-semibold">{dayEntry.subject.name}</div>
                      <div className="text-gray-600 dark:text-gray-400">Batch: {dayEntry.batchId}</div>
                      <div className="text-gray-500 dark:text-gray-500">{dayEntry.room.name}</div>
                      <Badge variant={dayEntry.type === "lab" ? "secondary" : "default"} className="mt-1">
                        {dayEntry.type}
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-center text-xs pt-6">Free</div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Generated Timetable</CardTitle>
              <CardDescription>
                Smart scheduling completed with {timetable.statistics.successRate.toFixed(1)}% success rate
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={onReset}>
                Generate New
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{timetable.statistics.totalBatches}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Batches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{timetable.statistics.totalFaculty}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Faculty</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{timetable.statistics.totalHours}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{timetable.statistics.conflictCount}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Conflicts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Timetable Display */}
      <Tabs defaultValue="batch" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="batch" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Batch View
          </TabsTrigger>
          <TabsTrigger value="faculty" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Faculty View
          </TabsTrigger>
          <TabsTrigger value="rooms" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Room Utilization
          </TabsTrigger>
          <TabsTrigger value="conflicts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Conflicts
          </TabsTrigger>
        </TabsList>

        {/* Batch View */}
        <TabsContent value="batch" className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={selectedBatch} onValueChange={setSelectedBatch}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select batch to view" />
              </SelectTrigger>
              <SelectContent>
                {timetable.batchTimetables.map((bt) => (
                  <SelectItem key={`${bt.batchId}-${bt.divisionId}`} value={`${bt.batchId}-${bt.divisionId}`}>
                    Batch {bt.batchId} - Division {bt.divisionId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedBatch && (
            <Card>
              <CardHeader>
                <CardTitle>Batch Timetable</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const batchTimetable = timetable.batchTimetables.find(
                    (bt) => `${bt.batchId}-${bt.divisionId}` === selectedBatch,
                  )
                  return batchTimetable ? renderBatchTimetable(batchTimetable) : null
                })()}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Faculty View */}
        <TabsContent value="faculty" className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select faculty to view" />
              </SelectTrigger>
              <SelectContent>
                {timetable.facultyTimetables.map((ft) => (
                  <SelectItem key={ft.facultyId} value={ft.facultyId}>
                    Faculty {ft.facultyId} ({ft.totalHours}h/week)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedFaculty && (
            <Card>
              <CardHeader>
                <CardTitle>Faculty Timetable</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const facultyTimetable = timetable.facultyTimetables.find((ft) => ft.facultyId === selectedFaculty)
                  return facultyTimetable ? renderFacultyTimetable(facultyTimetable) : null
                })()}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Room Utilization */}
        <TabsContent value="rooms" className="space-y-4">
          <div className="grid gap-4">
            {timetable.roomUtilization.map((room) => (
              <Card key={room.roomId}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{room.roomName}</CardTitle>
                    <Badge
                      variant={
                        room.utilizationPercentage > 80
                          ? "destructive"
                          : room.utilizationPercentage > 60
                            ? "default"
                            : "secondary"
                      }
                    >
                      {room.utilizationPercentage.toFixed(1)}% utilized
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {room.occupiedSlots} of {room.totalSlots} slots occupied
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Conflicts */}
        <TabsContent value="conflicts" className="space-y-4">
          {timetable.conflicts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-green-600 dark:text-green-400 mb-2">
                  <Calendar className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">No Conflicts!</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  The timetable was generated successfully without any scheduling conflicts.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {timetable.conflicts.map((conflict, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle
                        className={`h-5 w-5 mt-0.5 ${
                          conflict.severity === "high"
                            ? "text-red-500"
                            : conflict.severity === "medium"
                              ? "text-yellow-500"
                              : "text-blue-500"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={
                              conflict.severity === "high"
                                ? "destructive"
                                : conflict.severity === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {conflict.type.replace("_", " ").toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{conflict.severity}</Badge>
                        </div>
                        <p className="text-sm">{conflict.message}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
