"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { GeneratedTimetable } from "@/types/timetable"
import { Calendar, Clock, User, MapPin, BookOpen, AlertTriangle, BarChart3, Download, RefreshCw } from "lucide-react"

interface TimetableDisplayProps {
  timetable: GeneratedTimetable
  onReset: () => void
}

export function TimetableDisplay({ timetable, onReset }: TimetableDisplayProps) {
  const [selectedDay, setSelectedDay] = useState<string>("Monday")

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"]

  const getEntriesForDay = (day: string) => {
    return timetable.entries.filter((entry) => entry.day === day)
  }

  const getEntryForSlot = (day: string, time: string) => {
    return timetable.entries.find((entry) => entry.day === day && entry.timeSlot.startsWith(time))
  }

  const getSubjectColor = (subjectCode: string) => {
    const colors = [
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-green-100 text-green-800 border-green-200",
      "bg-purple-100 text-purple-800 border-purple-200",
      "bg-orange-100 text-orange-800 border-orange-200",
      "bg-pink-100 text-pink-800 border-pink-200",
      "bg-indigo-100 text-indigo-800 border-indigo-200",
    ]
    const hash = subjectCode.split("").reduce((a, b) => a + b.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  const exportTimetable = () => {
    const csvContent = [
      ["Day", "Time", "Subject", "Teacher", "Room", "Type"].join(","),
      ...timetable.entries.map((entry) =>
        [
          entry.day,
          entry.timeSlot,
          `${entry.subject.code} - ${entry.subject.name}`,
          entry.teacher.name,
          entry.room.name,
          entry.type,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "timetable.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Generated Timetable</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Optimized schedule with {timetable.entries.length} total sessions
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportTimetable} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={onReset} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate New
          </Button>
        </div>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="grid" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Grid View
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            List View
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistics
          </TabsTrigger>
        </TabsList>

        {/* Grid View */}
        <TabsContent value="grid">
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Weekly Timetable Grid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800 text-left font-medium">
                        Time
                      </th>
                      {days.map((day) => (
                        <th
                          key={day}
                          className="border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800 text-center font-medium min-w-[200px]"
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((time) => (
                      <tr key={time}>
                        <td className="border border-gray-200 dark:border-gray-700 p-3 font-medium bg-gray-50 dark:bg-gray-800">
                          {time}
                        </td>
                        {days.map((day) => {
                          const entry = getEntryForSlot(day, time)
                          const isLunchBreak = time === "12:00" || time === "13:00"

                          return (
                            <td key={`${day}-${time}`} className="border border-gray-200 dark:border-gray-700 p-2">
                              {isLunchBreak ? (
                                <div className="text-center text-gray-500 dark:text-gray-400 py-4">Lunch Break</div>
                              ) : entry ? (
                                <div className={`p-3 rounded-lg border ${getSubjectColor(entry.subject.code)}`}>
                                  <div className="font-semibold text-sm">{entry.subject.code}</div>
                                  <div className="text-xs opacity-90">{entry.subject.name}</div>
                                  <div className="flex items-center gap-1 mt-2 text-xs">
                                    <User className="h-3 w-3" />
                                    {entry.teacher.name}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs">
                                    <MapPin className="h-3 w-3" />
                                    {entry.room.name}
                                  </div>
                                  {entry.type === "lab" && (
                                    <Badge variant="secondary" className="mt-1 text-xs">
                                      Lab
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <div className="h-20 flex items-center justify-center text-gray-400 dark:text-gray-600">
                                  Free
                                </div>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {days.map((day) => (
                <Button
                  key={day}
                  variant={selectedDay === day ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDay(day)}
                >
                  {day}
                </Button>
              ))}
            </div>

            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {selectedDay} Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getEntriesForDay(selectedDay).length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No classes scheduled for {selectedDay}
                    </div>
                  ) : (
                    getEntriesForDay(selectedDay)
                      .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
                      .map((entry) => (
                        <div key={entry.id} className={`p-4 rounded-lg border ${getSubjectColor(entry.subject.code)}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">
                                {entry.subject.code} - {entry.subject.name}
                              </h4>
                              <div className="flex items-center gap-4 mt-2 text-sm opacity-90">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {entry.timeSlot}
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  {entry.teacher.name}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {entry.room.name}
                                </div>
                              </div>
                            </div>
                            {entry.type === "lab" && <Badge variant="secondary">Lab Session</Badge>}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Statistics */}
        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Schedule Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {timetable.entries.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Total Sessions</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {Math.round(timetable.statistics.roomUtilization)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Room Utilization</div>
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {timetable.statistics.totalHours}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Teaching Hours</div>
                </div>
              </CardContent>
            </Card>

            {timetable.conflicts.length > 0 && (
              <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-5 w-5" />
                    Scheduling Conflicts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {timetable.conflicts.map((conflict, index) => (
                      <div key={index} className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm">
                        {conflict}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
