import { useState, useEffect } from 'react'
import RandomGrid from '../components/RandomGrid'

interface DistItem {
  t: number
  p: number
  cp: number
  s: number
  e: number
  rangeStart: number
  rangeEnd: number
  cumProb: number
}

interface SimulationRow {
  cust: number
  rnArr: string | number
  iat: number
  arrClock: number
  server: string
  rnServ: number
  servTime: number
  ableStart: string | number
  ableEnd: string | number
  bakerStart: string | number
  bakerEnd: string | number
  queueTime: number
}

const MultiServer = () => {
  const [numCust, setNumCust] = useState(10)
  const [idlePref, setIdlePref] = useState<'Able' | 'Baker'>('Able')
  
  // IAT Distribution
  const [iatRows, setIatRows] = useState<{ time: number; prob: number }[]>([
    { time: 1, prob: 0.25 },
    { time: 2, prob: 0.40 },
    { time: 3, prob: 0.20 },
    { time: 4, prob: 0.15 },
  ])
  const [iatMethod, setIatMethod] = useState<'manual' | 'table' | 'midsq' | 'lcg'>('table')
  const [iatRN, setIatRN] = useState('')
  const [iatLCGParams, setIatLCGParams] = useState({ a: 5, c: 3, m: 100, z0: 7 })
  const [iatMidSqSeed, setIatMidSqSeed] = useState(23)
  const [iatLCGSteps, setIatLCGSteps] = useState<string>('')
  const [iatMidSqSteps, setIatMidSqSteps] = useState<string>('')
  
  // Able Distribution
  const [ableRows, setAbleRows] = useState<{ time: number; prob: number }[]>([
    { time: 2, prob: 0.30 },
    { time: 3, prob: 0.28 },
    { time: 4, prob: 0.25 },
    { time: 5, prob: 0.17 },
  ])
  
  // Baker Distribution
  const [bakerRows, setBakerRows] = useState<{ time: number; prob: number }[]>([
    { time: 3, prob: 0.35 },
    { time: 4, prob: 0.25 },
    { time: 5, prob: 0.20 },
    { time: 6, prob: 0.20 },
  ])
  
  // Service RNG
  const [servMethod, setServMethod] = useState<'manual' | 'table' | 'midsq' | 'lcg'>('table')
  const [servRN, setServRN] = useState('')
  const [servLCGParams, setServLCGParams] = useState({ a: 5, c: 3, m: 100, z0: 12 })
  const [servMidSqSeed, setServMidSqSeed] = useState(45)
  const [servLCGSteps, setServLCGSteps] = useState<string>('')
  const [servMidSqSteps, setServMidSqSteps] = useState<string>('')
  
  const [results, setResults] = useState<{
    rangeTables: string
    simulationTable: SimulationRow[]
    totals: {
      totalServiceTime: number
      totalAbleServiceTime: number
      totalBakerServiceTime: number
      totalQueueTime: number
    }
  } | null>(null)

  // Get Distribution
  const getDist = (rows: { time: number; prob: number }[]): DistItem[] => {
    let cp = 0
    const dist: DistItem[] = []
    
    rows.forEach(row => {
      if (!isNaN(row.time) && !isNaN(row.prob)) {
        const old = cp
        cp = parseFloat((cp + row.prob).toFixed(3))
        const s = Math.round(old * 100) + 1
        const e = Math.round(cp * 100)
        dist.push({
          t: row.time,
          p: row.prob,
          cp,
          s,
          e,
          rangeStart: s,
          rangeEnd: e,
          cumProb: cp,
        })
      }
    })
    
    return dist
  }

  // Update Distribution Table Columns
  const updateDistributionTableColumns = (rows: { time: number; prob: number }[], dist: DistItem[]) => {
    // This is handled by rendering the dist data in the table
  }

  // Get Time from RN
  const getT = (rn: number, dist: DistItem[]): number => {
    if (rn === 0) rn = 100
    for (const d of dist) {
      if (rn >= d.s && rn <= d.e) {
        return d.t
      }
    }
    return dist.length > 0 ? dist[dist.length - 1].t : 0
  }

  // Generate Table HTML
  const genTableHTML = (title: string, dist: DistItem[]): string => {
    let h = `<div class="flex-1 min-w-[48%] border border-gray-300 p-5 bg-white rounded-lg shadow-sm mb-5"><h4 class="mt-0 text-gray-700 border-b-3 border-blue-500 pb-2.5 mb-5 text-xl">${title} Range</h4><table class="w-full text-sm border-collapse text-center bg-white border border-gray-300"><thead><tr><th class="border border-gray-300 p-2 bg-primary text-white">Time</th><th class="border border-gray-300 p-2 bg-primary text-white">Prob</th><th class="border border-gray-300 p-2 bg-primary text-white">Cum</th><th class="border border-gray-300 p-2 bg-primary text-white">Range</th></tr></thead><tbody>`
    dist.forEach(d => {
      const s = d.s.toString().padStart(2, '0')
      const e = d.e === 100 ? '00' : d.e.toString().padStart(2, '0')
      h += `<tr class="even:bg-gray-100"><td class="border border-gray-300 p-2">${d.t}</td><td class="border border-gray-300 p-2">${d.p}</td><td class="border border-gray-300 p-2">${d.cp}</td><td class="border border-gray-300 p-2">${s}-${e}</td></tr>`
    })
    return h + '</tbody></table></div>'
  }

  // LCG Generation
  const genLCG = (type: 'iat' | 'serv') => {
    const params = type === 'iat' ? iatLCGParams : servLCGParams
    const count = numCust
    let z = params.z0
    const res: number[] = []
    let html = `<h4>LCG Steps</h4><table class="w-full text-sm border-collapse text-center bg-white"><thead><tr class="bg-gray-200 p-2.5 border border-gray-300"><th class="p-2.5 border border-gray-300">i</th><th class="p-2.5 border border-gray-300">Zi</th><th class="p-2.5 border border-gray-300">Ui</th><th class="p-2.5 border border-gray-300">RN</th></tr></thead><tbody>`
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
      setIatRN(res.join(', '))
    } else {
      setServLCGSteps(html)
      setServRN(res.join(', '))
    }
  }

  // MidSquare Generation
  const genMidSquare = (type: 'iat' | 'serv') => {
    const seed = type === 'iat' ? iatMidSqSeed : servMidSqSeed
    const count = numCust
    let z = seed
    const n = seed.toString().length
    const res: number[] = []
    let html = `<h4>Mid-Sq Steps</h4><table class="w-full text-sm border-collapse text-center bg-white"><thead><tr class="bg-gray-200 p-2.5 border border-gray-300"><th class="p-2.5 border border-gray-300">i</th><th class="p-2.5 border border-gray-300">Zi</th><th class="p-2.5 border border-gray-300">Z^2</th><th class="p-2.5 border border-gray-300">Mid</th><th class="p-2.5 border border-gray-300">RN</th></tr></thead><tbody>`
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
      setIatRN(res.join(', '))
    } else {
      setServMidSqSteps(html)
      setServRN(res.join(', '))
    }
  }

  // Process Table Click
  const processTableClick = (val: number, type: 'iat' | 'serv') => {
    const intVal = Math.floor(val * 100)
    let strVal = intVal.toString().padStart(2, '0')
    if (intVal === 0) strVal = '00'
    const current = type === 'iat' ? iatRN : servRN
    const newValue = current.length > 0 ? `${current}, ${strVal}` : strVal
    if (type === 'iat') {
      setIatRN(newValue)
    } else {
      setServRN(newValue)
    }
  }

  // Solve Multi
  const solveMulti = () => {
    const iatD = getDist(iatRows)
    const ableD = getDist(ableRows)
    const bakerD = getDist(bakerRows)
    
    updateDistributionTableColumns(iatRows, iatD)
    updateDistributionTableColumns(ableRows, ableD)
    updateDistributionTableColumns(bakerRows, bakerD)
    
    let iatRNs = iatRN.split(',').filter(x => x.trim() !== '').map(Number)
    let servRNs = servRN.split(',').filter(x => x.trim() !== '').map(Number)
    
    while (iatRNs.length < numCust) {
      iatRNs.push(Math.floor(Math.random() * 100) + 1)
    }
    while (servRNs.length < numCust) {
      servRNs.push(Math.floor(Math.random() * 100) + 1)
    }
    
    const rangeTables = `<div class="flex flex-wrap gap-5 mb-5">${genTableHTML('IAT', iatD)}${genTableHTML('Able', ableD)}${genTableHTML('Baker', bakerD)}</div>`
    
    const simRows: SimulationRow[] = []
    let clock = 0
    let ableFree = 0
    let bakerFree = 0
    let totalServiceTime = 0
    let totalAbleServiceTime = 0
    let totalBakerServiceTime = 0
    let totalQueueTime = 0
    
    for (let i = 0; i < numCust; i++) {
      const rnArr = i === 0 ? '-' : iatRNs[i]
      const iat = i === 0 ? 0 : getT(iatRNs[i], iatD)
      clock += iat
      
      let server = ''
      let start = 0
      
      // Logic with Preference Switch
      if (ableFree <= clock && bakerFree <= clock) {
        server = idlePref
        start = clock
      } else if (ableFree <= clock) {
        server = 'Able'
        start = clock
      } else if (bakerFree <= clock) {
        server = 'Baker'
        start = clock
      } else {
        if (ableFree <= bakerFree) {
          server = 'Able'
          start = ableFree
        } else {
          server = 'Baker'
          start = bakerFree
        }
      }
      
      const rnServ = servRNs[i]
      const st = server === 'Able' ? getT(rnServ, ableD) : getT(rnServ, bakerD)
      const end = start + st
      const q = start - clock
      
      totalServiceTime += st
      if (server === 'Able') {
        totalAbleServiceTime += st
      } else {
        totalBakerServiceTime += st
      }
      totalQueueTime += q
      
      let as: string | number = '-'
      let ae: string | number = '-'
      let bs: string | number = '-'
      let be: string | number = '-'
      
      if (server === 'Able') {
        as = start
        ae = end
        ableFree = end
      } else {
        bs = start
        be = end
        bakerFree = end
      }
      
      simRows.push({
        cust: i + 1,
        rnArr,
        iat,
        arrClock: clock,
        server,
        rnServ,
        servTime: st,
        ableStart: as,
        ableEnd: ae,
        bakerStart: bs,
        bakerEnd: be,
        queueTime: q,
      })
    }
    
    setResults({
      rangeTables,
      simulationTable: simRows,
      totals: {
        totalServiceTime,
        totalAbleServiceTime,
        totalBakerServiceTime,
        totalQueueTime,
      },
    })
  }

  return (
    <div className="container mx-auto px-3 sm:px-5 py-5 max-w-6xl bg-white shadow-md mt-5 rounded-lg">
      <h1 className="text-primary border-b-2 border-teal-500 pb-2.5 mb-5">
        Multi-Server (Able & Baker)
      </h1>
      <div className="bg-teal-50 p-2.5 border-l-4 border-teal-500 mb-5">
        <strong>Logic:</strong> Configure priority below. Service times use one common stream of Random Numbers.
      </div>

      <div className="text-center mb-8 bg-gray-50 p-4 border border-gray-300 rounded-lg">
        <label className="text-xl mr-2.5">Number of Customers:</label>
        <input
          type="number"
          value={numCust}
          onChange={(e) => setNumCust(parseInt(e.target.value))}
          className="w-24 text-center p-2 text-xl font-bold border border-gray-300 rounded mr-8"
        />
        <label className="text-xl mr-2.5">If both Idle, prioritize:</label>
        <select
          value={idlePref}
          onChange={(e) => setIdlePref(e.target.value as 'Able' | 'Baker')}
          className="p-2 text-lg font-bold border-2 border-primary rounded"
        >
          <option value="Able">Able</option>
          <option value="Baker">Baker</option>
        </select>
      </div>

      <div className="mb-5 border border-gray-200 p-4 rounded-lg bg-gray-50">
        <h3 className="text-blue-600 mt-5 border-l-4 border-blue-500 pl-2.5 mb-4 text-xl">1. Interarrival Time (IAT)</h3>
        
        <div className="mb-5">
          <h4 className="text-gray-700 border-b-3 border-blue-500 pb-2.5 mb-5 text-xl">IAT Distribution</h4>
          <table className="w-full border-collapse mt-2.5 text-sm bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">Time</th>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">Prob</th>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">cum F</th>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">Interval</th>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">Action</th>
              </tr>
            </thead>
            <tbody>
              {iatRows.map((row, idx) => {
                const dist = getDist(iatRows)
                const distItem = dist[idx]
                return (
                  <tr key={idx} className="even:bg-gray-100 hover:bg-gray-200">
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="number"
                        value={row.time}
                        onChange={(e) => {
                          const newRows = [...iatRows]
                          newRows[idx].time = parseFloat(e.target.value) || 0
                          setIatRows(newRows)
                        }}
                        className="w-full p-1 border border-gray-300 rounded text-center"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="number"
                        step="0.001"
                        value={row.prob}
                        onChange={(e) => {
                          const newRows = [...iatRows]
                          newRows[idx].prob = parseFloat(e.target.value) || 0
                          setIatRows(newRows)
                        }}
                        className="w-full p-1 border border-gray-300 rounded text-center"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center font-bold">
                      {distItem ? distItem.cumProb.toFixed(3) : ''}
                    </td>
                    <td className="border border-gray-300 p-2 text-center font-bold">
                      {distItem ? (() => {
                        const s = distItem.rangeStart.toString().padStart(2, '0')
                        const e = distItem.rangeEnd === 100 ? '00' : distItem.rangeEnd.toString().padStart(2, '0')
                        return `${s}-${e}`
                      })() : ''}
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <button
                        onClick={() => setIatRows(iatRows.filter((_, i) => i !== idx))}
                        className="bg-red-700 text-white px-2.5 py-1.5 text-xs border-none rounded cursor-pointer hover:opacity-90"
                      >
                        X
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <button
            onClick={() => setIatRows([...iatRows, { time: 0, prob: 0 }])}
            className="bg-blue-600 text-white px-4 py-2 border-none rounded cursor-pointer mt-2.5 hover:bg-blue-700"
          >
            + Add Row
          </button>
        </div>

        <div className="mb-4 p-5 bg-gray-100 rounded-lg border-l-4 border-primary">
          <label className="font-bold text-lg text-primary mr-2.5">IAT Random Number Generation:</label>
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
                value={iatRN}
                onChange={(e) => setIatRN(e.target.value)}
                rows={3}
                className="w-full p-2.5 text-base border border-gray-300 rounded"
                placeholder="Selected numbers will appear here..."
              />
            </div>
          )}

          {iatMethod === 'table' && (
            <div className="mt-4">
              <p className="text-sm mb-2.5 text-gray-600">Click numbers to add them:</p>
              <RandomGrid
                onSelect={(val) => processTableClick(val, 'iat')}
                selectedValues={iatRN.split(',').map(v => parseFloat(v.trim()) / 100).filter(v => !isNaN(v))}
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
                <label className="font-bold">Z0:</label>
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

      <div className="mb-5 border border-gray-200 p-4 rounded-lg bg-gray-50">
        <h3 className="text-blue-600 mt-5 border-l-4 border-blue-500 pl-2.5 mb-4 text-xl">2. Service Time Distribution (Pool)</h3>
        
        <div className="flex flex-wrap gap-5 mb-5">
          <div className="flex-1 min-w-[48%] border border-gray-300 p-5 bg-white rounded-lg shadow-sm">
            <h4 className="text-gray-700 border-b-3 border-blue-500 pb-2.5 mb-5 text-xl">Able (Server A)</h4>
            <table className="w-full border-collapse mt-2.5 text-sm bg-white border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">Time</th>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">Prob</th>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">cum F</th>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">Interval</th>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">Action</th>
                </tr>
              </thead>
              <tbody>
                {ableRows.map((row, idx) => {
                  const dist = getDist(ableRows)
                  const distItem = dist[idx]
                  return (
                    <tr key={idx} className="even:bg-gray-100 hover:bg-gray-200">
                      <td className="border border-gray-300 p-2 text-center">
                        <input
                          type="number"
                          value={row.time}
                          onChange={(e) => {
                            const newRows = [...ableRows]
                            newRows[idx].time = parseFloat(e.target.value) || 0
                            setAbleRows(newRows)
                          }}
                          className="w-full p-1 border border-gray-300 rounded text-center"
                        />
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        <input
                          type="number"
                          step="0.001"
                          value={row.prob}
                          onChange={(e) => {
                            const newRows = [...ableRows]
                            newRows[idx].prob = parseFloat(e.target.value) || 0
                            setAbleRows(newRows)
                          }}
                          className="w-full p-1 border border-gray-300 rounded text-center"
                        />
                      </td>
                      <td className="border border-gray-300 p-2 text-center font-bold">
                        {distItem ? distItem.cumProb.toFixed(3) : ''}
                      </td>
                      <td className="border border-gray-300 p-2 text-center font-bold">
                        {distItem ? (() => {
                          const s = distItem.rangeStart.toString().padStart(2, '0')
                          const e = distItem.rangeEnd === 100 ? '00' : distItem.rangeEnd.toString().padStart(2, '0')
                          return `${s}-${e}`
                        })() : ''}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        <button
                          onClick={() => setAbleRows(ableRows.filter((_, i) => i !== idx))}
                          className="bg-red-700 text-white px-2.5 py-1.5 text-xs border-none rounded cursor-pointer hover:opacity-90"
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <button
              onClick={() => setAbleRows([...ableRows, { time: 0, prob: 0 }])}
              className="bg-blue-600 text-white px-4 py-2 border-none rounded cursor-pointer mt-2.5 hover:bg-blue-700"
            >
              + Add Row
            </button>
          </div>

          <div className="flex-1 min-w-[48%] border border-gray-300 p-5 bg-white rounded-lg shadow-sm">
            <h4 className="text-gray-700 border-b-3 border-blue-500 pb-2.5 mb-5 text-xl">Baker (Server B)</h4>
            <table className="w-full border-collapse mt-2.5 text-sm bg-white border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">Time</th>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">Prob</th>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">cum F</th>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">Interval</th>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">Action</th>
                </tr>
              </thead>
              <tbody>
                {bakerRows.map((row, idx) => {
                  const dist = getDist(bakerRows)
                  const distItem = dist[idx]
                  return (
                    <tr key={idx} className="even:bg-gray-100 hover:bg-gray-200">
                      <td className="border border-gray-300 p-2 text-center">
                        <input
                          type="number"
                          value={row.time}
                          onChange={(e) => {
                            const newRows = [...bakerRows]
                            newRows[idx].time = parseFloat(e.target.value) || 0
                            setBakerRows(newRows)
                          }}
                          className="w-full p-1 border border-gray-300 rounded text-center"
                        />
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        <input
                          type="number"
                          step="0.001"
                          value={row.prob}
                          onChange={(e) => {
                            const newRows = [...bakerRows]
                            newRows[idx].prob = parseFloat(e.target.value) || 0
                            setBakerRows(newRows)
                          }}
                          className="w-full p-1 border border-gray-300 rounded text-center"
                        />
                      </td>
                      <td className="border border-gray-300 p-2 text-center font-bold">
                        {distItem ? distItem.cumProb.toFixed(3) : ''}
                      </td>
                      <td className="border border-gray-300 p-2 text-center font-bold">
                        {distItem ? (() => {
                          const s = distItem.rangeStart.toString().padStart(2, '0')
                          const e = distItem.rangeEnd === 100 ? '00' : distItem.rangeEnd.toString().padStart(2, '0')
                          return `${s}-${e}`
                        })() : ''}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        <button
                          onClick={() => setBakerRows(bakerRows.filter((_, i) => i !== idx))}
                          className="bg-red-700 text-white px-2.5 py-1.5 text-xs border-none rounded cursor-pointer hover:opacity-90"
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <button
              onClick={() => setBakerRows([...bakerRows, { time: 0, prob: 0 }])}
              className="bg-blue-600 text-white px-4 py-2 border-none rounded cursor-pointer mt-2.5 hover:bg-blue-700"
            >
              + Add Row
            </button>
          </div>
        </div>

        <div className="mb-4 p-5 bg-gray-100 rounded-lg border-l-4 border-primary">
          <label className="font-bold text-lg text-primary mr-2.5">Service Random Number Generation:</label>
          <select
            value={servMethod}
            onChange={(e) => setServMethod(e.target.value as any)}
            className="p-2 text-base ml-2.5 border border-gray-300 rounded"
          >
            <option value="manual">1. Manual Input</option>
            <option value="table">2. Random Table (10x10 Grid)</option>
            <option value="midsq">3. Middle-Square</option>
            <option value="lcg">4. LCG Method</option>
          </select>

          {servMethod === 'manual' && (
            <div className="mt-4">
              <textarea
                value={servRN}
                onChange={(e) => setServRN(e.target.value)}
                rows={3}
                className="w-full p-2.5 text-base border border-gray-300 rounded"
                placeholder="Selected numbers will appear here..."
              />
            </div>
          )}

          {servMethod === 'table' && (
            <div className="mt-4">
              <p className="text-sm mb-2.5 text-gray-600">Click numbers to add them:</p>
              <RandomGrid
                onSelect={(val) => processTableClick(val, 'serv')}
                selectedValues={servRN.split(',').map(v => parseFloat(v.trim()) / 100).filter(v => !isNaN(v))}
              />
            </div>
          )}

          {servMethod === 'midsq' && (
            <div className="mt-4">
              <div className="flex gap-4 items-center mb-4 flex-wrap">
                <label className="font-bold">Seed:</label>
                <input
                  type="number"
                  value={servMidSqSeed}
                  onChange={(e) => setServMidSqSeed(parseInt(e.target.value))}
                  className="w-20 p-2 text-center border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={() => genMidSquare('serv')}
                  className="bg-green-600 text-white px-5 py-2.5 text-sm border-none rounded cursor-pointer hover:bg-green-700"
                >
                  Generate & Steps
                </button>
              </div>
              {servMidSqSteps && (
                <div className="mt-4 p-4 bg-gray-50 border border-dashed border-gray-300 rounded max-h-72 overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: servMidSqSteps }} />
                </div>
              )}
            </div>
          )}

          {servMethod === 'lcg' && (
            <div className="mt-4">
              <div className="bg-yellow-100 text-yellow-800 p-2.5 mb-4 rounded text-base border border-yellow-300 text-center font-serif font-bold">
                Z<sub>i</sub> = (a × Z<sub>i-1</sub> + c) mod m
              </div>
              <div className="flex gap-4 items-center mb-4 flex-wrap">
                <label className="font-bold">a:</label>
                <input
                  type="number"
                  value={servLCGParams.a}
                  onChange={(e) => setServLCGParams({ ...servLCGParams, a: parseInt(e.target.value) })}
                  className="w-20 p-2 text-center border border-gray-300 rounded text-sm"
                />
                <label className="font-bold">c:</label>
                <input
                  type="number"
                  value={servLCGParams.c}
                  onChange={(e) => setServLCGParams({ ...servLCGParams, c: parseInt(e.target.value) })}
                  className="w-20 p-2 text-center border border-gray-300 rounded text-sm"
                />
                <label className="font-bold">m:</label>
                <input
                  type="number"
                  value={servLCGParams.m}
                  onChange={(e) => setServLCGParams({ ...servLCGParams, m: parseInt(e.target.value) })}
                  className="w-20 p-2 text-center border border-gray-300 rounded text-sm"
                />
                <label className="font-bold">Z0:</label>
                <input
                  type="number"
                  value={servLCGParams.z0}
                  onChange={(e) => setServLCGParams({ ...servLCGParams, z0: parseInt(e.target.value) })}
                  className="w-20 p-2 text-center border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={() => genLCG('serv')}
                  className="bg-green-600 text-white px-5 py-2.5 text-sm border-none rounded cursor-pointer hover:bg-green-700"
                >
                  Gen & Steps
                </button>
              </div>
              {servLCGSteps && (
                <div className="mt-4 p-4 bg-gray-50 border border-dashed border-gray-300 rounded max-h-72 overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: servLCGSteps }} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="text-center mt-8 mb-12">
        <button
          onClick={solveMulti}
          className="bg-blue-600 text-white px-8 py-4 text-lg border-none rounded cursor-pointer hover:bg-blue-700"
        >
          SOLVE SIMULATION
        </button>
      </div>

      {results && (
        <div className="mt-8">
          <div dangerouslySetInnerHTML={{ __html: results.rangeTables }} />
          
          <h3 className="text-xl mb-4">Simulation Table</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse mt-2.5 text-sm bg-white border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">Cust</th>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">RN(Arr)</th>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">IAT</th>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">Arr Clock</th>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">Server</th>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">RN(Serv)</th>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">Serv Time</th>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">Able Start</th>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">Able End</th>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">Baker Start</th>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">Baker End</th>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">Queue Time</th>
                </tr>
              </thead>
              <tbody>
                {results.simulationTable.map((row, idx) => (
                  <tr key={idx} className="even:bg-gray-100 hover:bg-gray-200">
                    <td className="border border-gray-300 p-2 text-center">{row.cust}</td>
                    <td className="border border-gray-300 p-2 text-center">{row.rnArr}</td>
                    <td className="border border-gray-300 p-2 text-center">{row.iat}</td>
                    <td className="border border-gray-300 p-2 text-center">{row.arrClock}</td>
                    <td className="border border-gray-300 p-2 text-center">{row.server}</td>
                    <td className="border border-gray-300 p-2 text-center">{row.rnServ}</td>
                    <td className="border border-gray-300 p-2 text-center">{row.servTime}</td>
                    <td className="border border-gray-300 p-2 text-center">{row.ableStart}</td>
                    <td className="border border-gray-300 p-2 text-center">{row.ableEnd}</td>
                    <td className="border border-gray-300 p-2 text-center">{row.bakerStart}</td>
                    <td className="border border-gray-300 p-2 text-center">{row.bakerEnd}</td>
                    <td className="border border-gray-300 p-2 text-center">{row.queueTime}</td>
                  </tr>
                ))}
                <tr className="bg-orange-500 font-bold">
                  <td className="border border-gray-300 p-2 text-center">Total</td>
                  <td className="border border-gray-300 p-2 text-center">-</td>
                  <td className="border border-gray-300 p-2 text-center">-</td>
                  <td className="border border-gray-300 p-2 text-center">-</td>
                  <td className="border border-gray-300 p-2 text-center">-</td>
                  <td className="border border-gray-300 p-2 text-center">-</td>
                  <td className="border border-gray-300 p-2 text-center">{results.totals.totalServiceTime}</td>
                  <td className="border border-gray-300 p-2 text-center">-</td>
                  <td className="border border-gray-300 p-2 text-center">{results.totals.totalAbleServiceTime}</td>
                  <td className="border border-gray-300 p-2 text-center">-</td>
                  <td className="border border-gray-300 p-2 text-center">{results.totals.totalBakerServiceTime}</td>
                  <td className="border border-gray-300 p-2 text-center">{results.totals.totalQueueTime}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default MultiServer
