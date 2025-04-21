import ChessInterface from "@/components/chess-interface"
export default function Home() {
  return (
    <main className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">The Noob Chess AI</h1>
      <ChessInterface />
    </main>
  )
}
