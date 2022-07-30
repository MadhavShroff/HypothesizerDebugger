import { Stack, Grid, Button } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import Recorder from './Recorder'
import Timeline from './Timeline/Timeline'
import '../scripts/devtools'
import { getFiltersFromTrace, transformTrace} from '../scripts/utilities'
import Filters from './Filters'
import CoverageBox from './CoverageBox'
import { Filter, TimelineItem} from '../types/finalTypes'
import { TraceWithMapping } from '../types/finalTypes'

export const App = (): JSX.Element => {
  const [coverage, setCoverage] = useState<string[]>([])
  const [timeline, setTimeline] = useState<{ data?: TimelineItem[]; filters: Filter[] }>({
    data: [],
    filters: [],
  })
  const [isdebuggerOnline, setDebuggerStatus] = useState<boolean>(false)
  const connectionTimeOut = useRef<number>(0)
  useEffect(() => {
    window.addEventListener('debuggerOnline', () => {
      if (connectionTimeOut.current > Date.now() || connectionTimeOut.current == 0) {
        setDebuggerStatus(true)
        connectionTimeOut.current = Date.now() + 3000
      }
    })
    const checkIsdebuggerOnline = setInterval(() => {
      if (connectionTimeOut.current < Date.now()) {
        setDebuggerStatus(false)
      }
    }, 1000)

    return () => {
      window.removeEventListener('debuggerOnline', (e) => console.log('debuggerOnline'))
      clearInterval(checkIsdebuggerOnline)
    }
  }, [])

  const getTimeLine = (): JSX.Element => {
    if (timeline.data?.length && timeline.data.length > 0) return <Timeline itemList={applyFilters(timeline)} setCoverage={setCoverage} filters={timeline.filters} />
    return <></>
  }
  return (
    <Stack spacing={2}>
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={6}>
          {isdebuggerOnline && (
            <Recorder
              setMethodCoverage={(rawTrace: TraceWithMapping): void => {
                const transform = transformTrace(rawTrace as TraceWithMapping) // split raw trace into events[] and coverage[], then transform that into list of timeline objects
                setTimeline({
                  data: transform,
                  filters: getFiltersFromTrace(transform),
                })
              }}
            />
          )}
          <p>Debugger is {isdebuggerOnline ? 'online' : 'offline'}</p>
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              window.location.reload()
              chrome.devtools.inspectedWindow.eval('window.location.reload()')
            }}>
            Reload Extension 🔄
          </Button>
        </Grid>
        <Grid item xs={6} md={7}>
          {getTimeLine()}
        </Grid>
        <Grid item xs={6} md={5}>
          <Stack>
            <Filters timeline={timeline} setTimeline={setTimeline}></Filters>
            {timeline.data && timeline.data.length !== 0 && <CoverageBox coverage={coverage} startLine={10} />}
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  )
}
function applyFilters(timeline: { data?: TimelineItem[]; filters: Filter[] }): TimelineItem[] {
  const result : TimelineItem[] = [];
  timeline.filters.forEach((filter) => {
    if(timeline.data === undefined) return;
    const filteredItems = timeline.data.filter((item) => {
      if (!filter.enabled) return false;
      if (filter.filterBy === 'filename') {
        return item.detailedText === filter.condition; // is the item src === condition(file name string ex: "App.tsx")
      } else {// else if(filter.filterBy === "type") { // filter by type ("event" or "callstack")
        if (filter.condition === 'event') return item.coverage === undefined // event object does not have coverage attr
        // else if(filter.condition === "coverage")
        else return item.coverage !== undefined // call stack item has coverage data
      }
    });
    result.push(...filteredItems);
  });
  console.log('Filtered result:', result)
  return result;
}
