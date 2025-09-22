import { Button } from "@/components/ui/button"
import { Play, Heart, Music } from "lucide-react"
import heroImage from "@assets/generated_images/Health_waves_transforming_to_music_c48d45db.png"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Heart className="h-8 w-8 text-chart-1" />
          <Music className="h-8 w-8 text-chart-3" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Transform Your Health Into
          <span className="text-chart-1 block">Musical Therapy</span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
          Advanced AI analysis of your health data to deliver personalized music recommendations 
          that match your mood, energy levels, and wellness goals.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            variant="outline" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm px-8 py-3"
            data-testid="button-get-started"
            onClick={() => console.log('Get Started clicked')}
          >
            <Play className="mr-2 h-5 w-5" />
            Get Started
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="bg-transparent border-white/40 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-3"
            data-testid="button-learn-more"
            onClick={() => console.log('Learn More clicked')}
          >
            Learn More
          </Button>
        </div>
        
        <div className="mt-12 text-sm text-white/70">
          Compatible with Apple Health, Google Fit, Whoop, and more
        </div>
      </div>
    </section>
  )
}