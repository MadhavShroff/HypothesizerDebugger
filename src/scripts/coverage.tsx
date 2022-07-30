import { TraceMap, originalPositionFor, generatedPositionFor, OriginalMapping, SourceMapInput, InvalidOriginalMapping } from '@jridgewell/trace-mapping'
import { Position, Profile, TraceElement, TraceWithMapping, Event, Location } from '../types/finalTypes'
import { BundleAndMapClass, ProfilerOutput, TemporaryEventType} from '../types/ProfilerOutputTypes'

const convertPath = (windowsPath: string) =>
  windowsPath
    .replace(/^\\\\\?\\/, '')
    .replace(/\\/g, '/')
    .replace(/\/\/+/g, '/')

const extractCoverageFromBundle = (rangeStart: number, rangeEnd: number, file: string) => {
  // const range = bundle.slice(rangeStart, rangeEnd).split(/\n/).join()
  const lineBundleStart = file.substring(0, rangeStart).split(/\n/).length
  const lineBundleEnd = file.substring(0, rangeEnd).split(/\n/).length

  return {
    lineBundleStart,
    lineBundleEnd,
  }
}

const extractCodeCoverageFromJSX = (startLineNumber: number, file: string) => {
  let rangeEnd = startLineNumber - 1
  const coverage = []
  while (rangeEnd <= file.length) {
    coverage.push(file[rangeEnd])
    const code = coverage.join('\n')
    if (code.search('/>') > 0 || code.search('</') > 0) break
    rangeEnd++
  }
  return coverage
}

const CodeCoverageMetaData = (
  coverageBundleLocation: {           //Params
    lineBundleStart: number,
    lineBundleEnd: number
  },
  bundleMap: BundleAndMapClass,
  offSet: number
): {                                   // Return Type
  startPosition: OriginalMapping;
  endPosition: OriginalMapping;
  lineBundleStart: number;
  lineBundleEnd: number;
} => {
  const tracer = new TraceMap(bundleMap as SourceMapInput);
  const startPosition: InvalidOriginalMapping | OriginalMapping = originalPositionFor(tracer, {
    line: coverageBundleLocation.lineBundleStart + offSet,
    column: 0,
  })
  const endPosition: InvalidOriginalMapping | OriginalMapping = originalPositionFor(tracer, {
    line: coverageBundleLocation.lineBundleEnd + offSet,
    column: 0,
  })
  if (startPosition.line === null || startPosition.column === null ||
    endPosition.line === null || endPosition.column === null) {
    console.log(JSON.stringify(coverageBundleLocation));
    throw new Error("Mapping does not exist, Coverage not found");
  } else {
    let accurateLine = startPosition.line;
    if (accurateLine <= 0) console.error("Mapping does not exist, Coverage not found", coverageBundleLocation);
    let generated = generatedPositionFor(tracer, {
      source: startPosition.source == null ? "" : startPosition.source,
      line: ++accurateLine,
      column: endPosition.column == null ? 0 : endPosition.column,
    })
    while (generated.line != null) {
      generated = generatedPositionFor(tracer, {
        source: startPosition.source == null ? "" : startPosition.source,
        line: accurateLine++,
        column: endPosition.column == null ? 0 : endPosition.column,
      })
    }
    accurateLine = endPosition.line;
    if (accurateLine <= 0) console.error("Mapping does not exist, Coverage not found", coverageBundleLocation);
    generated = generatedPositionFor(tracer, {
      source: startPosition.source == null ? "" : startPosition.source,
      line: ++accurateLine,
      column: endPosition.column == null ? 0 : endPosition.column,
    })
    while (generated.line != null) {
      generated = generatedPositionFor(tracer, {
        source: startPosition.source == null ? "" : startPosition.source,
        line: accurateLine++,
        column: endPosition.column == null ? 0 : endPosition.column,
      })
    }
    endPosition.line = accurateLine;
    return {
      ...coverageBundleLocation,
      startPosition,
      endPosition,
    }
  }
}

