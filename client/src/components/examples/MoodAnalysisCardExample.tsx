import { MoodAnalysisCard } from '../MoodAnalysisCard'

export default function MoodAnalysisCardExample() {
  const mockMoodData = {
    mood: "Energetic",
    confidence: 87,
    factors: ["High heart rate", "Good sleep", "Active morning", "Sunny weather"],
    color: "energetic",
    description: "Your elevated heart rate and recent physical activity suggest high energy levels. Perfect time for upbeat, motivating music to match your current state."
  }

  return (
    <div className="max-w-md p-4">
      <MoodAnalysisCard moodData={mockMoodData} />
    </div>
  )
}