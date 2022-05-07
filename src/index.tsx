import React from 'react'
import { render } from 'react-dom'
import { App } from './hypothesizer/App'
import './scripts/devtools'
import { Button } from '@mui/material'

const root = document.getElementById('root')

render(
  <>
    <Button
      variant="text"
      color="primary"
      onClick={() => {
        window.location.reload()
        chrome.devtools.inspectedWindow.eval('window.location.reload()')
      }}
    >
      <h1> 🔄</h1>
    </Button>
    ,
    <App />
  </>,
  root,
)
