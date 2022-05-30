import React, { useState } from 'react'
import ReactJson from 'react-json-view'
import Recorder from './Recorder'
import Timeline from './Timelines'
export const App = (): JSX.Element => {
  const [trace, setTrace] = useState<any>([])

  const setMethodCoverage = (methodsCoverage: any): void => {
    // console.log(methodsCoverage)
    setTrace(methodsCoverage)
  }
  return (
    <div>
      <Recorder setMethodCoverage={setMethodCoverage} />
      {/* <ReactJson src={trace} theme="monokai" collapsed={1} displayDataTypes={false} /> */}
      <Timeline trace={trace} />
    </div>
  )
}
