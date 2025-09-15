"use client"

import { useState } from "react"
import { AdvancedAdminForm } from "@/components/advanced-admin-form"
import { AdvancedTimetableDisplay } from "@/components/advanced-timetable-display"
import type { TimetableData, GeneratedTimetable } from "@/types/timetable"
import { generateAdvancedTimetable } from "@/lib/advanced-timetable-generator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Settings, BookOpen } from "lucide-react"

export default function TimetablePage() {
  const [timetableData, setTimetableData] = useState<TimetableData | null>(null)
  const [generatedTimetable, setGeneratedTimetable] = useState<GeneratedTimetable | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDataSubmit = async (data: TimetableData) => {
    setTimetableData(data)
    setIsGenerating(true)

    try {
      // Simulate processing time for better UX
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const generated = generateAdvancedTimetable(data)
      setGeneratedTimetable(generated)
    } catch (error) {
      console.error("Error generating timetable:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReset = () => {
    setTimetableData(null)
    setGeneratedTimetable(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Smart Timetable Generator</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Intelligent scheduling system that automatically generates optimized timetables based on your department's
            constraints and requirements.
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="input" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="input" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Admin Input
            </TabsTrigger>
            <TabsTrigger value="timetable" className="flex items-center gap-2" disabled={!generatedTimetable}>
              <BookOpen className="h-4 w-4" />
              Generated Timetable
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input">
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-gray-900 dark:text-white">Smart Timetable Configuration</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Configure batches, subjects, faculty, and scheduling constraints for intelligent timetable generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdvancedAdminForm onSubmit={handleDataSubmit} isGenerating={isGenerating} onReset={handleReset} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timetable">
            {generatedTimetable && <AdvancedTimetableDisplay timetable={generatedTimetable} onReset={handleReset} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
