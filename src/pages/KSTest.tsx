import { useState, useEffect, useRef } from 'react'
import RandomGrid from '../components/RandomGrid'

interface CalcRow {
  interval: string
  observed: number
  expected: number
  diff: number
  diffSquared: number
  term: number
}

const chiTableLecture: Record<number, Record<number, number>> = {
  1: { 0.005: 7.88, 0.01: 6.63, 0.025: 5.02, 0.05: 3.84, 0.10: 2.71 },
  2: { 0.005: 10.60, 0.01: 9.21, 0.025: 7.38, 0.05: 5.99, 0.10: 4.61 },
  3: { 0.005: 12.84, 0.01: 11.34, 0.025: 9.35, 0.05: 7.81, 0.10: 6.25 },
  4: { 0.005: 14.96, 0.01: 13.28, 0.025: 11.14, 0.05: 9.49, 0.10: 7.78 },
  5: { 0.005: 16.7, 0.01: 15.1, 0.025: 12.8, 0.05: 11.1, 0.10: 9.2 },
  6: { 0.005: 18.5, 0.01: 16.8, 0.025: 14.4, 0.05: 12.6, 0.10: 10.6 },
  7: { 0.005: 20.3, 0.01: 18.5, 0.025: 16.0, 0.05: 14.1, 0.10: 12.0 },
  8: { 0.005: 22.0, 0.01: 20.1, 0.025: 17.5, 0.05: 15.5, 0.10: 13.4 },
  9: { 0.005: 23.6, 0.01: 21.7, 0.025: 19.0, 0.05: 16.9, 0.10: 14.7 },
  10: { 0.005: 25.2, 0.01: 23.2, 0.025: 20.5, 0.05: 18.3, 0.10: 16.0 },
  11: { 0.005: 26.8, 0.01: 24.7, 0.025: 21.9, 0.05: 19.7, 0.10: 17.3 },
  12: { 0.005: 28.3, 0.01: 26.2, 0.025: 23.3, 0.05: 21.0, 0.10: 18.5 },
  13: { 0.005: 29.8, 0.01: 27.7, 0.025: 24.7, 0.05: 22.4, 0.10: 19.8 },
  14: { 0.005: 31.3, 0.01: 29.1, 0.025: 26.1, 0.05: 23.7, 0.10: 21.1 },
  15: { 0.005: 32.8, 0.01: 30.6, 0.025: 27.5, 0.05: 25.0, 0.10: 22.3 },
  16: { 0.005: 34.3, 0.01: 32.0, 0.025: 28.8, 0.05: 26.3, 0.10: 23.5 },
  17: { 0.005: 35.7, 0.01: 33.4, 0.025: 30.2, 0.05: 27.6, 0.10: 24.8 },
  18: { 0.005: 37.2, 0.01: 34.8, 0.025: 31.5, 0.05: 28.9, 0.10: 26.0 },
  19: { 0.005: 38.6, 0.01: 36.2, 0.025: 32.9, 0.05: 30.1, 0.10: 27.2 },
}

