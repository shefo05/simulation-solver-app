import { useState } from 'react'

interface LCGResult {
  i: number
  zi: number
  ui: string
  isCycleStart: boolean
  cycleNumber: number
}

const LCG = () => {
  const [a, setA] = useState(5)
  const [c, setC] = useState(3)
  const [m, setM] = useState(16)
  const [z0, setZ0] = useState(7)
  const [iterations, setIterations] = useState(50)
  const [results, setResults] = useState<LCGResult[]>([])

  const solveLCG = () => {
    const history = new Set<number>()
    history.add(z0)
    let cycleStarter: number | null = null
    let cycleCount = 1
    const newResults: LCGResult[] = [
      { i: 0, zi: z0, ui: '-', isCycleStart: false, cycleNumber: 0 }
    ]

    let z = z0
    for (let i = 1; i <= iterations; i++) {
      z = (a * z + c) % m
      const u = (z / m).toFixed(4)
      
      let isCycleStart = false
      let cycleNumber = 0

      if (history.has(z)) {
        if (cycleStarter === null) {
          cycleStarter = z
          cycleCount++
          isCycleStart = true
          cycleNumber = cycleCount
        } else if (z === cycleStarter) {
          cycleCount++
          isCycleStart = true
          cycleNumber = cycleCount
        }
      }

      history.add(z)
      newResults.push({ i, zi: z, ui: u, isCycleStart, cycleNumber })
    }

    setResults(newResults)
  }

  return (
    <div className="container mx-auto px-3 sm:px-5 py-5 max-w-6xl bg-white shadow-md mt-5 rounded-lg">
      <h1 className="text-primary border-b-2 border-teal-500 pb-2.5 mb-5">
        Random Number Generator (LCG)
      </h1>
      <div className="bg-teal-50 p-2.5 border-l-4 border-teal-500 mb-5">
        <p>
          Uses the Linear Congruential Generator method:{' '}
          <b>Z<sub>i</sub> = (a × Z<sub>i-1</sub> + c) mod m</b>
        </p>
      </div>

      <div className="flex flex-wrap gap-5 mb-4">
        <div>
          <label className="font-bold mr-2.5">Multiplier (a):</label>
          <input
            type="number"
            value={a}
            onChange={(e) => setA(parseInt(e.target.value))}
            className="p-2 border border-gray-300 rounded w-36"
          />
        </div>
        <div>
          <label className="font-bold mr-2.5">Increment (c):</label>
          <input
            type="number"
            value={c}
            onChange={(e) => setC(parseInt(e.target.value))}
            className="p-2 border border-gray-300 rounded w-36"
          />
        </div>
        <div>
          <label className="font-bold mr-2.5">Modulus (m):</label>
          <input
            type="number"
            value={m}
            onChange={(e) => setM(parseInt(e.target.value))}
            className="p-2 border border-gray-300 rounded w-36"
          />
        </div>
        <div>
          <label className="font-bold mr-2.5">
            Seed (Z<sub>0</sub>):
          </label>
          <input
            type="number"
            value={z0}
            onChange={(e) => setZ0(parseInt(e.target.value))}
            className="p-2 border border-gray-300 rounded w-36"
          />
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

      <button
        onClick={solveLCG}
        className="bg-blue-600 text-white px-5 py-2.5 border-none rounded cursor-pointer text-base mt-2.5 hover:bg-blue-700"
      >
        Generate Table
      </button>

      {results.length > 0 && (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse mt-5 text-sm bg-white">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">
                  i
                </th>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">
                  Z<sub>i</sub> (Integer)
                </th>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">
                  U<sub>i</sub> (Random Number)
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, idx) => (
                <tr
                  key={idx}
                  className={
                    result.isCycleStart
                      ? 'bg-yellow-100 text-yellow-800 font-bold border-l-4 border-yellow-500'
                      : 'even:bg-gray-100 hover:bg-gray-200'
                  }
                >
                  <td className="border border-gray-300 p-2 text-center">
                    {result.i}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {result.zi}
                    {result.isCycleStart && (
                      <span className="text-red-600 text-xs ml-2 font-bold uppercase">
                        ⟳ Cycle {result.cycleNumber} Start
                      </span>
                    )}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {result.ui}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default LCG

