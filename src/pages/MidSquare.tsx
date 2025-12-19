import { useState } from 'react'

interface MidSquareResult {
  i: number
  zi: number
  square: string
  middle: string
  ui: string
  flag: string
}

const MidSquare = () => {
  const [seed, setSeed] = useState(7182)
  const [iterations, setIterations] = useState(10)
  const [results, setResults] = useState<MidSquareResult[]>([])
  const [warning, setWarning] = useState('')

  const solveMidSquare = () => {
    const seedStr = seed.toString()
    const n = seedStr.length
    let z = seed

    if (n % 2 !== 0) {
      setWarning('Warning: The number of digits (n) is odd. Standard Middle-Square requires \'n\' to be even. Logic may be imprecise.')
    } else {
      setWarning('')
    }

    const history = new Set<number>()
    history.add(z)
    const newResults: MidSquareResult[] = []

    for (let i = 1; i <= iterations; i++) {
      const square = z * z
      const squareStr = square.toString()
      const targetLen = n * 2
      const paddedSquare = squareStr.padStart(targetLen, '0')
      const start = Math.floor((targetLen - n) / 2)
      const end = start + n
      const middleStr = paddedSquare.substring(start, end)
      const nextZ = parseInt(middleStr)
      const u = nextZ / Math.pow(10, n)

      let flag = ''
      if (nextZ === 0) flag = ' (Degenerated to 0)'
      else if (history.has(nextZ)) flag = ' (Cycle Repeat)'

      history.add(nextZ)

      newResults.push({
        i,
        zi: nextZ,
        square: paddedSquare,
        middle: middleStr,
        ui: u.toFixed(n),
        flag,
      })

      z = nextZ
    }

    setResults(newResults)
  }

  return (
    <div className="container mx-auto px-3 sm:px-5 py-5 max-w-6xl bg-white shadow-md mt-5 rounded-lg">
      <h1 className="text-primary border-b-2 border-teal-500 pb-2.5 mb-5">
        Middle-Square Method Generator
      </h1>
      <div className="bg-teal-50 p-2.5 border-l-4 border-teal-500 mb-5">
        <p>
          <strong>Logic:</strong> Start with a seed of <strong>n</strong> digits. Square it (Z²). Pad the result with leading zeros to get <strong>2n</strong> digits. Extract the <strong>middle n</strong> digits to get the next number.
        </p>
        <p className="italic mt-2">
          Note: n must be an even number for the method to work best [Ref: Ch4 Part2, Slide 39].
        </p>
      </div>

      <div className="flex flex-wrap gap-5 mb-4">
        <div>
          <label className="font-bold mr-2.5">
            Seed (Z<sub>0</sub>):
          </label>
          <input
            type="number"
            value={seed}
            onChange={(e) => setSeed(parseInt(e.target.value))}
            className="p-2 border border-gray-300 rounded w-36"
            placeholder="e.g. 7182"
          />
          <small className="block mt-1 text-gray-600">Length determines 'n' (e.g. 4 digits)</small>
        </div>
        <div>
          <label className="font-bold mr-2.5">Iterations:</label>
          <input
            type="number"
            value={iterations}
            onChange={(e) => setIterations(parseInt(e.target.value))}
            className="p-2 border border-gray-300 rounded w-36"
          />
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={solveMidSquare}
          className="bg-blue-600 text-white px-5 py-2.5 border-none rounded cursor-pointer text-base mt-2.5 hover:bg-blue-700"
        >
          GENERATE TABLE
        </button>
      </div>

      {warning && (
        <div className="text-red-600 mb-2.5 mt-5">{warning}</div>
      )}

      {results.length > 0 && (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse mt-5 text-sm bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">
                  i
                </th>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">
                  Z<sub>i</sub> (Current)
                </th>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">
                  Z<sub>i</sub>² (Squared & Padded)
                </th>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">
                  Extracted Middle
                </th>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">
                  U<sub>i</sub> (Random Number)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="even:bg-gray-100">
                <td className="border border-gray-300 p-2 text-center">0</td>
                <td className="border border-gray-300 p-2 text-center">{seed}</td>
                <td className="border border-gray-300 p-2 text-center">-</td>
                <td className="border border-gray-300 p-2 text-center">-</td>
                <td className="border border-gray-300 p-2 text-center">-</td>
              </tr>
              {results.map((result, idx) => {
                const n = seed.toString().length
                const start = Math.floor((n * 2 - n) / 2)
                const end = start + n
                const before = result.square.substring(0, start)
                const middle = result.square.substring(start, end)
                const after = result.square.substring(end)

                return (
                  <tr key={idx} className="even:bg-gray-100 hover:bg-gray-200">
                    <td className="border border-gray-300 p-2 text-center">{result.i}</td>
                    <td className="border border-gray-300 p-2 text-center">
                      {result.zi}
                      {result.flag && (
                        <span className="text-red-600 text-xs ml-1">{result.flag}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 p-2 text-center font-mono">
                      <span className="text-gray-400">{before}</span>
                      <span className="text-orange-600 font-bold bg-yellow-100 px-0.5">{middle}</span>
                      <span className="text-gray-400">{after}</span>
                    </td>
                    <td className="border border-gray-300 p-2 text-center">{result.middle}</td>
                    <td className="border border-gray-300 p-2 text-center">{result.ui}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default MidSquare

