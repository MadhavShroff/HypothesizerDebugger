import { TraceMap, originalPositionFor } from '@jridgewell/trace-mapping'

const extractCoverageFromBundle = (rangeStart: number, rangeEnd: number, bundle: string) => {
  const coverage = bundle.slice(rangeStart, rangeEnd).split(/\n/)
  return {
    coverage,
    lineBundleStart: bundle.substring(0, rangeStart + 1).split(/\n/).length,
    lineBundleEnd: bundle.substring(0, rangeEnd).split(/\n/).length,
  }
}

const CodeCoverageMetaData = (coverage: any, bundleMap: any) => {
  const tracer = new TraceMap(bundleMap)
  const startPosition = originalPositionFor(tracer, {
    line: coverage.lineBundleStart + 1,
    column: 0,
  })
  const endPosition = originalPositionFor(tracer, {
    line: coverage.lineBundleEnd + 1,
    column: 0,
  })

  return {
    ...coverage,
    startPosition,
    endPosition,
  }
}

export const getCoverage = (coverageRowData: any) => {
  const trace = coverageRowData.trace.map((e: any) => {
    const fileURL = new URL(e.url).pathname.substring(1)
    const files = coverageRowData.bundleAndMap.find((bundle: any) => bundle[1].file === fileURL)
    const [bundle, bundleMap] = files
    const { startOffset, endOffset } = e.ranges[0]
    const coverage = extractCoverageFromBundle(startOffset, endOffset, bundle)
    const codeCoverageMetaData = CodeCoverageMetaData(coverage, bundleMap)
    return { ...codeCoverageMetaData, ...e }
  })
  const profile = coverageRowData.profile.map((e: any) => {
    const fileURL = new URL(e.callFrame.url).pathname.substring(1)
    const files = coverageRowData.bundleAndMap.find((bundle: any) => bundle[1].file === fileURL)
    const [bundle, bundleMap] = files
    const lineBundleStart = e.callFrame.lineNumber
    const lineBundleEnd = e.callFrame.lineNumber
    const codeCoverageMetaData = CodeCoverageMetaData({ lineBundleStart, lineBundleEnd }, bundleMap)
    if (codeCoverageMetaData.startPosition.source !== null) return { ...codeCoverageMetaData, ...e }
    else {
      console.log('not found', e)
      return undefined
    }
  })
  // TODO: verify the coverage information produced by the tace and the prfoile are the same
  // TODO: Then concatenate the coverage information from the trace and the profile ( order is important )
  console.log('trace', trace)
  console.log('profile', profile)
  return [trace, profile]
}
