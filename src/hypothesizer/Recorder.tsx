import * as React from 'react'
import './Recorder.css'
import { Button } from '@mui/material'
import { VideoCall } from '@mui/icons-material'
import { Pause } from '@mui/icons-material'
import { endProfiler, startProfiler } from '../scripts/profiler'
import { getCoverage } from '../scripts/sourcemap'
type MethodCoverage = {
  method: string
  start: number
  end: number
  file: string
  timestamp: number
}

type RecorderProps = {
  setMethodCoverage: React.Dispatch<React.SetStateAction<MethodCoverage[]>>
}

const Recorder: React.FC<RecorderProps> = ({ setMethodCoverage }): React.ReactElement => {
  const [isRecording, setRecordingState] = React.useState<boolean>(false)
  const events = React.useRef<any>([])
  const traceCollector = React.useCallback((incommingTrace: any) => {
    const data = incommingTrace.detail.data.length ? incommingTrace.detail.data : [incommingTrace.detail.data]
    events.current.push(...data)
  }, [])
  const recorder = async (recordFlag: boolean): Promise<void> => {
    if (recordFlag) {
      window.addEventListener('traceCollected', traceCollector)
      await startProfiler(() => setRecordingState(false))
    } else {
      window.removeEventListener('traceCollected', traceCollector)

      console.log('listener removed')
      const coverage: any = await endProfiler()
      const coverageData = await getCoverage(coverage)
      console.log('coverageData->', coverageData)
      const sortedCoverage = [...coverage, ...events.current].sort((a: any, b: any) => a.timestamp - b.timestamp)
      setMethodCoverage(sortedCoverage)
    }
    setRecordingState(recordFlag)
  }
  return (
    <div className="Record">
      {isRecording ? (
        <Button variant="contained" color="secondary" onClick={() => recorder(false)} startIcon={<Pause />} size="large" className="recording">
          Recording
        </Button>
      ) : (
        <Button variant="contained" color="primary" size="large" onClick={() => recorder(true)} startIcon={<VideoCall />}>
          Record
        </Button>
      )}
    </div>
  )
}

export default Recorder
