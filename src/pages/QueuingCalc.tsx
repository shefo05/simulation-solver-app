import { useState } from 'react'

const QueuingCalc = () => {
  const [lambda, setLambda] = useState('')
  const [mu, setMu] = useState('')
  const [results, setResults] = useState<{
    rho: number
    p0: number
    Ls: number
    Lq: number
    Ws: number
    Wq: number
  } | null>(null)
  const [error, setError] = useState('')

  const calculateQueuing = () => {
    const λ = parseFloat(lambda)
    const μ = parseFloat(mu)

    if (isNaN(λ) || isNaN(μ)) {
      setError('Please enter valid numbers.')
      setResults(null)
      return
    }

    if (λ >= μ) {
      setError('Error: Service rate (μ) must be greater than Arrival rate (λ).')
      setResults(null)
      return
    }

    setError('')
    const rho = λ / μ
    const p0 = 1 - rho
    const Ls = λ / (μ - λ)
    const Lq = (λ * λ) / (μ * (μ - λ))
    const Ws = 1 / (μ - λ)
    const Wq = λ / (μ * (μ - λ))

    setResults({ rho, p0, Ls, Lq, Ws, Wq })
  }

  return (
    <div className="container mx-auto px-3 sm:px-5 py-5 max-w-6xl bg-white shadow-md mt-5 rounded-lg">
      <h1 className="text-primary border-b-2 border-teal-500 pb-2.5 mb-5">
        Queuing Theory Calculator (M/M/1)
      </h1>
      <div className="bg-teal-50 p-2.5 border-l-4 border-teal-500 mb-5">
        Calculate measures using <strong>λ (Arrival Rate)</strong> and <strong>μ (Service Rate)</strong>.
        <br />
        <em>Condition: System is stable only if μ &gt; λ.</em>
      </div>

      <div className="flex flex-wrap gap-5 mb-4">
        <div>
          <label className="font-bold mr-2.5">Arrival Rate (λ - Lambda):</label>
          <input
            type="number"
            value={lambda}
            onChange={(e) => setLambda(e.target.value)}
            placeholder="e.g. 4"
            step="0.01"
            className="p-2 border border-gray-300 rounded w-36"
          />
        </div>
        <div>
          <label className="font-bold mr-2.5">Service Rate (μ - Mu):</label>
          <input
            type="number"
            value={mu}
            onChange={(e) => setMu(e.target.value)}
            placeholder="e.g. 5"
            step="0.01"
            className="p-2 border border-gray-300 rounded w-36"
          />
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={calculateQueuing}
          className="bg-blue-600 text-white px-5 py-2.5 border-none rounded cursor-pointer text-base mt-2.5 hover:bg-blue-700"
        >
          CALCULATE & SHOW FORMULAS
        </button>
        {error && (
          <div className="text-red-600 font-bold mt-2.5">{error}</div>
        )}
      </div>

      {results && (
        <div className="mt-8 flex flex-wrap gap-5">
          <div className="flex-1 min-w-[300px] bg-green-50 border-2 border-green-600 p-5 rounded-lg">
            <h3 className="mt-0 border-b-2 border-gray-300 pb-2.5 mb-4">
              Calculated Results
            </h3>
            <div className="mb-3 text-base border-b border-gray-300 pb-1.5 flex justify-between">
              <strong>Server Utilization (ρ):</strong>
              <span className="text-red-700 font-bold text-lg">
                {(results.rho * 100).toFixed(2)} %
              </span>
            </div>
            <div className="mb-3 text-base border-b border-gray-300 pb-1.5 flex justify-between">
              <strong>Prob. Server Idle (P₀):</strong>
              <span className="text-red-700 font-bold text-lg">
                {results.p0.toFixed(3)}
              </span>
            </div>
            <div className="mb-3 text-base border-b border-gray-300 pb-1.5 flex justify-between">
              <strong>Avg. Number in System (Ls):</strong>
              <span className="text-red-700 font-bold text-lg">
                {results.Ls.toFixed(2)} cust
              </span>
            </div>
            <div className="mb-3 text-base border-b border-gray-300 pb-1.5 flex justify-between">
              <strong>Avg. Number in Queue (Lq):</strong>
              <span className="text-red-700 font-bold text-lg">
                {results.Lq.toFixed(2)} cust
              </span>
            </div>
            <div className="mb-3 text-base border-b border-gray-300 pb-1.5 flex justify-between">
              <strong>Avg. Time in System (Ws):</strong>
              <span className="text-red-700 font-bold text-lg">
                {results.Ws.toFixed(3)} min
              </span>
            </div>
            <div className="mb-3 text-base border-b border-gray-300 pb-1.5 flex justify-between">
              <strong>Avg. Waiting Time (Wq):</strong>
              <span className="text-red-700 font-bold text-lg">
                {results.Wq.toFixed(3)} min
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-[300px] bg-gray-50 border-2 border-gray-600 p-5 rounded-lg">
            <h3 className="mt-0 border-b-2 border-gray-300 pb-2.5 mb-4">
              Formulas Used
            </h3>
            <div className="mb-4 text-lg font-serif italic bg-white p-2 rounded border-l-4 border-blue-600">
              ρ = λ/μ
            </div>
            <div className="mb-4 text-lg font-serif italic bg-white p-2 rounded border-l-4 border-blue-600">
              P<sub>0</sub> = 1 - ρ
            </div>
            <div className="mb-4 text-lg font-serif italic bg-white p-2 rounded border-l-4 border-blue-600">
              L<sub>s</sub> = λ/(μ - λ)
            </div>
            <div className="mb-4 text-lg font-serif italic bg-white p-2 rounded border-l-4 border-blue-600">
              L<sub>q</sub> = λ²/(μ(μ - λ))
            </div>
            <div className="mb-4 text-lg font-serif italic bg-white p-2 rounded border-l-4 border-blue-600">
              W<sub>s</sub> = 1/(μ - λ)
            </div>
            <div className="mb-4 text-lg font-serif italic bg-white p-2 rounded border-l-4 border-blue-600">
              W<sub>q</sub> = λ/(μ(μ - λ))
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QueuingCalc

