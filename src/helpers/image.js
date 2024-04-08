import fs from 'fs'
import { Resvg } from '@resvg/resvg-js'

const WIDTH_IN_PIXELS = 420

export async function convertSvgToPng(inputSrc, outputSrc) {
  const svgBuffer = await fs.readFileSync(inputSrc)

  const svg = new Resvg(svgBuffer, {
    fitTo: {
      mode: 'width',
      value: WIDTH_IN_PIXELS,
    }
  })

  const pngData = svg.render()
  const pngBuffer = pngData.asPng()

  return fs.writeFileSync(outputSrc, pngBuffer)
}