const extractCodeCoverage = (rangeStart: number, range: number, files: any[], fileName: string) => {
  const file = files.find((e: any) => new URL(e.url).pathname.search(fileName) > -1)
  return file?.content.split(/\n/).splice(rangeStart - 1, range + 1)
}
const addIdToTraceFromProfile = (trace: any, profile: any) => {
  return trace.map((e: any) => {
    const profileElement = profile.find((p: any) => p.startPosition.line === e.startPosition.line && p.startPosition.source === e.startPosition.source)
    if (profileElement) {
      return { ...e, id: profileElement.id }
    } else {
      return e
    }
  })
}

const devideCoverage = (coverage: any[]): any => {
  const devidedCoverage: any[] = []
  let local = []
  for (let i = 0; i < coverage.length; i++) {
    // eslint-disable-next-line no-prototype-builtins
    if (coverage[i].hasOwnProperty('coverage')) {
      local.push(coverage[i])
      continue
    }
    if (local.length > 0) {
      devidedCoverage.push(local)
      local = []
    }
    devidedCoverage.push([coverage[i]])
  }
  if (local.length > 0) {
    devidedCoverage.push(local)
  }
  return devidedCoverage.map((e) => e.sort((a: any, b: any) => a.timestamp - b.timestamp || a.id - b.id))
}

