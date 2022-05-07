import { TraceMap, originalPositionFor } from '@jridgewell/trace-mapping'
const cache = new Map()
const fetchBundleAndBundleMap = async (bundleUrl: string, bundleMapUrl: string) => {
  if (cache.has(bundleUrl)) {
    return cache.get(bundleUrl)
  }
  // else {
  //   const bundles = await Promise.all([fetch(bundleUrl).then((res) => res.text()), fetch(bundleMapUrl).then((res) => res.json())])
  //   cache.set(bundleUrl, bundles)
  //   return bundles
  // }
}

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
export const getCoverage = async (coverageRowData: any) => {
  const trace = await coverageRowData.trace.map(async (e: any) => {
    const bundleUrl = e.url
    const bundleMapUrl = bundleUrl.replace('.js', '.js.map')
    const [bundle, bundleMap] = await fetchBundleAndBundleMap(bundleUrl, bundleMapUrl)
    const { startOffset, endOffset } = e.ranges[0]
    const coverage = extractCoverageFromBundle(startOffset, endOffset, bundle)
    const codeCoverageMetaData = CodeCoverageMetaData(coverage, bundleMap)
    return { ...codeCoverageMetaData, ...e }
  })
  const profile = await coverageRowData.profile.map(async (e: any) => {
    const bundleUrl = e.callFrame.url
    const bundleMapUrl = bundleUrl.replace('.js', '.js.map')
    const [bundle, bundleMap] = await fetchBundleAndBundleMap(bundleUrl, bundleMapUrl)
    const lineBundleStart = e.callFrame.lineNumber
    const lineBundleEnd = e.callFrame.lineNumber
    const codeCoverageMetaData = CodeCoverageMetaData({ lineBundleStart, lineBundleEnd }, bundleMap)
    if (codeCoverageMetaData.startPosition.source !== null) return { ...codeCoverageMetaData, ...e }
    else {
      console.log('not found', e)
      return undefined
    }
  })
  const profileData = await Promise.all(profile)
  const traceData = await Promise.all(trace)
  console.log('trace', traceData)
  console.log('profile', profileData)
  return []
}
