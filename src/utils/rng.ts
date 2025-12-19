export interface LCGParams {
  a: number
  c: number
  m: number
  z0: number
  count: number
}

export interface LCGStep {
  i: number
  zi: number
  ui: number
  rn: number
}

export const generateLCG = (params: LCGParams): LCGStep[] => {
  const { a, c, m, z0, count } = params
  const steps: LCGStep[] = [{ i: 0, zi: z0, ui: 0, rn: 0 }]
  let z = z0

  for (let i = 1; i <= count; i++) {
    z = (a * z + c) % m
    const ui = z / m
    let rn = Math.floor(ui * 100)
    if (rn === 0) rn = 100
    steps.push({ i, zi: z, ui, rn })
  }

  return steps
}

export interface MidSquareParams {
  seed: number
  count: number
}

export interface MidSquareStep {
  i: number
  zi: number
  square: string
  middle: string
  rn: number
}

export const generateMidSquare = (params: MidSquareParams): MidSquareStep[] => {
  const { seed, count } = params
  const n = seed.toString().length
  const steps: MidSquareStep[] = []
  let z = seed

  for (let i = 1; i <= count; i++) {
    const square = z * z
    const squareStr = square.toString()
    const targetLen = n * 2
    const paddedSquare = squareStr.padStart(targetLen, '0')
    const start = Math.floor((targetLen - n) / 2)
    const end = start + n
    const middleStr = paddedSquare.substring(start, end)
    const nextZ = parseInt(middleStr)
    const rn = n >= 2 ? parseInt(middleStr.substring(0, 2)) : nextZ
    const finalRn = rn === 0 ? 100 : rn

    steps.push({
      i,
      zi: nextZ,
      square: paddedSquare,
      middle: middleStr,
      rn: finalRn,
    })

    z = nextZ
  }

  return steps
}

