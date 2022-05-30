import React from 'react'
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
      const sortedCoverage = [...coverageData, ...events.current].sort((a: any, b: any) => a.timestamp - b.timestamp)
      const finalCoverage = devideCoverage(sortedCoverage)
      console.log('sortedCoverage->', sortedCoverage)
      console.log('finalCoverage->', finalCoverage)
      setMethodCoverage(finalCoverage)
    }
    setRecordingState(recordFlag)
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

  return (
    <div className="record">
      {isRecording ? (
        <Button variant="contained" color="secondary" onClick={() => recorder(false)} startIcon={<Pause />} size="large" id="recording">
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
