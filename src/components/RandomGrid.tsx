import { useState } from 'react'

interface RandomGridProps {
  onSelect: (value: number) => void
  selectedValues: number[]
}

const RandomGrid = ({ onSelect, selectedValues }: RandomGridProps) => {
  const [numbers] = useState(() => {
    return Array.from({ length: 100 }, () => Math.random())
  })

  // Check if a number is selected using tolerance-based comparison
  const isSelected = (num: number) => {
    return selectedValues.some(selected => Math.abs(selected - num) < 0.0001)
  }

  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 border border-gray-300 p-4 bg-gray-50 rounded">
      {numbers.map((num, idx) => {
        const displayNum = num.toFixed(4)
        const selected = isSelected(num)
        return (
          <div
            key={idx}
            onClick={() => onSelect(num)}
            className={`p-2.5 text-center cursor-pointer text-sm font-mono font-semibold rounded transition-all ${
              selected
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-200 hover:bg-blue-500 hover:text-white hover:scale-110'
            }`}
          >
            {displayNum}
          </div>
        )
      })}
    </div>
  )
}

export default RandomGrid