const KSTest = () => {
  const [kVal, setKVal] = useState(10)
  const [alpha, setAlpha] = useState(0.05)
  const [inputMethod, setInputMethod] = useState<'table' | 'manual'>('table')
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [manualInput, setManualInput] = useState('')
  const [results, setResults] = useState<{
    N: number
    k: number
    df: number
    chiCalc: number
    chiCrit: number
    calcRows: CalcRow[]
    verdict: 'accepted' | 'rejected'
    sign: string
  } | null>(null)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleSelectNumber = (num: number) => {
    // Store exact value for highlighting, but use rounded value for calculations
    if (!selectedNumbers.some(n => Math.abs(n - num) < 0.0001)) {
      setSelectedNumbers([...selectedNumbers, num])
    }
  }

  const drawChiGraph = (calc: number, crit: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const w = canvas.width = canvas.offsetWidth
    const h = canvas.height = 350
    
    ctx.clearRect(0, 0, w, h)
    
    // Axis
    ctx.beginPath()
    ctx.moveTo(50, h - 50)
    ctx.lineTo(w - 50, h - 50)
    ctx.moveTo(50, h - 50)
    ctx.lineTo(50, 30)
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 2
    ctx.stroke()
    
    // Draw Curve
    ctx.beginPath()
    ctx.moveTo(50, h - 50)
    ctx.bezierCurveTo(50, 50, 200, 50, w - 50, h - 55)
    ctx.strokeStyle = '#2c3e50'
    ctx.lineWidth = 3
    ctx.stroke()
    
    // Scaling
    let maxX = Math.max(calc, crit) * 1.5
    if (maxX < 20) maxX = 20
    const getX = (val: number) => 50 + (val / maxX) * (w - 100)
    
    // Critical Line (Red)
    const xCrit = getX(crit)
    ctx.beginPath()
    ctx.moveTo(xCrit, h - 50)
    ctx.lineTo(xCrit, 50)
    ctx.strokeStyle = 'red'
    ctx.setLineDash([5, 5])
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.setLineDash([])
    
    ctx.fillStyle = 'red'
    ctx.font = 'bold 14px Arial'
    ctx.fillText('Critical: ' + crit.toFixed(2), xCrit + 5, 60)
    ctx.fillText('Rejection Region ->', xCrit + 5, 80)
    
    // Calculated Point (Blue)
    const xCalc = getX(calc)
    ctx.beginPath()
    ctx.arc(xCalc, h - 50, 8, 0, 2 * Math.PI)
    ctx.fillStyle = 'blue'
    ctx.fill()
    ctx.fillStyle = 'blue'
    ctx.textAlign = 'center'
    ctx.font = 'bold 14px Arial'
    ctx.fillText('Calc: ' + calc.toFixed(2), xCalc, h - 65)
    
    // Fill Rejection
    ctx.fillStyle = 'rgba(231, 76, 60, 0.2)'
    ctx.fillRect(xCrit, 50, w - 50 - xCrit, h - 100)
  }

  const runChiSquare = () => {
    // Get input data
    let dataStr = inputMethod === 'manual' ? manualInput : selectedNumbers.join(',')
    const R = dataStr.split(/[\s,]+/).map(x => parseFloat(x.trim())).filter(x => !isNaN(x))
    const N = R.length
    const k = kVal
    
    if (N === 0) {
      alert('Please enter numbers!')
      return
    }
    
    // Bucketing
    const buckets = new Array(k).fill(0)
    R.forEach(num => {
      let idx = Math.floor(num * k)
      if (idx >= k) idx = k - 1
      buckets[idx]++
    })
    
    const Ei = N / k
    let chiCal = 0
    const calcRows: CalcRow[] = []
    
    // Calculation Table
    for (let i = 0; i < k; i++) {
      const start = (i / k).toFixed(1)
      const end = ((i + 1) / k).toFixed(1)
      let range = `[${start}, ${end})`
      if (i === k - 1) range = `[${start}, 1.0]`
      
      const Oi = buckets[i]
      const diff = Oi - Ei
      const diffSquared = Math.pow(diff, 2)
      const term = diffSquared / Ei
      chiCal += term
      
      calcRows.push({
        interval: range,
        observed: Oi,
        expected: Ei,
        diff,
        diffSquared,
        term,
      })
    }
    
    // Critical Value
    const df = k - 1
    let chiCrit = 0
    
    if (chiTableLecture[df] && chiTableLecture[df][alpha]) {
      chiCrit = chiTableLecture[df][alpha]
    } else {
      // Approx for df > 19
      let z = 1.645
      if (alpha === 0.01) z = 2.33
      if (alpha === 0.10) z = 1.28
      const term = 1 - (2 / (9 * df)) + z * Math.sqrt(2 / (9 * df))
      chiCrit = df * Math.pow(term, 3)
    }
    
    // Verdict
    const verdict = chiCal < chiCrit ? 'accepted' : 'rejected'
    const sign = chiCal < chiCrit ? '<' : '>'
    
    setResults({
      N,
      k,
      df,
      chiCalc: chiCal,
      chiCrit,
      calcRows,
      verdict,
      sign,
    })
    
    // Draw graph after state update
    setTimeout(() => {
      drawChiGraph(chiCal, chiCrit)
    }, 100)
  }

  return (
    <div className="container mx-auto px-3 sm:px-5 py-5 max-w-6xl bg-white shadow-md mt-5 rounded-lg">
      <h1 className="text-primary border-b-2 border-teal-500 pb-2.5 mb-5">
        Tests for Random Numbers: Chi-Square (χ²)
      </h1>
      <div className="bg-teal-50 p-2.5 border-l-4 border-teal-500 mb-5">
        <strong>Goal:</strong> Test Uniformity Hypothesis H<sub>0</sub>: R<sub>i</sub> ~ U[0,1].
        <br />
        Follows standard Chi-Square test procedure (Pages 6-10 in Lecture).
      </div>

      <div className="bg-gray-100 p-5 rounded-lg border-l-4 border-blue-500 mb-5">
        <div className="flex flex-wrap gap-8 mb-4">
          <div>
            <label className="font-bold text-primary mr-2.5">Number of Intervals (k):</label>
            <input
              type="number"
              value={kVal}
              onChange={(e) => setKVal(parseInt(e.target.value))}
              min={2}
              className="w-20 p-2 border border-gray-300 rounded text-center"
            />
          </div>
          <div>
            <label className="font-bold text-primary mr-2.5">Significance Level (α):</label>
            <select
              value={alpha}
              onChange={(e) => setAlpha(parseFloat(e.target.value))}
              className="p-2 border border-gray-300 rounded text-center"
            >
              <option value={0.005}>0.005</option>
              <option value={0.01}>0.01</option>
              <option value={0.025}>0.025</option>
              <option value={0.05}>0.05</option>
              <option value={0.10}>0.10</option>
            </select>
          </div>
        </div>

        <div className="mb-2.5">
          <label className="font-bold mr-2.5">Input Method:</label>
          <input
            type="radio"
            name="method"
            value="table"
            checked={inputMethod === 'table'}
            onChange={() => setInputMethod('table')}
            className="mr-1"
          />
          Random Table (Click)
          <input
            type="radio"
            name="method"
            value="manual"
            checked={inputMethod === 'manual'}
            onChange={() => setInputMethod('manual')}
            className="ml-4 mr-1"
          />
          Manual Input
        </div>

        {inputMethod === 'table' && (
          <div>
            <RandomGrid
              onSelect={handleSelectNumber}
              selectedValues={selectedNumbers}
            />
            <div className="text-sm text-gray-600 mt-2.5">
              Selected numbers (N): <span className="font-bold text-blue-600">{selectedNumbers.length}</span>
            </div>
          </div>
        )}

        {inputMethod === 'manual' && (
          <textarea
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            rows={4}
            className="w-full p-2.5 text-sm border border-gray-300 rounded"
            placeholder="Paste numbers here (comma or space separated), e.g. 0.34, 0.90, 0.25..."
          />
        )}

        <div className="text-center mt-4">
          <button
            onClick={runChiSquare}
            className="bg-green-600 text-white px-6 py-2.5 text-base border-none rounded cursor-pointer mt-2.5 hover:bg-green-700"
          >
            CALCULATE & DRAW GRAPH
          </button>
        </div>
      </div>

      {results && (
        <div className="mt-8">
          <h3 className="border-b-2 border-blue-500 pb-1 text-primary mt-8">Step 1 & 2: Setup Hypothesis</h3>
          <div className="bg-white p-4 border border-gray-300 rounded-lg mt-4">
            <p className="text-orange-600 font-bold text-lg mb-1">Step 1: Divide [0, 1] into k subintervals.</p>
            <p>
              Number of classes (k) = <span className="font-bold">{results.k}</span>, Sample Size (N) ={' '}
              <span className="font-bold">{results.N}</span>
            </p>
            
            <p className="text-orange-600 font-bold text-lg mt-4 mb-1">Step 2: Null Hypothesis</p>
            <p>
              <strong>H<sub>0</sub>:</strong> The generated random numbers are Uniformly Distributed U[0,1].
            </p>
          </div>

          <h3 className="border-b-2 border-blue-500 pb-1 text-primary mt-8">Step 3: Frequency & Calculation Table</h3>
          <div className="bg-yellow-100 text-yellow-800 p-4 border border-yellow-300 rounded-lg mt-4 text-center font-serif text-xl">
            χ² = Σ (O<sub>i</sub> - E<sub>i</sub>)² / E<sub>i</sub>
            <br />
            <span className="text-base text-gray-600">Where E<sub>i</sub> (Expected) = N / k</span>
          </div>

          <table className="w-full border-collapse mt-4 text-base shadow-md">
            <thead>
              <tr>
                <th className="bg-primary text-white p-3 border border-primary text-center">Interval</th>
                <th className="bg-primary text-white p-3 border border-primary text-center">
                  Observed (O<sub>i</sub>)
                </th>
                <th className="bg-primary text-white p-3 border border-primary text-center">
                  Expected (E<sub>i</sub>)
                </th>
                <th className="bg-primary text-white p-3 border border-primary text-center">
                  O<sub>i</sub> - E<sub>i</sub>
                </th>
                <th className="bg-primary text-white p-3 border border-primary text-center">
                  (O<sub>i</sub> - E<sub>i</sub>)²
                </th>
                <th className="bg-primary text-white p-3 border border-primary text-center">
                  (O<sub>i</sub> - E<sub>i</sub>)² / E<sub>i</sub>
                </th>
              </tr>
            </thead>
            <tbody>
              {results.calcRows.map((row, idx) => (
                <tr key={idx} className="even:bg-gray-50">
                  <td className="p-2.5 border border-gray-300 text-center">{row.interval}</td>
                  <td className="p-2.5 border border-gray-300 text-center">{row.observed}</td>
                  <td className="p-2.5 border border-gray-300 text-center">{row.expected.toFixed(2)}</td>
                  <td className="p-2.5 border border-gray-300 text-center">{row.diff.toFixed(2)}</td>
                  <td className="p-2.5 border border-gray-300 text-center">{row.diffSquared.toFixed(2)}</td>
                  <td className="p-2.5 border border-gray-300 text-center">{row.term.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="font-bold bg-blue-50">
              <tr>
                <td colSpan={5} className="p-2.5 border border-gray-300 text-right">
                  <strong>Total χ²<sub>0</sub>:</strong>
                </td>
                <td className="p-2.5 border border-gray-300 text-blue-600 text-xl">
                  <strong>{results.chiCalc.toFixed(3)}</strong>
                </td>
              </tr>
            </tfoot>
          </table>

          <h3 className="border-b-2 border-blue-500 pb-1 text-primary mt-8">Step 4: Determine Critical Value</h3>
          <div className="bg-white p-4 border border-gray-300 rounded-lg mt-4">
            <p>
              Degrees of Freedom (df) = k - 1 = <span className="font-bold">{results.df}</span>
            </p>
            <p>
              Significance Level (α) = <span className="font-bold">{alpha}</span>
            </p>
            <p className="text-xl mt-2">
              Critical Value (χ²<sub>α, k-1</sub>) ={' '}
              <strong className="text-orange-600">{results.chiCrit.toFixed(3)}</strong>
            </p>
          </div>

          <p className="text-sm mt-4 text-gray-600">Reference Table (Lecture Slide 9):</p>
          <div className="max-h-64 overflow-y-auto border border-gray-300 mt-2">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="bg-gray-200 p-2 border border-gray-300 text-center sticky top-0">df</th>
                  <th className="bg-gray-200 p-2 border border-gray-300 text-center sticky top-0">0.005</th>
                  <th className="bg-gray-200 p-2 border border-gray-300 text-center sticky top-0">0.01</th>
                  <th className="bg-gray-200 p-2 border border-gray-300 text-center sticky top-0">0.025</th>
                  <th className="bg-gray-200 p-2 border border-gray-300 text-center sticky top-0">0.05</th>
                  <th className="bg-gray-200 p-2 border border-gray-300 text-center sticky top-0">0.10</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(chiTableLecture).map((dfStr) => {
                  const df = parseInt(dfStr)
                  const row = chiTableLecture[df]
                  const isHighlighted = df === results.df
                  return (
                    <tr
                      key={df}
                      className={isHighlighted ? 'bg-yellow-200 font-bold border-2 border-orange-500' : ''}
                      id={`row_df_${df}`}
                    >
                      <td className="p-2 border border-gray-300 text-center font-bold">{df}</td>
                      <td className="p-2 border border-gray-300 text-center">{row[0.005]}</td>
                      <td className="p-2 border border-gray-300 text-center">{row[0.01]}</td>
                      <td className="p-2 border border-gray-300 text-center">{row[0.025]}</td>
                      <td className="p-2 border border-gray-300 text-center">{row[0.05]}</td>
                      <td className="p-2 border border-gray-300 text-center">{row[0.10]}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <h3 className="border-b-2 border-blue-500 pb-1 text-primary mt-8">Step 5: Conclusion</h3>
          <div className="bg-yellow-100 text-yellow-800 p-4 border border-gray-800 rounded-lg mt-4 text-center font-serif text-xl">
            Condition: If χ²<sub>calc</sub> &lt; χ²<sub>crit</sub>, Accept H<sub>0</sub>.
          </div>
          
          <div className="text-center p-5 border-2 border-gray-300 rounded-lg bg-white mt-4">
            <p className="text-xl">
              χ²<sub>calc</sub> (<span className="text-blue-600">{results.chiCalc.toFixed(3)}</span>){' '}
              <span className="font-bold">{results.sign}</span> χ²<sub>crit</sub> (
              <span className="text-orange-600">{results.chiCrit.toFixed(3)}</span>)
            </p>
            <h2 className="mt-2.5 text-2xl">
              {results.verdict === 'accepted' ? (
                <span className="text-green-600">ACCEPTED H<sub>0</sub> (Uniform)</span>
              ) : (
                <span className="text-red-600">REJECTED H<sub>0</sub> (Not Uniform)</span>
              )}
            </h2>
          </div>

          <h3 className="border-b-2 border-blue-500 pb-1 text-primary mt-8">Graphical Representation</h3>
          <canvas
            ref={canvasRef}
            className="w-full bg-white border border-gray-300 rounded-lg mt-5"
            style={{ height: '350px' }}
          />
        </div>
      )}
    </div>
  )
}

export default KSTest
