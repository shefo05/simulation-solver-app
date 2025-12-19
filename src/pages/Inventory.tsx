import { useState, useEffect } from 'react'
import RandomGrid from '../components/RandomGrid'

interface DistItem {
  value: number
  prob: number
  cumProb: number
  rangeStart: number
  rangeEnd: number
  base: number
}

interface PendingOrder {
  arrivalDay: number
  quantity: number
  daysRemaining: number
  readyToArrive: boolean
}

interface SimulationRow {
  cycle: number
  day: number
  beginInv: number
  demandRN: number
  demand: number
  endInv: number
  shortage: number
  orderQty: string | number
  leadTimeRN: string | number
  daysTillArr: string | number
  isCycleStart: boolean
}

const Inventory = () => {
  const [M, setM] = useState(11)
  const [N, setN] = useState(5)
  const [initInv, setInitInv] = useState(3)
  const [cycles, setCycles] = useState(3)
  const [initOrderQty, setInitOrderQty] = useState(0)
  const [initOrderDays, setInitOrderDays] = useState(0)
  
  // Demand Distribution
  const [demandRows, setDemandRows] = useState<{ value: number; prob: number }[]>([
    { value: 0, prob: 0.10 },
    { value: 1, prob: 0.25 },
    { value: 2, prob: 0.35 },
    { value: 3, prob: 0.21 },
    { value: 4, prob: 0.09 },
  ])
  const [demandMethod, setDemandMethod] = useState<'manual' | 'table' | 'midsq' | 'lcg'>('table')
  const [demandRN, setDemandRN] = useState('')
  const [demandLCGParams, setDemandLCGParams] = useState({ a: 5, c: 3, m: 100, z0: 7 })
  const [demandMidSqSeed, setDemandMidSqSeed] = useState(23)
  const [demandLCGSteps, setDemandLCGSteps] = useState<string>('')
  const [demandMidSqSteps, setDemandMidSqSteps] = useState<string>('')
  
  // Lead Time Distribution
  const [leadTimeRows, setLeadTimeRows] = useState<{ value: number; prob: number }[]>([
    { value: 1, prob: 0.60 },
    { value: 2, prob: 0.30 },
    { value: 3, prob: 0.10 },
  ])
  const [leadTimeMethod, setLeadTimeMethod] = useState<'manual' | 'table' | 'midsq' | 'lcg'>('table')
  const [leadTimeRN, setLeadTimeRN] = useState('')
  const [leadTimeLCGParams, setLeadTimeLCGParams] = useState({ a: 5, c: 3, m: 100, z0: 12 })
  const [leadTimeMidSqSeed, setLeadTimeMidSqSeed] = useState(45)
  const [leadTimeLCGSteps, setLeadTimeLCGSteps] = useState<string>('')
  const [leadTimeMidSqSteps, setLeadTimeMidSqSteps] = useState<string>('')
  
  const [results, setResults] = useState<SimulationRow[] | null>(null)

  // Initialize tables on mount
  useEffect(() => {
    updateDistributionColumns()
  }, [demandRows, leadTimeRows])

  const updateDistributionColumns = () => {
    // This will be handled by getDistData which calculates cumProb and intervals
  }

  // Get count needed for RNG generation
  const getCountNeeded = (type: 'demand' | 'leadTime'): number => {
    if (type === 'demand') return cycles * N
    if (type === 'leadTime') return cycles
    return 10
  }

  // LCG Generation
  const genLCG = (type: 'demand' | 'leadTime') => {
    const params = type === 'demand' ? demandLCGParams : leadTimeLCGParams
    const count = getCountNeeded(type)
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
    
    if (type === 'demand') {
      setDemandLCGSteps(html)
      setDemandRN(res.join(', '))
    } else {
      setLeadTimeLCGSteps(html)
      setLeadTimeRN(res.join(', '))
    }
  }

  // MidSquare Generation
  const genMidSquare = (type: 'demand' | 'leadTime') => {
    const seed = type === 'demand' ? demandMidSqSeed : leadTimeMidSqSeed
    const count = getCountNeeded(type)
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
    
    if (type === 'demand') {
      setDemandMidSqSteps(html)
      setDemandRN(res.join(', '))
    } else {
      setLeadTimeMidSqSteps(html)
      setLeadTimeRN(res.join(', '))
    }
  }

  // Get Distribution Data
  const getDistData = (rows: { value: number; prob: number }[]): DistItem[] => {
    let maxDecimals = 0
    rows.forEach(row => {
      const probStr = row.prob.toString()
      if (probStr.includes('.')) {
        maxDecimals = Math.max(maxDecimals, probStr.split('.')[1].length)
      }
    })
    
    const base = maxDecimals > 2 ? 1000 : 100
    const precision = maxDecimals > 2 ? 3 : 2
    let cumProb = 0
    const dist: DistItem[] = []
    
    rows.forEach(row => {
      if (!isNaN(row.value) && !isNaN(row.prob)) {
        const prevCum = cumProb
        cumProb = parseFloat((cumProb + row.prob).toFixed(precision))
        let rangeStart = Math.round(prevCum * base) + 1
        const rangeEnd = Math.round(cumProb * base)
        if (rangeStart > base) rangeStart = base
        dist.push({
          value: row.value,
          prob: row.prob,
          cumProb,
          rangeStart,
          rangeEnd,
          base,
        })
      }
    })
    
    return dist
  }

  // Parse Random Input
  const parseRandomInput = (inputStr: string, count: number, base: number): number[] => {
    let arr: number[] = []
    if (inputStr && inputStr.trim() !== '') {
      arr = inputStr.split(',').map(x => {
        const clean = x.trim()
        if (clean === '00' && base === 100) return 100
        if (clean === '000' && base === 1000) return 1000
        return parseInt(clean)
      }).filter(x => !isNaN(x))
    }
    while (arr.length < count) {
      arr.push(Math.floor(Math.random() * base) + 1)
    }
    return arr
  }

  // Get Value From RN
  const getValueFromRN = (rn: number, dist: DistItem[]): number => {
    for (const d of dist) {
      if (rn >= d.rangeStart && rn <= d.rangeEnd) {
        return d.value
      }
    }
    return dist[dist.length - 1].value
  }

  // Process Table Click
  const processTableClick = (val: number, type: 'demand' | 'leadTime') => {
    const intVal = Math.floor(val * 100)
    let strVal = intVal.toString().padStart(2, '0')
    if (intVal === 0) strVal = '00'
    const current = type === 'demand' ? demandRN : leadTimeRN
    const newValue = current.length > 0 ? `${current}, ${strVal}` : strVal
    if (type === 'demand') {
      setDemandRN(newValue)
    } else {
      setLeadTimeRN(newValue)
    }
  }

  // Solve Inventory
  const solveInventory = () => {
    const demandDist = getDistData(demandRows)
    const leadTimeDist = getDistData(leadTimeRows)
    
    if (demandDist.length === 0 || leadTimeDist.length === 0) {
      alert('Fill distributions')
      return
    }
    
    const totalDays = cycles * N
    const demandBase = demandDist[0].base
    const leadTimeBase = leadTimeDist[0].base
    const demandRNs = parseRandomInput(demandRN, totalDays, demandBase)
    const leadTimeRNs = parseRandomInput(leadTimeRN, cycles, leadTimeBase)
    
    const simRows: SimulationRow[] = []
    let currentInv = initInv
    let shortage = 0
    const pendingOrders: PendingOrder[] = []
    let leadTimeIndex = 0
    let cycle = 1
    
    // Init Order Logic
    if (initOrderQty > 0 && initOrderDays >= 0) {
      const daysRemaining = initOrderDays === 0 ? 0 : initOrderDays - 1
      const ready = initOrderDays === 0 || daysRemaining === 0
      pendingOrders.push({
        arrivalDay: initOrderDays + 1,
        quantity: initOrderQty,
        daysRemaining,
        readyToArrive: ready,
      })
    }
    
    for (let day = 1; day <= totalDays; day++) {
      let orderArrivedToday = false
      
      // Check for arriving orders
      for (let i = pendingOrders.length - 1; i >= 0; i--) {
        if (pendingOrders[i].readyToArrive) {
          currentInv += pendingOrders[i].quantity
          pendingOrders.splice(i, 1)
          orderArrivedToday = true
        }
      }
      
      let daysUntilArrives: string | number = '-'
      if (pendingOrders.length > 0) {
        daysUntilArrives = pendingOrders[pendingOrders.length - 1].daysRemaining
      } else if (orderArrivedToday) {
        daysUntilArrives = '-'
      }
      
      const beginInv = currentInv
      const demandRN = demandRNs[day - 1]
      const demand = getValueFromRN(demandRN, demandDist)
      
      if (currentInv >= demand) {
        currentInv -= demand
      } else {
        shortage += (demand - currentInv)
        currentInv = 0
      }
      
      const endInv = currentInv
      const isReviewDay = day % N === 0
      const dayInCycle = ((day - 1) % N) + 1
      let orderQty: string | number = '-'
      let leadTimeRN: string | number = '-'
      
      if (isReviewDay) {
        const Q = M - currentInv + shortage
        if (Q > 0) {
          const ltRN = leadTimeRNs[leadTimeIndex++]
          const leadTime = getValueFromRN(ltRN, leadTimeDist)
          orderQty = Q
          leadTimeRN = ltRN
          daysUntilArrives = leadTime
          pendingOrders.push({
            arrivalDay: day + leadTime,
            quantity: Q,
            daysRemaining: leadTime,
            readyToArrive: false,
          })
        }
      }
      
      simRows.push({
        cycle,
        day: dayInCycle,
        beginInv,
        demandRN,
        demand,
        endInv,
        shortage,
        orderQty,
        leadTimeRN,
        daysTillArr: daysUntilArrives,
        isCycleStart: dayInCycle === 1,
      })
      
      // Update pending orders
      pendingOrders.forEach(order => {
        const showedZeroToday = order.daysRemaining === 0
        if (order.daysRemaining > 0) {
          order.daysRemaining--
          order.readyToArrive = false
        }
        if (showedZeroToday) {
          order.readyToArrive = true
        }
      })
      
      if (isReviewDay) cycle++
    }
    
    setResults(simRows)
  }

  return (
    <div className="container mx-auto px-3 sm:px-5 py-5 max-w-6xl bg-white shadow-md mt-5 rounded-lg">
      <h1 className="text-primary border-b-2 border-teal-500 pb-2.5 mb-5">
        Inventory Simulation (M, N)
      </h1>
      <div className="bg-teal-50 p-2.5 border-l-4 border-teal-500 mb-5">
        <strong>Logic:</strong> Review Period (N), Max Inventory (M). Order Qty = M - End Inv + Shortage.
      </div>

      <div className="mb-5 border border-gray-200 p-4 rounded-lg bg-gray-50">
        <h3 className="text-blue-600 mt-5 border-l-4 border-blue-500 pl-2.5 mb-4 text-xl">1. Demand Distribution</h3>
        
        <div className="mb-5">
          <h4 className="text-gray-700 border-b-3 border-blue-500 pb-2.5 mb-5 text-xl">Demand Probabilities</h4>
          <table className="w-full border-collapse mt-2.5 text-sm bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">Demand</th>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">Prob</th>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">cum F</th>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">Interval</th>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">Action</th>
              </tr>
            </thead>
            <tbody>
              {demandRows.map((row, idx) => {
                const dist = getDistData(demandRows)
                const distItem = dist[idx]
                return (
                  <tr key={idx} className="even:bg-gray-100 hover:bg-gray-200">
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="number"
                        value={row.value}
                        onChange={(e) => {
                          const newRows = [...demandRows]
                          newRows[idx].value = parseFloat(e.target.value) || 0
                          setDemandRows(newRows)
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
                          const newRows = [...demandRows]
                          newRows[idx].prob = parseFloat(e.target.value) || 0
                          setDemandRows(newRows)
                        }}
                        className="w-full p-1 border border-gray-300 rounded text-center"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center font-bold">
                      {distItem ? distItem.cumProb.toFixed(3) : ''}
                    </td>
                    <td className="border border-gray-300 p-2 text-center font-bold">
                      {distItem ? `${distItem.rangeStart}-${distItem.rangeEnd}` : ''}
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <button
                        onClick={() => setDemandRows(demandRows.filter((_, i) => i !== idx))}
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
            onClick={() => setDemandRows([...demandRows, { value: 0, prob: 0 }])}
            className="bg-blue-600 text-white px-4 py-2 border-none rounded cursor-pointer mt-2.5 hover:bg-blue-700"
          >
            + Add Row
          </button>
        </div>

        <div className="mb-4 p-5 bg-gray-100 rounded-lg border-l-4 border-primary">
          <label className="font-bold text-lg text-primary mr-2.5">Demand RNG Method:</label>
          <select
            value={demandMethod}
            onChange={(e) => setDemandMethod(e.target.value as any)}
            className="p-2 text-base ml-2.5 border border-gray-300 rounded"
          >
            <option value="manual">1. Manual Input</option>
            <option value="table">2. Random Table (10x10 Grid)</option>
            <option value="midsq">3. Middle-Square</option>
            <option value="lcg">4. LCG Method</option>
          </select>

          {demandMethod === 'manual' && (
            <div className="mt-4">
              <textarea
                value={demandRN}
                onChange={(e) => setDemandRN(e.target.value)}
                rows={3}
                className="w-full p-2.5 text-base border border-gray-300 rounded"
                placeholder="Selected numbers will appear here..."
              />
            </div>
          )}

          {demandMethod === 'table' && (
            <div className="mt-4">
              <p className="text-sm mb-2.5 text-gray-600">Click numbers to add them:</p>
              <RandomGrid
                onSelect={(val) => processTableClick(val, 'demand')}
                selectedValues={demandRN.split(',').map(v => parseFloat(v.trim()) / 100).filter(v => !isNaN(v))}
              />
            </div>
          )}

          {demandMethod === 'midsq' && (
            <div className="mt-4">
              <div className="flex gap-4 items-center mb-4 flex-wrap">
                <label className="font-bold">Seed:</label>
                <input
                  type="number"
                  value={demandMidSqSeed}
                  onChange={(e) => setDemandMidSqSeed(parseInt(e.target.value))}
                  className="w-20 p-2 text-center border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={() => genMidSquare('demand')}
                  className="bg-green-600 text-white px-5 py-2.5 text-sm border-none rounded cursor-pointer hover:bg-green-700"
                >
                  Generate & Steps
                </button>
              </div>
              {demandMidSqSteps && (
                <div className="mt-4 p-4 bg-gray-50 border border-dashed border-gray-300 rounded max-h-72 overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: demandMidSqSteps }} />
                </div>
              )}
            </div>
          )}

          {demandMethod === 'lcg' && (
            <div className="mt-4">
              <div className="bg-yellow-100 text-yellow-800 p-2.5 mb-4 rounded text-base border border-yellow-300 text-center font-serif font-bold">
                Z<sub>i</sub> = (a × Z<sub>i-1</sub> + c) mod m
              </div>
              <div className="flex gap-4 items-center mb-4 flex-wrap">
                <label className="font-bold">a:</label>
                <input
                  type="number"
                  value={demandLCGParams.a}
                  onChange={(e) => setDemandLCGParams({ ...demandLCGParams, a: parseInt(e.target.value) })}
                  className="w-20 p-2 text-center border border-gray-300 rounded text-sm"
                />
                <label className="font-bold">c:</label>
                <input
                  type="number"
                  value={demandLCGParams.c}
                  onChange={(e) => setDemandLCGParams({ ...demandLCGParams, c: parseInt(e.target.value) })}
                  className="w-20 p-2 text-center border border-gray-300 rounded text-sm"
                />
                <label className="font-bold">m:</label>
                <input
                  type="number"
                  value={demandLCGParams.m}
                  onChange={(e) => setDemandLCGParams({ ...demandLCGParams, m: parseInt(e.target.value) })}
                  className="w-20 p-2 text-center border border-gray-300 rounded text-sm"
                />
                <label className="font-bold">Z0:</label>
                <input
                  type="number"
                  value={demandLCGParams.z0}
                  onChange={(e) => setDemandLCGParams({ ...demandLCGParams, z0: parseInt(e.target.value) })}
                  className="w-20 p-2 text-center border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={() => genLCG('demand')}
                  className="bg-green-600 text-white px-5 py-2.5 text-sm border-none rounded cursor-pointer hover:bg-green-700"
                >
                  Gen & Steps
                </button>
              </div>
              {demandLCGSteps && (
                <div className="mt-4 p-4 bg-gray-50 border border-dashed border-gray-300 rounded max-h-72 overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: demandLCGSteps }} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mb-5 border border-gray-200 p-4 rounded-lg bg-gray-50">
        <h3 className="text-blue-600 mt-5 border-l-4 border-blue-500 pl-2.5 mb-4 text-xl">2. Lead Time Distribution</h3>
        
        <div className="mb-5">
          <h4 className="text-gray-700 border-b-3 border-blue-500 pb-2.5 mb-5 text-xl">Lead Time Probabilities</h4>
          <table className="w-full border-collapse mt-2.5 text-sm bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">Days</th>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">Prob</th>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">cum F</th>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">Interval</th>
                <th className="border border-gray-300 p-2 text-center bg-primary text-white">Action</th>
              </tr>
            </thead>
            <tbody>
              {leadTimeRows.map((row, idx) => {
                const dist = getDistData(leadTimeRows)
                const distItem = dist[idx]
                return (
                  <tr key={idx} className="even:bg-gray-100 hover:bg-gray-200">
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="number"
                        value={row.value}
                        onChange={(e) => {
                          const newRows = [...leadTimeRows]
                          newRows[idx].value = parseFloat(e.target.value) || 0
                          setLeadTimeRows(newRows)
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
                          const newRows = [...leadTimeRows]
                          newRows[idx].prob = parseFloat(e.target.value) || 0
                          setLeadTimeRows(newRows)
                        }}
                        className="w-full p-1 border border-gray-300 rounded text-center"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center font-bold">
                      {distItem ? distItem.cumProb.toFixed(3) : ''}
                    </td>
                    <td className="border border-gray-300 p-2 text-center font-bold">
                      {distItem ? `${distItem.rangeStart}-${distItem.rangeEnd}` : ''}
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <button
                        onClick={() => setLeadTimeRows(leadTimeRows.filter((_, i) => i !== idx))}
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
            onClick={() => setLeadTimeRows([...leadTimeRows, { value: 0, prob: 0 }])}
            className="bg-blue-600 text-white px-4 py-2 border-none rounded cursor-pointer mt-2.5 hover:bg-blue-700"
          >
            + Add Row
          </button>
        </div>

        <div className="mb-4 p-5 bg-gray-100 rounded-lg border-l-4 border-primary">
          <label className="font-bold text-lg text-primary mr-2.5">Lead Time RNG Method:</label>
          <select
            value={leadTimeMethod}
            onChange={(e) => setLeadTimeMethod(e.target.value as any)}
            className="p-2 text-base ml-2.5 border border-gray-300 rounded"
          >
            <option value="manual">1. Manual Input</option>
            <option value="table">2. Random Table (10x10 Grid)</option>
            <option value="midsq">3. Middle-Square</option>
            <option value="lcg">4. LCG Method</option>
          </select>

          {leadTimeMethod === 'manual' && (
            <div className="mt-4">
              <textarea
                value={leadTimeRN}
                onChange={(e) => setLeadTimeRN(e.target.value)}
                rows={3}
                className="w-full p-2.5 text-base border border-gray-300 rounded"
                placeholder="Selected numbers will appear here..."
              />
            </div>
          )}

          {leadTimeMethod === 'table' && (
            <div className="mt-4">
              <p className="text-sm mb-2.5 text-gray-600">Click numbers to add them:</p>
              <RandomGrid
                onSelect={(val) => processTableClick(val, 'leadTime')}
                selectedValues={leadTimeRN.split(',').map(v => parseFloat(v.trim()) / 100).filter(v => !isNaN(v))}
              />
            </div>
          )}

          {leadTimeMethod === 'midsq' && (
            <div className="mt-4">
              <div className="flex gap-4 items-center mb-4 flex-wrap">
                <label className="font-bold">Seed:</label>
                <input
                  type="number"
                  value={leadTimeMidSqSeed}
                  onChange={(e) => setLeadTimeMidSqSeed(parseInt(e.target.value))}
                  className="w-20 p-2 text-center border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={() => genMidSquare('leadTime')}
                  className="bg-green-600 text-white px-5 py-2.5 text-sm border-none rounded cursor-pointer hover:bg-green-700"
                >
                  Generate & Steps
                </button>
              </div>
              {leadTimeMidSqSteps && (
                <div className="mt-4 p-4 bg-gray-50 border border-dashed border-gray-300 rounded max-h-72 overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: leadTimeMidSqSteps }} />
                </div>
              )}
            </div>
          )}

          {leadTimeMethod === 'lcg' && (
            <div className="mt-4">
              <div className="bg-yellow-100 text-yellow-800 p-2.5 mb-4 rounded text-base border border-yellow-300 text-center font-serif font-bold">
                Z<sub>i</sub> = (a × Z<sub>i-1</sub> + c) mod m
              </div>
              <div className="flex gap-4 items-center mb-4 flex-wrap">
                <label className="font-bold">a:</label>
                <input
                  type="number"
                  value={leadTimeLCGParams.a}
                  onChange={(e) => setLeadTimeLCGParams({ ...leadTimeLCGParams, a: parseInt(e.target.value) })}
                  className="w-20 p-2 text-center border border-gray-300 rounded text-sm"
                />
                <label className="font-bold">c:</label>
                <input
                  type="number"
                  value={leadTimeLCGParams.c}
                  onChange={(e) => setLeadTimeLCGParams({ ...leadTimeLCGParams, c: parseInt(e.target.value) })}
                  className="w-20 p-2 text-center border border-gray-300 rounded text-sm"
                />
                <label className="font-bold">m:</label>
                <input
                  type="number"
                  value={leadTimeLCGParams.m}
                  onChange={(e) => setLeadTimeLCGParams({ ...leadTimeLCGParams, m: parseInt(e.target.value) })}
                  className="w-20 p-2 text-center border border-gray-300 rounded text-sm"
                />
                <label className="font-bold">Z0:</label>
                <input
                  type="number"
                  value={leadTimeLCGParams.z0}
                  onChange={(e) => setLeadTimeLCGParams({ ...leadTimeLCGParams, z0: parseInt(e.target.value) })}
                  className="w-20 p-2 text-center border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={() => genLCG('leadTime')}
                  className="bg-green-600 text-white px-5 py-2.5 text-sm border-none rounded cursor-pointer hover:bg-green-700"
                >
                  Gen & Steps
                </button>
              </div>
              {leadTimeLCGSteps && (
                <div className="mt-4 p-4 bg-gray-50 border border-dashed border-gray-300 rounded max-h-72 overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: leadTimeLCGSteps }} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center gap-8 mb-8 bg-white p-5 rounded-lg border border-gray-300 flex-wrap shadow-sm">
        <div>
          <label className="font-bold mr-2.5">Order Qty (Initial):</label>
          <input
            type="number"
            value={initOrderQty}
            onChange={(e) => setInitOrderQty(parseInt(e.target.value) || 0)}
            className="p-2 border border-gray-300 rounded w-36"
          />
        </div>
        <div>
          <label className="font-bold mr-2.5">Days till Arrive:</label>
          <input
            type="number"
            value={initOrderDays}
            onChange={(e) => setInitOrderDays(parseInt(e.target.value) || 0)}
            className="p-2 border border-gray-300 rounded w-36"
          />
        </div>
      </div>
      
      <div className="flex justify-center gap-8 mb-8 bg-white p-5 rounded-lg border border-gray-300 flex-wrap shadow-sm">
        <div>
          <label className="font-bold mr-2.5">Max Inv (M):</label>
          <input
            type="number"
            value={M}
            onChange={(e) => setM(parseInt(e.target.value))}
            className="p-2 border border-gray-300 rounded w-36"
          />
        </div>
        <div>
          <label className="font-bold mr-2.5">Review Period (N):</label>
          <input
            type="number"
            value={N}
            onChange={(e) => setN(parseInt(e.target.value))}
            className="p-2 border border-gray-300 rounded w-36"
          />
        </div>
        <div>
          <label className="font-bold mr-2.5">Initial Inv:</label>
          <input
            type="number"
            value={initInv}
            onChange={(e) => setInitInv(parseInt(e.target.value))}
            className="p-2 border border-gray-300 rounded w-36"
          />
        </div>
        <div>
          <label className="font-bold mr-2.5">Num Cycles:</label>
          <input
            type="number"
            value={cycles}
            onChange={(e) => setCycles(parseInt(e.target.value))}
            className="p-2 border border-gray-300 rounded w-36"
          />
        </div>
      </div>

      <div className="text-center mb-12">
        <button
          onClick={solveInventory}
          className="bg-blue-600 text-white px-8 py-4 text-lg border-none rounded cursor-pointer hover:bg-blue-700"
        >
          SOLVE SIMULATION
        </button>
      </div>

      {results && (
        <div className="mt-8">
          <h3 className="text-xl mb-4">Simulation Table ({cycles} Cycles)</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse mt-2.5 text-sm bg-white border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">Cycle</th>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">Day</th>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">Begin Inv</th>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">Demand RN</th>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">Demand</th>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">End Inv</th>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">Shortage</th>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">Order Qty</th>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">Lead Time RN</th>
                  <th className="border border-gray-300 p-2 text-center bg-primary text-white">Days till Arr</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`even:bg-gray-100 hover:bg-gray-200 ${row.isCycleStart ? 'border-t-2 border-black' : ''}`}
                  >
                    <td className="border border-gray-300 p-2 text-center">{row.cycle}</td>
                    <td className="border border-gray-300 p-2 text-center">{row.day}</td>
                    <td className="border border-gray-300 p-2 text-center">{row.beginInv}</td>
                    <td className="border border-gray-300 p-2 text-center">{row.demandRN}</td>
                    <td className="border border-gray-300 p-2 text-center">{row.demand}</td>
                    <td className="border border-gray-300 p-2 text-center">{row.endInv}</td>
                    <td className="border border-gray-300 p-2 text-center">{row.shortage}</td>
                    <td className="border border-gray-300 p-2 text-center">{row.orderQty}</td>
                    <td className="border border-gray-300 p-2 text-center">{row.leadTimeRN}</td>
                    <td className="border border-gray-300 p-2 text-center">{row.daysTillArr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventory
