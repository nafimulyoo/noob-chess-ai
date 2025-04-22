import ChessInterface from "@/components/chess-interface"
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen xl:pt-4 xl:px-12 lg:pt-4 lg:p-10 md:p-8 sm:m-4 m-4 pb-0 mb-0">
      <ChessInterface />
    </div>
  )
}
