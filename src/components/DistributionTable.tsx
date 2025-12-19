import { useState, useEffect } from 'react'

interface DistributionRow {
  time: number
  prob: number
  cumProb?: number
  rangeStart?: number
  rangeEnd?: number
  base?: number
  precision?: number
}

interface DistributionTableProps {
  rows: DistributionRow[]
  onRowsChange: (rows: DistributionRow[]) => void
  tableId: string
  valueLabel?: string
}

const DistributionTable = ({ rows, onRowsChange, tableId, valueLabel = 'Time' }: DistributionTableProps) => {
  const [localRows, setLocalRows] = useState<DistributionRow[]>(rows)

  useEffect(() => {
    setLocalRows(rows)
  }, [rows])

  const addRow = () => {
    const newRows = [...localRows, { time: 0, prob: 0 }]
    setLocalRows(newRows)
    onRowsChange(newRows)
  }

  const deleteRow = (index: number) => {
    const newRows = localRows.filter((_, i) => i !== index)
    setLocalRows(newRows)
    onRowsChange(newRows)
  }

  const updateRow = (index: number, field: 'time' | 'prob', value: number) => {
    const newRows = [...localRows]
    newRows[index] = { ...newRows[index], [field]: value }
    setLocalRows(newRows)
    onRowsChange(newRows)
  }

  return (
    <div>
      <table className="w-full border-collapse mt-2.5 text-sm bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2 text-center bg-primary text-white">{valueLabel}</th>
            <th className="border border-gray-300 p-2 text-center bg-primary text-white">Prob</th>
            <th className="border border-gray-300 p-2 text-center bg-primary text-white">Action</th>
          </tr>
        </thead>
        <tbody>
          {localRows.map((row, idx) => (
            <tr key={idx} className="even:bg-gray-100 hover:bg-gray-200">
              <td className="border border-gray-300 p-2 text-center">
                <input
                  type="number"
                  value={row.time}
                  onChange={(e) => updateRow(idx, 'time', parseFloat(e.target.value) || 0)}
                  className="w-full p-1 border border-gray-300 rounded text-center"
                />
              </td>
              <td className="border border-gray-300 p-2 text-center">
                <input
                  type="number"
                  step="0.001"
                  value={row.prob}
                  onChange={(e) => updateRow(idx, 'prob', parseFloat(e.target.value) || 0)}
                  className="w-full p-1 border border-gray-300 rounded text-center"
                />
              </td>
              <td className="border border-gray-300 p-2 text-center">
                <button
                  onClick={() => deleteRow(idx)}
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
        onClick={addRow}
        className="bg-blue-600 text-white px-4 py-2 border-none rounded cursor-pointer mt-2.5 hover:bg-blue-700"
      >
        + Add Row
      </button>
    </div>
  )
}

export default DistributionTable