export const getTrace = (coverageRowData: ProfilerOutput, coverageEventsData: TemporaryEventType[]): TraceWithMapping => {
  // get mapping 
  // throw excep if mapping does not exist
  // if mapping exists get code coverage from bundle
  // get code coverage metadata
  //  extract code coverage
  // remove nulls and return

  const profile : Profile[] = coverageRowData.profile.map((e) : Profile => {
    const fileURL = (new URL(e.callFrame.url)).pathname.substring(1)
    const files = coverageRowData.bundleAndMap.find((bundle: [string, BundleAndMapClass]) => bundle[1].file === fileURL)
    if (files === undefined) {
      console.error("Profile row does not contain mapping. common files found is undefined")
      console.log("Profile row attempted to map: ", e);
      console.log("bundleAndMap", coverageRowData.bundleAndMap);
      console.log("computed fileURL, files", fileURL, files);
      throw new Error("Profile row does not contain  apping. common files found is undefined");
      // Note: this adds a null in the trace array, as no corresponding file mapping 
      // exists for the event recorded
    }
    const [, bundleMap]: [string, BundleAndMapClass] = files;
    const lineBundleStart = e.callFrame.lineNumber
    const lineBundleEnd = e.callFrame.lineNumber
    const codeCoverageMetaData = CodeCoverageMetaData({ lineBundleStart, lineBundleEnd }, bundleMap, 1)
    if (codeCoverageMetaData == null || codeCoverageMetaData.startPosition.source == null) 
      throw new Error("Coverage not found");
    return { 
      startPosition: codeCoverageMetaData.startPosition as Position,
      endPosition: codeCoverageMetaData.endPosition as Position,
      lineBundleStart: codeCoverageMetaData.lineBundleStart,
      lineBundleEnd: codeCoverageMetaData.lineBundleEnd,
      callFrame:       e.callFrame,
      children:       e.children,
      hitCount:        e.hitCount,
      id:              e.id,
      functionName:    e.functionName,
      positionTicks:  e.positionTicks,
      coverage: extractCodeCoverage(
        codeCoverageMetaData.startPosition.line,
        codeCoverageMetaData.endPosition.line - codeCoverageMetaData.startPosition.line,
        coverageRowData.allFiles,
        codeCoverageMetaData.startPosition.source,
      )
    }
  });

  const trace : TraceElement[] = coverageRowData.trace.map( (e) : TraceElement => {
    const fileURL = (new URL(e.url)).pathname.substring(1)
    const files = coverageRowData.bundleAndMap.find((bundle: [string, BundleAndMapClass]) => bundle[1].file === fileURL);
    // const files = coverageRowData.bundleAndMap.find((bundle: [string, BundleAndMapClass]) => {bundle[1].file === fileURL});
    if (files === undefined) {
      console.log("Event attempted to map: ", e);
      console.log("bundleAndMap", coverageRowData.bundleAndMap);
      console.log("computed fileURL, files", fileURL, files);
      throw new Error("Event does not contain Mapping. common files found is undefined");
      // Note: this adds a null in the trace array, as no corresponding file mapping 
      // exists for the event recorded
    }
    const [bundle, bundleMap]: [string, BundleAndMapClass] = files;
    const { startOffset, endOffset } = e.ranges[0]
    const coverage = extractCoverageFromBundle(startOffset, endOffset, bundle)
    const codeCoverageMetaData = CodeCoverageMetaData(coverage, bundleMap, 0)
    if (codeCoverageMetaData == null || codeCoverageMetaData.startPosition.source == null) 
      throw new Error("Coverage not found");
    const matchingProfile : Profile | undefined = profile.find((p : Profile) => 
    p.startPosition.line === codeCoverageMetaData.startPosition.line && 
    p.startPosition.source === codeCoverageMetaData.startPosition.source);
    return { 
      coverage: extractCodeCoverage(
        codeCoverageMetaData.startPosition.line,
        codeCoverageMetaData.endPosition.line - codeCoverageMetaData.startPosition.line,
        coverageRowData.allFiles,
        codeCoverageMetaData.startPosition.source,
      ),
      startPosition: codeCoverageMetaData.startPosition as Position,
      endPosition: codeCoverageMetaData.endPosition as Position,
      lineBundleStart: codeCoverageMetaData.lineBundleStart,
      lineBundleEnd: codeCoverageMetaData.lineBundleEnd,
      functionName:    e.functionName,
      isBlockCoverage: e.isBlockCoverage,
      ranges:          e.ranges,
      url:             e.url,
      timestamp:       e.timestamp,
      id:              matchingProfile === undefined ? undefined : matchingProfile.id
    };
  });

  const events : Event[] = coverageEventsData.map((e : TemporaryEventType) : Event => {
    if (e.location === null){
      console.log(e);
      return {
        type:           e.type, //"attributes" | "childList" | "click" | "keydown";
        coverage:       null,
        startPosition:  null,
        endPosition:    null,
        location:       null,
        state:          {...e.state},
        timestamp:      e.timestamp,
        value:          e.srcElement?.value, // srcElement : {value: "", tagName: ""} unpacked
        tagName:        e.srcElement?.tagName,
      }
      throw new Error("Coverage not found");
    }
    e.location.fileName = convertPath(e.location.fileName)
    const fileContent = extractCodeCoverage(-Infinity, Infinity, coverageRowData.allFiles, e.location.fileName)
    const coverage = extractCodeCoverageFromJSX(e.location.lineNumber, fileContent)
    return {
      type:           e.type, //"attributes" | "childList" | "click" | "keydown";
      coverage,
      startPosition:  {
        line: e.location.lineNumber,
        source: e.location.fileName,
      } as Position,
      endPosition: {
        line: e.location.lineNumber + coverage.length - 1,
        source: e.location.fileName,
      } as Position,
      location:       {...e.location} as Location,
      state:          {...e.state},
      timestamp:      e.timestamp,
      value:          e.srcElement?.value, // srcElement : {value: "", tagName: ""} unpacked
      tagName:        e.srcElement?.tagName,
    }
  });

  return {
    trace: trace,
    profile: profile,
    events: events
  };  
}

