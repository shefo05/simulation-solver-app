import { useState, useEffect } from 'react'
import RandomGrid from '../components/RandomGrid'

interface DistItem {
  time: number
  prob: number
  cp?: number
  s?: number
  e?: number
  base?: number
  precision?: number
  rangeStart?: number
  rangeEnd?: number
  cumProb?: number
}

interface SimulationRow {
  cust: number
  iatDisp: string
  arrClock: number
  stDisp: string
  begin: number
  end: number
  wait: number
  sys: number
  idle: number
}

const SingleServer = () => {
  const [numCust, setNumCust] = useState(10)
  const [iatMethod, setIatMethod] = useState<'manual' | 'table' | 'midsq' | 'lcg'>('table')
  const [stMethod, setStMethod] = useState<'manual' | 'table' | 'midsq' | 'lcg'>('table')
  const [iatRNs, setIatRNs] = useState<string>('')
  const [stRNs, setStRNs] = useState<string>('')
  const [iatDistRows, setIatDistRows] = useState<{ time: number; prob: number }[]>([
    { time: 1, prob: 0.125 },
    { time: 2, prob: 0.125 },
    { time: 3, prob: 0.125 },
    { time: 4, prob: 0.125 },
    { time: 5, prob: 0.125 },
    { time: 6, prob: 0.125 },
    { time: 7, prob: 0.125 },
    { time: 8, prob: 0.125 },
  ])
  const [stDistRows, setStDistRows] = useState<{ time: number; prob: number }[]>([
    { time: 1, prob: 0.10 },
    { time: 2, prob: 0.20 },
    { time: 3, prob: 0.30 },
    { time: 4, prob: 0.25 },
    { time: 5, prob: 0.10 },
    { time: 6, prob: 0.05 },
  ])
  const [iatLCGParams, setIatLCGParams] = useState({ a: 5, c: 3, m: 100, z0: 7 })
  const [stLCGParams, setStLCGParams] = useState({ a: 5, c: 3, m: 100, z0: 12 })
  const [iatMidSqSeed, setIatMidSqSeed] = useState(23)
  const [stMidSqSeed, setStMidSqSeed] = useState(45)
  const [iatLCGSteps, setIatLCGSteps] = useState<string>('')
  const [stLCGSteps, setStLCGSteps] = useState<string>('')
  const [iatMidSqSteps, setIatMidSqSteps] = useState<string>('')
  const [stMidSqSteps, setStMidSqSteps] = useState<string>('')
  const [results, setResults] = useState<{ rangeTables: string; simulationTable: SimulationRow[]; summary: string } | null>(null)

  // LCG Generation
  const genLCG = (type: 'iat' | 'st') => {
    const params = type === 'iat' ? iatLCGParams : stLCGParams
    const count = numCust
    let z = params.z0
    const res: number[] = []
    let html = `<h4>LCG Steps Table</h4><table class="w-full text-sm border-collapse text-center bg-white"><thead><tr class="bg-gray-200 p-2.5 border border-gray-300"><th class="p-2.5 border border-gray-300">i</th><th class="p-2.5 border border-gray-300">Z<sub>i</sub></th><th class="p-2.5 border border-gray-300">U<sub>i</sub></th><th class="p-2.5 border border-gray-300">RN</th></tr></thead><tbody>`
    html += `<tr><td class="p-2 border border-gray-300">0</td><td class="p-2 border border-gray-300">${z}</td><td class="p-2 border border-gray-300">-</td><td class="p-2 border border-gray-300">-</td></tr>`
    
    for (let i = 1; i <= count; i++) {
      z = (params.a * z + params.c) % params.m
      const u = z / params.m
      let rnInt = Math.floor(u * 100)
      if (rnInt === 0) rnInt = 100
      res.push(rnInt)
      html += `<tr><td class="p-2 border border-gray-300">${i}</td><td class="p-2 border border-gray-300">${z}</td><td class="p-2 border border-gray-300">${u.toFixed(4)}</td><td class="p-2 border border-gray-300 font-bold text-blue-600">${rnInt}</td></tr>`
    }
    html += `</tbody></table>`
    
    if (type === 'iat') {
      setIatLCGSteps(html)
      setIatRNs(res.join(', '))
    } else {
      setStLCGSteps(html)
      setStRNs(res.join(', '))
    }
  }

  // MidSquare Generation
  const genMidSquare = (type: 'iat' | 'st') => {
    const seed = type === 'iat' ? iatMidSqSeed : stMidSqSeed
    const count = numCust
    let z = seed
    const n = seed.toString().length
    const res: number[] = []
    let html = `<h4>Middle-Square Steps</h4><table class="w-full text-sm border-collapse text-center bg-white"><thead><tr class="bg-gray-200 p-2.5 border border-gray-300"><th class="p-2.5 border border-gray-300">i</th><th class="p-2.5 border border-gray-300">Z<sub>i</sub></th><th class="p-2.5 border border-gray-300">Z^2</th><th class="p-2.5 border border-gray-300">Mid</th><th class="p-2.5 border border-gray-300">RN</th></tr></thead><tbody>`
    html += `<tr><td class="p-2 border border-gray-300">0</td><td class="p-2 border border-gray-300">${z}</td><td class="p-2 border border-gray-300">-</td><td class="p-2 border border-gray-300">-</td><td class="p-2 border border-gray-300">-</td></tr>`
    
    for (let i = 1; i <= count; i++) {
      const sq = (z * z).toString().padStart(n * 2, '0')
      const start = Math.floor((sq.length - n) / 2)
      const mid = sq.substring(start, start + n)
      const nextZ = parseInt(mid)
      const visual = `<span class="text-gray-400">${sq.substring(0, start)}</span><span class="text-orange-600 font-bold bg-yellow-100 px-0.5">${mid}</span><span class="text-gray-400">${sq.substring(start + n)}</span>`
      let rnInt = n >= 2 ? parseInt(mid.substring(0, 2)) : nextZ
      if (rnInt === 0) rnInt = 100
      res.push(rnInt)
      html += `<tr><td class="p-2 border border-gray-300">${i}</td><td class="p-2 border border-gray-300">${nextZ}</td><td class="p-2 border border-gray-300 font-mono">${visual}</td><td class="p-2 border border-gray-300">${mid}</td><td class="p-2 border border-gray-300 font-bold text-blue-600">${rnInt}</td></tr>`
      z = nextZ
    }
    html += `</tbody></table>`
    
    if (type === 'iat') {
      setIatMidSqSteps(html)
      setIatRNs(res.join(', '))
    } else {
      setStMidSqSteps(html)
      setStRNs(res.join(', '))
    }
  }

  // Get Distribution from rows
  const getDist = (rows: { time: number; prob: number }[]): DistItem[] => {
    let maxDec = 0
    rows.forEach(r => {
      const probStr = r.prob.toString()
      if (probStr.includes('.')) {
        maxDec = Math.max(maxDec, probStr.split('.')[1].length)
      }
    })
    
    const base = maxDec > 2 ? 1000 : 100
    const prec = maxDec > 2 ? 3 : 2
    let cp = 0
    const dist: DistItem[] = []
    
    rows.forEach(r => {
      if (!isNaN(r.time) && !isNaN(r.prob)) {
        const old = cp
        cp = parseFloat((cp + r.prob).toFixed(prec))
        const s = Math.round(old * base) + 1
        const e = Math.round(cp * base)
        dist.push({
          time: r.time,
          prob: r.prob,
          cp,
          s,
          e,
          base,
          precision: prec,
          rangeStart: s,
          rangeEnd: e,
          cumProb: cp,
        })
      }
    })
    
    return dist
  }

  // Parse RN string
  const parseRN = (str: string, n: number, base: number): number[] => {
    let arr: number[] = []
    if (str && str.trim()) {
      arr = str.split(',').map(x => {
        const clean = x.trim()
        if (clean === '00' && base === 100) return 100
        if (clean === '000' && base === 1000) return 1000
        return parseInt(clean)
      }).filter(x => !isNaN(x))
    }
    while (arr.length < n) {
      arr.push(Math.floor(Math.random() * base) + 1)
    }
    return arr
  }

  // Get time from RN
  const getTime = (rn: number, dist: DistItem[]): number => {
    if (rn === 0) rn = 100
    for (const d of dist) {
      if (rn >= d.s! && rn <= d.e!) {
        return d.time
      }
    }
    return dist.length > 0 ? dist[dist.length - 1].time : 0
  }

  // Generate Range Table HTML
  const generateRangeTableHTML = (title: string, dist: DistItem[]): string => {
    if (dist.length === 0) return ''
    const base = dist[0].base!
    const pad = base === 1000 ? 3 : 2
    let html = `<div class="flex-1 min-w-full border border-gray-300 p-5 bg-white rounded-lg shadow-sm mb-5"><h4 class="mt-0 text-gray-700 border-b-3 border-blue-500 pb-2.5 mb-5 text-xl">${title} (Base ${base})</h4><table class="w-full text-sm border-collapse text-center bg-white border border-gray-300"><thead><tr><th class="border border-gray-300 p-2 bg-primary text-white">Time</th><th class="border border-gray-300 p-2 bg-primary text-white">Prob</th><th class="border border-gray-300 p-2 bg-primary text-white">Cum Prob</th><th class="border border-gray-300 p-2 bg-primary text-white">Range</th></tr></thead><tbody>`
    dist.forEach(d => {
      const sStr = d.s!.toString().padStart(pad, '0')
      const eStr = d.e === base ? (base === 1000 ? '000' : '00') : d.e!.toString().padStart(pad, '0')
      html += `<tr class="even:bg-gray-100"><td class="border border-gray-300 p-2">${d.time}</td><td class="border border-gray-300 p-2">${d.prob.toFixed(d.precision!)}</td><td class="border border-gray-300 p-2">${d.cp!.toFixed(d.precision!)}</td><td class="border border-gray-300 p-2 font-bold">${sStr} - ${eStr}</td></tr>`
    })
    html += `</tbody></table></div>`
    return html
  }

  // Solve Single Server
  const solveSingleServer = () => {
    const iatDist = getDist(iatDistRows)
    const stDist = getDist(stDistRows)
    
    if (!iatDist.length || !stDist.length) {
      alert('Check distributions')
      return
    }
    
    const iatB = iatDist[0].base!
    const stB = stDist[0].base!
    const iatRNsArray = parseRN(iatRNs, numCust, iatB)
    const stRNsArray = parseRN(stRNs, numCust, stB)
    
    const rangeHTML = `<div class="flex flex-wrap gap-5 mb-5">${generateRangeTableHTML('IAT Analysis', iatDist)}${generateRangeTableHTML('Service Analysis', stDist)}</div>`
    
    const simRows: SimulationRow[] = []
    let clock = 0
    let prevEnd = 0
    let sumW = 0
    let sumS = 0
    let sumI = 0
    let sumServ = 0
    
    for (let i = 0; i < numCust; i++) {
      let iat = 0
      let iatDisp = '-'
      if (i > 0) {
        const r = iatRNsArray[i]
        iat = getTime(r, iatDist)
        iatDisp = `${iat} (${r === 100 ? '00' : r})`
      }
      clock += iat
      
      const rS = stRNsArray[i]
      const st = getTime(rS, stDist)
      const stDisp = `${st} (${rS === 100 ? '00' : rS})`
      
      const begin = Math.max(clock, prevEnd)
      const end = begin + st
      const wait = begin - clock
      const sys = end - clock
      const idle = i === 0 ? 0 : Math.max(0, begin - prevEnd)
      
      sumW += wait
      sumS += sys
      sumI += idle
      sumServ += st
      prevEnd = end
      
      simRows.push({
        cust: i + 1,
        iatDisp,
        arrClock: clock,
        stDisp,
        begin,
        end,
        wait,
        sys,
        idle,
      })
    }
    
    const summary = `Results: Avg Wait: ${(sumW / numCust).toFixed(2)} | Util: ${((sumServ / prevEnd) * 100).toFixed(2)}%`
    
    setResults({
      rangeTables: rangeHTML,
      simulationTable: simRows,
      summary,
    })
  }

  const processTableClick = (val: number, type: 'iat' | 'st') => {
    const intVal = Math.floor(val * 100)
    let strVal = intVal.toString().padStart(2, '0')
    if (intVal === 0) strVal = '00'
    const current = type === 'iat' ? iatRNs : stRNs
    const newValue = current.length > 0 ? `${current}, ${strVal}` : strVal
    if (type === 'iat') {
      setIatRNs(newValue)
    } else {
      setStRNs(newValue)
    }
  }

  return (
    <div className="container mx-auto px-3 sm:px-5 py-5 max-w-6xl bg-white shadow-md mt-5 rounded-lg">
      <h1 className="text-primary border-b-2 border-teal-500 pb-2.5 mb-5">Single Server Queue Simulation</h1>
      <div className="bg-teal-50 p-2.5 border-l-4 border-teal-500 mb-5">
        <strong>Feature:</strong> Full Steps for LCG & Middle-Square generation. Interactive 10x10 Random Table.
      </div>

      <div className="text-center mb-8">
        <label className="text-xl mr-2.5">Number of Customers:</label>
        <input
          type="number"
          value={numCust}
          onChange={(e) => setNumCust(parseInt(e.target.value))}
          className="w-24 text-center p-2 text-xl font-bold border border-gray-300 rounded"
        />
      </div>

      <div className="mb-8 border border-gray-200 p-4 rounded-lg bg-gray-50">
        <h3 className="text-blue-600 mt-5 border-l-4 border-blue-500 pl-2.5 mb-4 text-xl">1. Interarrival Time (IAT)</h3>
        
        <div className="mb-5">
          <h4 className="text-gray-700 border-b-3 border-blue-500 pb-2.5 mb-5 text-xl">Distribution Table</h4>
          <table className="w-full border-collapse mt-2.5 text-sm bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">Time</th>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">Prob</th>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">Action</th>
              </tr>
            </thead>
            <tbody>
              {iatDistRows.map((row, idx) => (
                <tr key={idx} className="even:bg-gray-100 hover:bg-gray-200">
                  <td className="border border-gray-300 p-2 text-center">{row.time}</td>
                  <td className="border border-gray-300 p-2 text-center">{row.prob}</td>
                  <td className="border border-gray-300 p-2 text-center">
                    <button
                      onClick={() => setIatDistRows(iatDistRows.filter((_, i) => i !== idx))}
                      className="bg-red-700 text-white px-2.5 py-1.5 text-xs border-none rounded cursor-pointer hover:opacity-90"
                    >
                      X
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={() => setIatDistRows([...iatDistRows, { time: 0, prob: 0 }])}
            className="bg-blue-600 text-white px-4 py-2 border-none rounded cursor-pointer mt-2.5 hover:bg-blue-700"
          >
            + Add Row
          </button>
        </div>

        <div className="mb-4 p-5 bg-gray-100 rounded-lg border-l-4 border-primary">
          <label className="font-bold text-lg text-primary mr-2.5">IAT RNG Method:</label>
          <select
            value={iatMethod}
            onChange={(e) => setIatMethod(e.target.value as any)}
            className="p-2 text-base ml-2.5 border border-gray-300 rounded"
          >
            <option value="manual">1. Manual Input</option>
            <option value="table">2. Random Table (10x10 Grid)</option>
            <option value="midsq">3. Middle-Square</option>
            <option value="lcg">4. LCG Method</option>
          </select>

          {iatMethod === 'manual' && (
            <div className="mt-4">
              <textarea
                value={iatRNs}
                onChange={(e) => setIatRNs(e.target.value)}
                rows={3}
                className="w-full p-2.5 text-base border border-gray-300 rounded"
                placeholder="Selected numbers appear here..."
              />
            </div>
          )}

          {iatMethod === 'table' && (
            <div className="mt-4">
              <p className="text-sm mb-2.5 text-gray-600">Click to Add:</p>
              <RandomGrid
                onSelect={(val) => processTableClick(val, 'iat')}
                selectedValues={iatRNs.split(',').map(v => parseFloat(v.trim()) / 100).filter(v => !isNaN(v))}
              />
            </div>
          )}

          {iatMethod === 'midsq' && (
            <div className="mt-4">
              <div className="flex gap-4 items-center mb-4 flex-wrap">
                <label className="font-bold">Seed:</label>
                <input
                  type="number"
                  value={iatMidSqSeed}
                  onChange={(e) => setIatMidSqSeed(parseInt(e.target.value))}
                  className="w-20 p-2 text-center border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={() => genMidSquare('iat')}
                  className="bg-green-600 text-white px-5 py-2.5 text-sm border-none rounded cursor-pointer hover:bg-green-700"
                >
                  Generate & Steps
                </button>
              </div>
              {iatMidSqSteps && (
                <div className="mt-4 p-4 bg-gray-50 border border-dashed border-gray-300 rounded max-h-72 overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: iatMidSqSteps }} />
                </div>
              )}
            </div>
          )}

          {iatMethod === 'lcg' && (
            <div className="mt-4">
              <div className="bg-yellow-100 text-yellow-800 p-2.5 mb-4 rounded text-base border border-yellow-300 text-center font-serif font-bold">
                Z<sub>i</sub> = (a × Z<sub>i-1</sub> + c) mod m
              </div>
              <div className="flex gap-4 items-center mb-4 flex-wrap">
                <label className="font-bold">a:</label>
                <input
                  type="number"
                  value={iatLCGParams.a}
                  onChange={(e) => setIatLCGParams({ ...iatLCGParams, a: parseInt(e.target.value) })}
                  className="w-20 p-2 text-center border border-gray-300 rounded text-sm"
                />
                <label className="font-bold">c:</label>
                <input
                  type="number"
                  value={iatLCGParams.c}
                  onChange={(e) => setIatLCGParams({ ...iatLCGParams, c: parseInt(e.target.value) })}
                  className="w-20 p-2 text-center border border-gray-300 rounded text-sm"
                />
                <label className="font-bold">m:</label>
                <input
                  type="number"
                  value={iatLCGParams.m}
                  onChange={(e) => setIatLCGParams({ ...iatLCGParams, m: parseInt(e.target.value) })}
                  className="w-20 p-2 text-center border border-gray-300 rounded text-sm"
                />
                <label className="font-bold">Z<sub>0</sub>:</label>
                <input
                  type="number"
                  value={iatLCGParams.z0}
                  onChange={(e) => setIatLCGParams({ ...iatLCGParams, z0: parseInt(e.target.value) })}
                  className="w-20 p-2 text-center border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={() => genLCG('iat')}
                  className="bg-green-600 text-white px-5 py-2.5 text-sm border-none rounded cursor-pointer hover:bg-green-700"
                >
                  Gen & Steps
                </button>
              </div>
              {iatLCGSteps && (
                <div className="mt-4 p-4 bg-gray-50 border border-dashed border-gray-300 rounded max-h-72 overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: iatLCGSteps }} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mb-8 border border-gray-200 p-4 rounded-lg bg-gray-50">
        <h3 className="text-blue-600 mt-5 border-l-4 border-blue-500 pl-2.5 mb-4 text-xl">2. Service Time Distribution</h3>
        
        <div className="mb-5">
          <h4 className="text-gray-700 border-b-3 border-blue-500 pb-2.5 mb-5 text-xl">Distribution Table</h4>
          <table className="w-full border-collapse mt-2.5 text-sm bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">Time</th>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">Prob</th>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">Action</th>
              </tr>
            </thead>
            <tbody>
              {stDistRows.map((row, idx) => (
                <tr key={idx} className="even:bg-gray-100 hover:bg-gray-200">
                  <td className="border border-gray-300 p-2 text-center">{row.time}</td>
                  <td className="border border-gray-300 p-2 text-center">{row.prob}</td>
                  <td className="border border-gray-300 p-2 text-center">
                    <button
                      onClick={() => setStDistRows(stDistRows.filter((_, i) => i !== idx))}
                      className="bg-red-700 text-white px-2.5 py-1.5 text-xs border-none rounded cursor-pointer hover:opacity-90"
                    >
                      X
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={() => setStDistRows([...stDistRows, { time: 0, prob: 0 }])}
            className="bg-blue-600 text-white px-4 py-2 border-none rounded cursor-pointer mt-2.5 hover:bg-blue-700"
          >
            + Add Row
          </button>
        </div>

        <div className="mb-4 p-5 bg-gray-100 rounded-lg border-l-4 border-primary">
          <label className="font-bold text-lg text-primary mr-2.5">Service RNG Method:</label>
          <select
            value={stMethod}
            onChange={(e) => setStMethod(e.target.value as any)}
            className="p-2 text-base ml-2.5 border border-gray-300 rounded"
          >
            <option value="manual">1. Manual Input</option>
            <option value="table">2. Random Table (10x10 Grid)</option>
            <option value="midsq">3. Middle-Square</option>
            <option value="lcg">4. LCG Method</option>
          </select>

          {stMethod === 'manual' && (
            <div className="mt-4">
              <textarea
                value={stRNs}
                onChange={(e) => setStRNs(e.target.value)}
                rows={3}
                className="w-full p-2.5 text-base border border-gray-300 rounded"
                placeholder="Selected numbers appear here..."
              />
            </div>
          )}

          {stMethod === 'table' && (
            <div className="mt-4">
              <p className="text-sm mb-2.5 text-gray-600">Click to Add:</p>
              <RandomGrid
                onSelect={(val) => processTableClick(val, 'st')}
                selectedValues={stRNs.split(',').map(v => parseFloat(v.trim()) / 100).filter(v => !isNaN(v))}
              />
            </div>
          )}

          {stMethod === 'midsq' && (
            <div className="mt-4">
              <div className="flex gap-4 items-center mb-4 flex-wrap">
                <label className="font-bold">Seed:</label>
                <input
                  type="number"
                  value={stMidSqSeed}
                  onChange={(e) => setStMidSqSeed(parseInt(e.target.value))}
                  className="w-20 p-2 text-center border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={() => genMidSquare('st')}
                  className="bg-green-600 text-white px-5 py-2.5 text-sm border-none rounded cursor-pointer hover:bg-green-700"
                >
                  Generate & Steps
                </button>
              </div>
              {stMidSqSteps && (
                <div className="mt-4 p-4 bg-gray-50 border border-dashed border-gray-300 rounded max-h-72 overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: stMidSqSteps }} />
                </div>
              )}
            </div>
          )}

          {stMethod === 'lcg' && (
            <div className="mt-4">
              <div className="bg-yellow-100 text-yellow-800 p-2.5 mb-4 rounded text-base border border-yellow-300 text-center font-serif font-bold">
                Z<sub>i</sub> = (a × Z<sub>i-1</sub> + c) mod m
              </div>
              <div className="flex gap-4 items-center mb-4 flex-wrap">
                <label className="font-bold">a:</label>
                <input
                  type="number"
                  value={stLCGParams.a}
                  onChange={(e) => setStLCGParams({ ...stLCGParams, a: parseInt(e.target.value) })}
                  className="w-20 p-2 text-center border border-gray-300 rounded text-sm"
                />
                <label className="font-bold">c:</label>
                <input
                  type="number"
                  value={stLCGParams.c}
                  onChange={(e) => setStLCGParams({ ...stLCGParams, c: parseInt(e.target.value) })}
                  className="w-20 p-2 text-center border border-gray-300 rounded text-sm"
                />
                <label className="font-bold">m:</label>
                <input
                  type="number"
                  value={stLCGParams.m}
                  onChange={(e) => setStLCGParams({ ...stLCGParams, m: parseInt(e.target.value) })}
                  className="w-20 p-2 text-center border border-gray-300 rounded text-sm"
                />
                <label className="font-bold">Z<sub>0</sub>:</label>
                <input
                  type="number"
                  value={stLCGParams.z0}
                  onChange={(e) => setStLCGParams({ ...stLCGParams, z0: parseInt(e.target.value) })}
                  className="w-20 p-2 text-center border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={() => genLCG('st')}
                  className="bg-green-600 text-white px-5 py-2.5 text-sm border-none rounded cursor-pointer hover:bg-green-700"
                >
                  Gen & Steps
                </button>
              </div>
              {stLCGSteps && (
                <div className="mt-4 p-4 bg-gray-50 border border-dashed border-gray-300 rounded max-h-72 overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: stLCGSteps }} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="text-center mt-8 mb-12">
        <button
          onClick={solveSingleServer}
          className="bg-blue-600 text-white px-8 py-4 text-lg border-none rounded cursor-pointer hover:bg-blue-700"
        >
          SOLVE SIMULATION
        </button>
      </div>

      {results && (
        <div className="mt-8">
          <div dangerouslySetInnerHTML={{ __html: results.rangeTables }} />
          
          <h3 className="text-xl mb-4">Simulation Table</h3>
          <table className="w-full border-collapse mt-2.5 text-sm bg-white border border-gray-300">
            <thead>
              <tr>
                <th rowSpan={2} className="border border-gray-300 p-2 text-center bg-primary text-white">Cust</th>
                <th colSpan={5} className="border-b-2 border-black border border-gray-300 p-2 text-center bg-primary text-white">Simulation</th>
                <th colSpan={3} className="border-l-2 border-black border border-gray-300 p-2 text-center bg-primary text-white">Performance</th>
              </tr>
              <tr>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">IAT (RN)</th>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">Arr Clock</th>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">Serv (RN)</th>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">Begin</th>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">End</th>
                <th className="border-l-2 border-black border border-gray-300 p-2 text-center bg-primary text-white">Wait</th>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">System</th>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">Idle</th>
              </tr>
            </thead>
            <tbody>
              {results.simulationTable.map((row, idx) => (
                <tr key={idx} className="even:bg-gray-100 hover:bg-gray-200">
                  <td className="border border-gray-300 p-2 text-center">{row.cust}</td>
                  <td className="border border-gray-300 p-2 text-center">{row.iatDisp}</td>
                  <td className="border border-gray-300 p-2 text-center">{row.arrClock}</td>
                  <td className="border border-gray-300 p-2 text-center">{row.stDisp}</td>
                  <td className="border border-gray-300 p-2 text-center">{row.begin}</td>
                  <td className="border border-gray-300 p-2 text-center">{row.end}</td>
                  <td className="border-l-2 border-black border border-gray-300 p-2 text-center">{row.wait}</td>
                  <td className="border border-gray-300 p-2 text-center">{row.sys}</td>
                  <td className="border border-gray-300 p-2 text-center">{row.idle}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bg-yellow-100 p-2.5 border-l-4 border-yellow-500 mt-2.5 text-sm">
            <b>{results.summary}</b>
          </div>
        </div>
      )}
    </div>
  )
}

export default SingleServer
