import { useState } from 'react'
import RandomGrid from '../components/RandomGrid'

const Autocorrelation = () => {
  const [inputMethod, setInputMethod] = useState<'manual' | 'table'>('table')
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])

  const handleSelectNumber = (num: number) => {
    if (!selectedNumbers.includes(num)) {
      setSelectedNumbers([...selectedNumbers, num])
    }
  }

  return (
    <div className="container mx-auto px-3 sm:px-5 py-5 max-w-6xl bg-white shadow-md mt-5 rounded-lg">
      <h1 className="text-primary border-b-2 border-teal-500 pb-2.5 mb-5">
        Tests for Random Numbers: Dependency
      </h1>
      <div className="bg-teal-50 p-2.5 border-l-4 border-teal-500 mb-5">
        <strong>Goal:</strong> Test Independence using Autocorrelation method.
        <br />
        Follows Chapter 6 (Slides 20-29).
      </div>

      <div className="mb-4 p-5 bg-gray-100 rounded-lg border-l-4 border-primary">
        <label className="font-bold text-lg text-primary mr-2.5">Input Random Numbers:</label>
        <select
          value={inputMethod}
          onChange={(e) => setInputMethod(e.target.value as 'manual' | 'table')}
          className="p-2 rounded ml-2.5"
        >
          <option value="manual">Manual Input (Paste)</option>
          <option value="table">Random Table (Click)</option>
        </select>

        {inputMethod === 'manual' && (
          <div className="mt-4">
            <textarea
              rows={4}
              className="w-full p-2.5 text-base border border-gray-300 rounded"
              placeholder="e.g. 0.44, 0.81, 0.14, 0.05, 0.93..."
            />
          </div>
        )}

        {inputMethod === 'table' && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2.5">Click numbers to add to list:</p>
            <RandomGrid
              onSelect={handleSelectNumber}
              selectedValues={selectedNumbers}
            />
            <div className="mt-2.5">
              <strong>Selected:</strong>
              <textarea
                value={selectedNumbers.map(n => n.toFixed(2)).join(', ')}
                rows={2}
                className="w-full p-2.5 text-sm bg-gray-200 border border-gray-300 rounded mt-2.5"
                readOnly
              />
            </div>
          </div>
        )}
      </div>

      <div className="text-center mb-8">
        <button className="bg-green-600 text-white px-6 py-2.5 text-base border-none rounded cursor-pointer hover:bg-green-700">
          CALCULATE
        </button>
      </div>
    </div>
  )
}

export default Autocorrelation

