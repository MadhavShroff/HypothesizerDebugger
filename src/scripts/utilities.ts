import { TimelineItem, Filter, TraceWithMapping } from '../types/finalTypes';

const transformTrace = (trace: TraceWithMapping): TimelineItem[] => {
  let result : TimelineItem[] = [];
  if ((trace.events === undefined && trace.trace === undefined) || 
    (trace.events.length === 0 && trace.trace.length === 0)) return [];
  trace.trace.forEach((item, index) => {
    result.push({
      coverage: item.coverage,
      detailedText: item.startPosition.source.split('/').pop(),
      index: ""+index,
      title: `${item.functionName}` == "" ? "Anonymous" : `${item.functionName}`,
      icon: "f",
      type: "function",
      url: item.url,
      timestamp: ""+item.timestamp,
    })
  });
  trace.events.forEach((item, index) => {
    result.push({
      coverage: item.coverage === null ? ["Event Coverage Not Available"] : item.coverage,
      // detailedText?: string | string[];
      index: ""+index,
      title: "Event: " + item.type,
      icon: "e",
      type: "event",
      url: item.location?.fileName === null ? "File Name Not Available" : item.location?.fileName,
      timestamp: ""+item.timestamp,
    })
  });
  result = result.sort((a: TimelineItem, b: TimelineItem) => Number(a.timestamp) - Number(b.timestamp));
  return result;
}

const getListOfFilesFromTrace = (timelineItems: TimelineItem[]): string[] => {
  const result: string[] = []
  if (timelineItems !== undefined)
    timelineItems.forEach((e: TimelineItem) => {
      if (e.detailedText !== undefined && result.indexOf(e.detailedText) === -1) result.push(e.detailedText)
    })
  return result
}

const getFiltersFromFiles = (fileList: string[]): Filter[] => {
  const result: Filter[] = []
  fileList.forEach((fileName: string) => {
    result.push({
      filterBy: 'filename',
      condition: fileName,
      enabled: true,
    })
  })
  return result
}

const getFiltersFromTrace = (trace: TimelineItem[]): Filter[] => {
  return getFiltersFromFiles(getListOfFilesFromTrace(trace))
}

export { transformTrace, getListOfFilesFromTrace, getFiltersFromFiles, getFiltersFromTrace }