function getCoverage(coverageRowData: ProfilerOutput, coverageEventsData: TemporaryEventType[]): TraceWithMapping {
  console.log(coverageRowData);
  console.log(coverageEventsData);
  
  const profile = coverageRowData.profile.map((e: any) => {
      const fileURL = (new URL(e.callFrame.url)).pathname.substring(1)
      const files = coverageRowData.bundleAndMap.find((bundle: [string, BundleAndMapClass]) => bundle[1].file === fileURL)
      if (files === undefined) {
        console.error("Profile row does not contain mapping. common files found is undefined")
        console.log("Profile row attempted to map: ", e);
        console.log("bundleAndMap", coverageRowData.bundleAndMap);
        console.log("computed fileURL, files", fileURL, files);
        throw new Error("Profile row does not contain  apping. common files found is undefined");
        return null;
        // Note: this adds a null in the trace array, as no corresponding file mapping 
        // exists for the event recorded
      }
      const [bundle, bundleMap]: [string, BundleAndMapClass] = files;
      const lineBundleStart = e.callFrame.lineNumber
      const lineBundleEnd = e.callFrame.lineNumber
      const codeCoverageMetaData = CodeCoverageMetaData({ lineBundleStart, lineBundleEnd }, bundleMap, 1)
      if (codeCoverageMetaData == null || codeCoverageMetaData.startPosition.source == null) return null;
      return { 
        coverage: extractCodeCoverage(
          codeCoverageMetaData.startPosition.line,
          codeCoverageMetaData.endPosition.line - codeCoverageMetaData.startPosition.line,
          coverageRowData.allFiles,
          codeCoverageMetaData.startPosition.source,
        ),
        ...codeCoverageMetaData, 
        ...e 
      }
    }).filter((e: any) => e != null)

    const trace : TraceElement[] = coverageRowData.trace.map( (e) : TraceElement => {
      const fileURL = (new URL(e.url)).pathname.substring(1)
      const files = coverageRowData.bundleAndMap.find((bundle: [string, BundleAndMapClass]) => bundle[1].file === fileURL);
      // const files = coverageRowData.bundleAndMap.find((bundle: [string, BundleAndMapClass]) => {bundle[1].file === fileURL});
      if (files === undefined) {
        console.log("Event attempted to map: ", e);
        console.log("bundleAndMap", coverageRowData.bundleAndMap);
        console.log("computed fileURL, files", fileURL, files);
        throw new Error("Event does not contain Mapping. common files found is undefined");
        // Note: this adds a null in the trace array, as no corresponding file mapping 
        // exists for the event recorded
      }
      const [bundle, bundleMap]: [string, BundleAndMapClass] = files;
      const { startOffset, endOffset } = e.ranges[0]
      const coverage = extractCoverageFromBundle(startOffset, endOffset, bundle)
      const codeCoverageMetaData = CodeCoverageMetaData(coverage, bundleMap, 0)
      if (codeCoverageMetaData == null || codeCoverageMetaData.startPosition.source == null) 
        throw new Error("Coverage not found");
      const matchingProfile : Profile = (profile.find((p : Profile) => 
      p.startPosition.line === codeCoverageMetaData.startPosition.line && 
      p.startPosition.source === codeCoverageMetaData.startPosition.source));
      return { 
        coverage: extractCodeCoverage(
          codeCoverageMetaData.startPosition.line,
          codeCoverageMetaData.endPosition.line - codeCoverageMetaData.startPosition.line,
          coverageRowData.allFiles,
          codeCoverageMetaData.startPosition.source,
        ),
        startPosition: codeCoverageMetaData.startPosition as Position,
        endPosition: codeCoverageMetaData.endPosition as Position,
        lineBundleStart: codeCoverageMetaData.lineBundleStart,
        lineBundleEnd: codeCoverageMetaData.lineBundleEnd,
        functionName:    e.functionName,
        isBlockCoverage: e.isBlockCoverage,
        ranges:          e.ranges,
        url:             e.url,
        timestamp:       e.timestamp,
        id:              matchingProfile === undefined ? undefined : matchingProfile.id
      };
    });

  const events = coverageEventsData.map((e: TemporaryEventType) => {
    e.location.fileName = convertPath(e.location.fileName)
    const fileContent = extractCodeCoverage(-Infinity, Infinity, coverageRowData.allFiles, e.location.fileName)
    const coverage = extractCodeCoverageFromJSX(e.location.lineNumber, fileContent)
    return {
      coverage,
      startPosition: {
        line: e.location.lineNumber,
        source: e.location.fileName,
      },
      endPosition: {
        line: e.location.lineNumber + coverage.length - 1,
        source: e.location.fileName,
      },
      functionName: e.type,
      ...e,
    }
  })
    .filter((e: any) => e != null)

  const finalTrace = addIdToTraceFromProfile(trace, profile)
  const sortedCoverage = [...finalTrace, ...events].sort((a: any, b: any) => a.timestamp - b.timestamp)
  const finalCoverage = devideCoverage(sortedCoverage)
  return finalCoverage;
}

export { getCoverage }
