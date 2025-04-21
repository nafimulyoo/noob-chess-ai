"use client"

interface MoveHistoryProps {
  moves: string[]
  currentMoveIndex: number
  onSelectMove: (index: number) => void
  children?: React.ReactNode
}

export default function MoveHistory({ moves, currentMoveIndex, onSelectMove, children }: MoveHistoryProps) {
  // Group moves into pairs for display
  const moveRows = []
  for (let i = 0; i < moves.length; i += 2) {
    moveRows.push({
      moveNumber: Math.floor(i / 2) + 1,
      whiteMove: moves[i],
      blackMove: i + 1 < moves.length ? moves[i + 1] : null,
    })
  }

  return (
    <div>
    <div className="overflow-y-auto max-h-[340px] border rounded">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="py-2 px-3 text-left w-[20%]">#</th>
            <th className="py-2 px-3 text-left w-[40%]">White</th>
            <th className="py-2 px-3 text-left w-[40%]">Black</th>
          </tr>
        </thead>
        <tbody>
          {moveRows.map((row, rowIndex) => (
            <tr key={row.moveNumber} className="border-t">
              <td className="py-2 px-3">{row.moveNumber}.</td>
              <td
                className={`py-2 px-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  rowIndex * 2 === currentMoveIndex ? "bg-blue-100 dark:bg-blue-900" : ""
                }`}
                onClick={() => onSelectMove(rowIndex * 2)}
              >
                {row.whiteMove}
              </td>
              <td
                className={`py-2 px-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  rowIndex * 2 + 1 === currentMoveIndex ? "bg-blue-100 dark:bg-blue-900" : ""
                }`}
                onClick={() => row.blackMove && onSelectMove(rowIndex * 2 + 1)}
              >
                {row.blackMove}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
      <div className="p-2 flex justify-between w-full">
        {children}
       
      </div>
    </div>
  )
}
