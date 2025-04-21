import ChessInterface from "@/components/chess-interface"
import { Cpu } from "lucide-react"
export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="items-center justify-center mb-6">
      <h2 className="flex items-center justify-center">
        <Cpu className="w-12 h-12 -pb-1 mr-4 mb-2"/>
        <p className="text-4xl font-bold mb-2"> The Noob Chess AI</p>
        </h2>
        <div>
        <p className="flex items-center justify-center">
          <span>A simple chess AI built with Next.js and React. Made by Nafi karena demot ngerjain TA.</span>
          <a href="https://github.com/nafimulyoo/noob-chess-ai" className="underline font-bold ml-2">{" Source Code"}</a>
        </p>
        </div>
      </div>
      <ChessInterface />
    </main>
  )
}
