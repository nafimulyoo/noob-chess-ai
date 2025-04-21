import ChessInterface from "@/components/chess-interface"
export default function Home() {
  return (
    <main className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-2">The Noob Chess AI</h1>
      <p className="mb-6">
        A simple chess AI built with Next.js and React. Made by Nafi karena demot ngerjain TA. Source code: <a href="https://github.com/nafimulyoo/noob-chess-ai" className="underline font-bold">GitHub</a>
      </p>
      <ChessInterface />
    </main>
  )
}
