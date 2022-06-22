import { Stack, Grid, Button } from '@mui/material'
import React, { useState } from 'react'
// import ReactJson from 'react-json-view'
import Recorder from './Recorder'
import Timeline from './Timelines1'
import '../scripts/devtools'
import {getFiltersFromTrace, splitTrace, transformTrace} from "./utilities";
import Filters from "./Filters";
import CoverageBox from "./CoverageBox";
import { Filter, HypoTimelineItem, Event, Coverage} from './types'

export const App = (): JSX.Element => {
  // const [timelineTrace, setTimelineTrace] = useState<HypoTimelineItem[]>([]);
  const [coverage, setCoverage] = useState<string[]>([]);
  const [timeline, setTimeline] = useState<{data?: HypoTimelineItem[], filters: Filter[]}>({
    data: [],
    filters: []
  });

  // console.log("Split Trace:", JSON.stringify(trace));
  console.log("Filters array:", timeline.filters);

  return (
    <Stack spacing={2}>
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={6}>
            <Recorder 
              setMethodCoverage={(rawTrace: unknown): void => {
              const transform = transformTrace(splitTrace(rawTrace as (Event | Coverage)[][])); // split raw trace into events[] and coverage[], then transform that into list of timeline objects
              setTimeline({
                data: transform,
                filters: getFiltersFromTrace(transform)
              })
            }}/>
        </Grid>
        <Grid item xs={6}>
          <Button 
            variant="contained" 
            color="primary" onClick={() => {
              window.location.reload();
              chrome.devtools.inspectedWindow.eval('window.location.reload()');
            }}>
            Reload Extension 🔄
          </Button>
        </Grid>
        <Grid item xs={6} md={7}>
          {timeline.data !== undefined && timeline.data.length !== 0 && 
          <Timeline 
            trace={timeline.data} 
            setCoverage={setCoverage} 
            filters={timeline.filters}
          />}
        </Grid>
        <Grid item xs={6} md={5}>
          <Stack>
            <Filters 
              timeline={timeline} 
              setTimeline={setTimeline}>
            </Filters>
            {timeline.data && timeline.data.length !== 0 && 
            <CoverageBox 
              coverage={coverage}
            />}
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  )
}