import { auth } from "@/lib/auth-helper"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TrendingUp, Zap, Sparkles } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Image from "next/image"

export default async function Home() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Header variant="landing" user={session?.user} />

      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto mb-20 relative">
          {/* Decorative cassette images */}
          <div className="absolute -left-24 top-10 opacity-20 rotate-12 hidden lg:block">
            <Image src="/cassette.png" alt="" width={120} height={120} className="w-30 h-30" />
          </div>
          <div className="absolute -right-24 top-32 opacity-20 -rotate-12 hidden lg:block">
            <Image src="/cassette2.png" alt="" width={120} height={120} className="w-30 h-30" />
          </div>

          <div className="flex justify-center mb-8">
            <Image src="/logo3.png" alt="PlaylistConnect Logo" width={256} height={256} className="h-64 w-64" />
          </div>
          <h1 className="text-5xl font-bold mb-6">
            Connect Your Music with the Right Playlists
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Submit your tracks to curated playlists. Get discovered by listeners who love your sound.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="gap-2">
                <Zap className="h-5 w-5" />
                Start Submitting
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-6 rounded-lg border bg-card">
            <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Smart Matching</h3>
            <p className="text-muted-foreground">
              Our algorithm matches your track with playlists based on genre, vibe, and similar artists.
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Grow Your Audience</h3>
            <p className="text-muted-foreground">
              Get your music in front of engaged listeners who are actively discovering new tracks.
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Fast Reviews</h3>
            <p className="text-muted-foreground">
              Curators have 72 hours to review. Unreviewed submissions get automatically refunded.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
