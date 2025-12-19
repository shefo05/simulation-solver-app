import { useState } from 'react'
import RandomGrid from '../components/RandomGrid'

interface CalcRow {
  i: number
  xi: number
  xiPlusK: number
  diff1: number
  diff2: number
  product: number
}

interface SummaryRow {
  k: number
  rxx: number
  absRxx: number
}

const Autocorrelation = () => {
  const [inputMethod, setInputMethod] = useState<'manual' | 'table'>('table')
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [manualInput, setManualInput] = useState('')
  const [activeK, setActiveK] = useState<number>(1)
  const [results, setResults] = useState<{
    N: number
    mean: number
    variance: number
    devTable: Array<{ i: number; xi: number; diff: number; diffSq: number }>
    summary: SummaryRow[]
    calcDetails: Record<number, CalcRow[]>
    avgAbsR: number
    conclusion: string
  } | null>(null)

  const handleSelectNumber = (num: number) => {
    // Store exact value for highlighting, but use rounded value for calculations
    if (!selectedNumbers.some(n => Math.abs(n - num) < 0.0001)) {
      setSelectedNumbers([...selectedNumbers, num])
    }
  }

  const calculateR = (R: number[], mean: number, variance: number, k: number): number => {
    let numeratorSum = 0
    const N = R.length
    for (let i = 0; i < N - k; i++) {
      const term1 = R[i] - mean
      const term2 = R[i + k] - mean
      numeratorSum += term1 * term2
    }
    return numeratorSum / ((N - k) * variance)
  }

  const runAutocorrelation = () => {
    // Get input data
    let dataStr = inputMethod === 'manual' ? manualInput : selectedNumbers.map(n => n.toFixed(2)).join(', ')
    const R = dataStr.split(/[\s,]+/).map(x => parseFloat(x.trim())).filter(x => !isNaN(x))
    const N = R.length

    if (N < 3) {
      alert('Please enter at least 3 numbers.')
      return
    }

    // Step 1: Calculate Statistics (Mean & Variance)
    const sum = R.reduce((a, b) => a + b, 0)
    const mean = sum / N

    const devTable: Array<{ i: number; xi: number; diff: number; diffSq: number }> = []
    let sumSqDiff = 0

    for (let i = 0; i < N; i++) {
      const diff = R[i] - mean
      const diffSq = diff * diff
      sumSqDiff += diffSq
      devTable.push({
        i: i + 1,
        xi: R[i],
        diff,
        diffSq,
      })
    }

    const variance = sumSqDiff / (N - 1)

    // Step 2 & 3: Calculate for all possible k (1 to N-1, capped at 10)
    const maxK = Math.min(N - 1, 10)
    const summary: SummaryRow[] = []
    const calcDetails: Record<number, CalcRow[]> = {}
    let sumAbsR = 0

    for (let k = 1; k <= maxK; k++) {
      const rxx = calculateR(R, mean, variance, k)
      const absRxx = Math.abs(rxx)
      sumAbsR += absRxx

      summary.push({ k, rxx, absRxx })

      // Calculate detailed table for this k
      const detailRows: CalcRow[] = []
      for (let i = 0; i < N - k; i++) {
        const val1 = R[i]
        const val2 = R[i + k]
        const term1 = val1 - mean
        const term2 = val2 - mean
        const product = term1 * term2

        detailRows.push({
          i: i + 1,
          xi: val1,
          xiPlusK: val2,
          diff1: term1,
          diff2: term2,
          product,
        })
      }
      calcDetails[k] = detailRows
    }

    // Step 4: Final Conclusion
    const avgAbsR = sumAbsR / maxK
    let conclusion = ''
    if (avgAbsR < 0.25) {
      conclusion = 'Conclusion: INDEPENDENCE (Small Value)'
    } else {
      conclusion = 'Conclusion: DEPENDENCE (Large Value)'
    }

    setResults({
      N,
      mean,
      variance,
      devTable,
      summary,
      calcDetails,
      avgAbsR,
      conclusion,
    })

    // Set default active k to 1
    setActiveK(1)
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
          className="p-2 rounded ml-2.5 border border-gray-300"
        >
          <option value="manual">Manual Input (Paste)</option>
          <option value="table">Random Table (Click)</option>
        </select>

        {inputMethod === 'manual' && (
          <div className="mt-4">
            <textarea
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
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
        <button
          onClick={runAutocorrelation}
          className="bg-green-600 text-white px-6 py-2.5 text-base border-none rounded cursor-pointer hover:bg-green-700"
        >
          CALCULATE
        </button>
      </div>

      {results && (
        <div className="mt-8">
          <h3 className="border-b-2 border-blue-500 pb-1 text-primary mt-8">Step 1: Calculate Statistics</h3>
          <div className="bg-yellow-100 text-yellow-800 p-4 border border-yellow-300 rounded-lg mt-4 text-center font-serif text-xl">
            Mean (<span className="font-serif italic">x̄</span>) = Σ x<sub>i</sub> / N <br />
            Variance (S<sup>2</sup><sub>x</sub>) = Σ (x<sub>i</sub> - <span className="font-serif italic">x̄</span>)<sup>2</sup> / (N - 1)
          </div>
          <p className="text-lg text-center mt-4">
            <strong>N = </strong> <span>{results.N}</span> &nbsp;|&nbsp;{' '}
            <strong>
              <span className="font-serif italic">x̄</span> ={' '}
            </strong>{' '}
            <span className="text-blue-600 font-bold">{results.mean.toFixed(4)}</span> &nbsp;|&nbsp;{' '}
            <strong>
              S<sup>2</sup>
              <sub>x</sub> ={' '}
            </strong>{' '}
            <span className="text-red-600 font-bold">{results.variance.toFixed(5)}</span>
          </p>

          <table className="w-full border-collapse mt-4 text-base shadow-md">
            <thead>
              <tr>
                <th className="bg-primary text-white p-3 border border-primary text-center">i</th>
                <th className="bg-primary text-white p-3 border border-primary text-center">
                  x<sub>i</sub>
                </th>
                <th className="bg-primary text-white p-3 border border-primary text-center">
                  x<sub>i</sub> - <span className="font-serif italic">x̄</span>
                </th>
                <th className="bg-primary text-white p-3 border border-primary text-center">
                  (x<sub>i</sub> - <span className="font-serif italic">x̄</span>)<sup>2</sup>
                </th>
              </tr>
            </thead>
            <tbody>
              {results.devTable.map((row, idx) => (
                <tr key={idx} className="even:bg-gray-50">
                  <td className="p-2.5 border border-gray-300 text-center">{row.i}</td>
                  <td className="p-2.5 border border-gray-300 text-center">{row.xi}</td>
                  <td className="p-2.5 border border-gray-300 text-center">{row.diff.toFixed(4)}</td>
                  <td className="p-2.5 border border-gray-300 text-center">{row.diffSq.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="border-b-2 border-blue-500 pb-1 text-primary mt-8">Step 2: Detailed Calculation</h3>
          <p className="mt-4">Select a value for <strong>k</strong> (shift) to see the calculation details:</p>
          <div className="flex flex-wrap gap-2 mb-4 mt-4">
            {results.summary.map((row) => (
              <button
                key={row.k}
                onClick={() => setActiveK(row.k)}
                className={`px-5 py-2 border rounded-t-lg font-bold ${
                  activeK === row.k
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-gray-200 border-gray-300 hover:bg-gray-300'
                }`}
              >
                k={row.k}
              </button>
            ))}
          </div>

          <div className="bg-yellow-100 text-yellow-800 p-4 border border-yellow-300 rounded-lg mb-4 text-center font-serif text-xl">
            r<sub>xx</sub>(k) = [ Σ (x<sub>i</sub> - <span className="font-serif italic">x̄</span>)(x<sub>i+k</sub> -{' '}
            <span className="font-serif italic">x̄</span>) ] / [ (N - k) × S<sup>2</sup>
            <sub>x</sub> ]
          </div>

          {results.calcDetails[activeK] && (
            <>
              <table className="w-full border-collapse mt-4 text-base shadow-md">
                <thead>
                  <tr>
                    <th className="bg-primary text-white p-3 border border-primary text-center">i</th>
                    <th className="bg-primary text-white p-3 border border-primary text-center">
                      x<sub>i</sub>
                    </th>
                    <th className="bg-primary text-white p-3 border border-primary text-center">
                      x<sub>i+k</sub>
                    </th>
                    <th className="bg-primary text-white p-3 border border-primary text-center">
                      (x<sub>i</sub> - <span className="font-serif italic">x̄</span>)
                    </th>
                    <th className="bg-primary text-white p-3 border border-primary text-center">
                      (x<sub>i+k</sub> - <span className="font-serif italic">x̄</span>)
                    </th>
                    <th className="bg-primary text-white p-3 border border-primary text-center">Product</th>
                  </tr>
                </thead>
                <tbody>
                  {results.calcDetails[activeK].map((row, idx) => (
                    <tr key={idx} className="even:bg-gray-50">
                      <td className="p-2.5 border border-gray-300 text-center">{row.i}</td>
                      <td className="p-2.5 border border-gray-300 text-center">{row.xi}</td>
                      <td className="p-2.5 border border-gray-300 text-center">{row.xiPlusK}</td>
                      <td className="p-2.5 border border-gray-300 text-center">{row.diff1.toFixed(4)}</td>
                      <td className="p-2.5 border border-gray-300 text-center">{row.diff2.toFixed(4)}</td>
                      <td className="p-2.5 border border-gray-300 text-center">{row.product.toFixed(5)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-yellow-50">
                  <tr>
                    <td colSpan={5} className="p-2.5 border border-gray-300 text-right font-bold">
                      Sum of Products (Numerator):
                    </td>
                    <td className="p-2.5 border border-gray-300 text-center font-bold">
                      {results.calcDetails[activeK].reduce((sum, row) => sum + row.product, 0).toFixed(5)}
                    </td>
                  </tr>
                  <tr className="bg-green-50">
                    <td colSpan={5} className="p-2.5 border border-gray-300 text-right">
                      <strong>
                        r<sub>xx</sub>({activeK})
                      </strong>{' '}
                      ={' '}
                      {results.calcDetails[activeK].reduce((sum, row) => sum + row.product, 0).toFixed(5)} / [ ({results.N} - {activeK}) × {results.variance.toFixed(5)} ] =
                    </td>
                    <td className="p-2.5 border border-gray-300 text-center text-blue-600 text-xl font-bold">
                      {results.summary.find((s) => s.k === activeK)?.rxx.toFixed(5)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </>
          )}

          <h3 className="border-b-2 border-blue-500 pb-1 text-primary mt-8">Step 3: Summary Table</h3>
          <p className="mt-4">Correlation Coefficient r<sub>xx</sub>(k) for different values of k:</p>
          <div className="flex justify-center mt-4">
            <table className="w-full max-w-2xl border-collapse text-base shadow-md">
              <thead>
                <tr>
                  <th className="bg-primary text-white p-3 border border-primary text-center">k</th>
                  <th className="bg-primary text-white p-3 border border-primary text-center">
                    r<sub>xx</sub>(k)
                  </th>
                  <th className="bg-primary text-white p-3 border border-primary text-center">
                    |r<sub>xx</sub>(k)|
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.summary.map((row, idx) => (
                  <tr key={idx} className="even:bg-gray-50">
                    <td className="p-2.5 border border-gray-300 text-center">{row.k}</td>
                    <td
                      className={`p-2.5 border border-gray-300 text-center font-bold ${
                        row.rxx >= 0 ? 'text-blue-600' : 'text-red-600'
                      }`}
                    >
                      {row.rxx.toFixed(5)}
                    </td>
                    <td className="p-2.5 border border-gray-300 text-center">{row.absRxx.toFixed(5)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="border-b-2 border-blue-500 pb-1 text-primary mt-8">Step 4: Conclusion</h3>
          <div className="bg-white border-2 border-green-500 p-5 rounded-lg text-center mt-4 shadow-md">
            <p className="text-lg">Compute Average of Absolute Correlations:</p>
            <div className="text-2xl my-4">
              Avg = <span className="text-orange-600 font-bold">{results.avgAbsR.toFixed(5)}</span>
            </div>
            <div
              className={`text-xl font-bold mt-2.5 ${
                results.avgAbsR < 0.25 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {results.conclusion}
            </div>
            <p className="text-sm text-gray-600 mt-4">
              * If the value is close to zero, it indicates <strong>Independence</strong>.<br />
              * If close to 1, it indicates <strong>Dependence</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Autocorrelation
