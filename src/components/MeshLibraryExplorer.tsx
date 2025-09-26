// MeshTV Library Explorer for Lovable.dev
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface Movie {
  title: string
  description: string
  thumbnail?: string
  folder: string
}

export default function MeshLibraryExplorer() {
  const navigate = useNavigate()
  const [movies, setMovies] = useState<Movie[]>([])
  const [query, setQuery] = useState("")

  useEffect(() => {
    fetch("/meshtv_library/index.json")
      .then(res => res.json())
      .then(data => setMovies(data))
      .catch(err => console.error("Failed to load library:", err))
  }, [])

  const filtered = movies.filter(m => 
    m.title.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold text-foreground">🎥 MeshTV Public Domain Library</h1>
        </div>

        {/* Search */}
        <Input
          placeholder="Search movies..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="mb-6 max-w-md"
        />

        {/* Movie Grid */}
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filtered.map((movie, i) => (
              <Card key={i} className="hover:shadow-xl transition-shadow">
                <img 
                  src={movie.thumbnail || "/default-thumbnail.jpg"} 
                  alt={movie.title}
                  className="rounded-t w-full h-36 object-cover" 
                />
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1">{movie.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{movie.description}</p>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Video not available
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filtered.length === 0 && query && (
            <div className="text-center py-8 text-muted-foreground">
              No movies found matching "{query}"
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}