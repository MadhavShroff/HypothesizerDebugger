import React from 'react'
import './Recorder.css'
import { Button } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { VideoCall, Save, Pause } from '@mui/icons-material'
import { endProfiler, startProfiler } from '../scripts/profiler'
import { getTrace } from '../scripts/coverage'
import { ProfilerOutput, TemporaryEventType } from '../types/ProfilerOutputTypes'

type recordState = 'ideal' | 'record' | 'collect'

type RecorderProps = {
  setMethodCoverage: any
}

const Recorder: React.FC<RecorderProps> = ({ setMethodCoverage }): React.ReactElement => {
  const [recordState, setRecordingState] = React.useState<recordState>('ideal')
  const events = React.useRef<TemporaryEventType[]>([]);
  const traceCollector = React.useCallback((incommingTrace) => {
    const eventReceived: TemporaryEventType[] | TemporaryEventType = incommingTrace.detail.data;
    if(Array.isArray(eventReceived)) {
      events.current.push(...eventReceived);
    } else events.current.push(eventReceived);
  }, []);

  const recorder = async (recordState: recordState): Promise<void> => {
    if (recordState == 'record') {
      setRecordingState(recordState)
      window.addEventListener('newEventRecorded', traceCollector)
      await startProfiler('')
    } else if (recordState == 'collect') {
      window.removeEventListener('newEventRecorded', traceCollector)
      setRecordingState(recordState)
      endProfiler().then((coverage: ProfilerOutput) => {
        console.log(events.current);
        const coverageData = getTrace(coverage, events.current)
        setMethodCoverage(coverageData)
        setRecordingState('ideal')
      }).catch(err => {
        console.log(err)
        document.write(err);
        setRecordingState('record');
      });
    }
  }

  const getButton = (): JSX.Element => {
    switch (recordState) {
      case 'ideal':
        return (
          <Button variant="contained" color="primary" size="large" onClick={() => recorder('record')} startIcon={<VideoCall />}>
            Record
          </Button>
        )
      case 'record':
        return (
          <Button variant="contained" color="secondary" onClick={() => recorder('collect')} startIcon={<Pause />} size="large" id="recording">
            Recording
          </Button>
        )
      case 'collect':
        return (
          <LoadingButton color="success" loading loadingPosition="start" startIcon={<Save />} variant="contained">
            Collecting
          </LoadingButton>
        )
    }
  }
  return <div className="record">{getButton()}</div>
}

export default Recorder
