import { MusicRecommendationCard } from '../MusicRecommendationCard'

export default function MusicRecommendationCardExample() {
  const mockTracks = [
    {
      id: "1",
      title: "Uptown Funk",
      artist: "Mark Ronson ft. Bruno Mars",
      album: "Uptown Special",
      duration: "4:30",
      energy: 0.9,
      valence: 0.85,
      reason: "High energy track matching your current energetic mood and elevated heart rate"
    },
    {
      id: "2", 
      title: "Can't Stop the Feeling!",
      artist: "Justin Timberlake",
      album: "Trolls (Original Motion Picture Soundtrack)",
      duration: "3:56",
      energy: 0.85,
      valence: 0.9,
      reason: "Positive, uplifting vibes to complement your good mood and active day"
    },
    {
      id: "3",
      title: "Good as Hell",
      artist: "Lizzo", 
      album: "Cuz I Love You",
      duration: "2:39",
      energy: 0.8,
      valence: 0.88,
      reason: "Empowering anthem that matches your confident energy levels"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {mockTracks.map((track, index) => (
        <MusicRecommendationCard 
          key={track.id}
          track={track} 
          moodMatch={95 - index * 5}
        />
      ))}
    </div>
  )
}