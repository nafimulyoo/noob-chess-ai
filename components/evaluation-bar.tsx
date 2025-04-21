"use client"

interface EvaluationBarProps {
  evaluation: number 
  orientation: string // "white" or "black"
}

export default function EvaluationBar({ evaluation, orientation }: EvaluationBarProps) {
  // Convert evaluation to a percentage (capped at ±5)
  const normalizedEval = Math.max(Math.min(evaluation, 1000), -1000) / 1000 // Normalize to -1 to 1

  // Calculate percentage for the bar (50% is equal)
  let percentage = 50 + normalizedEval * 10 // 10% per pawn of advantage

  // If board is flipped, we need to flip the evaluation bar too
  let height = 100 - percentage

    if (orientation === "black") {
        percentage = height
    }

  return (
    <div className="h-full w-full bg-gray-200 dark:bg-gray-700 rounded relative">
        {
            orientation === "white" ? (
                <div className="absolute top-0 w-full bg-black rounded-t"
                    style={{
                        height: `${height}%`,
                        transition: "height 0.3s ease-in-out",
                    }}
                />
            ) : (
                <div className="absolute bottom-0 w-full bg-black rounded-b"
                    style={{
                        height: `${percentage}%`,
                        transition: "height 0.3s ease-in-out",
                    }}
                />
            )
        }
    </div>
  )
}
