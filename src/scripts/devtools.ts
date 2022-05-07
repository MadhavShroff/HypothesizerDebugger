const backgroundPageConnection = chrome.runtime.connect({
  name: 'panel',
})

backgroundPageConnection.postMessage({
  name: 'init',
  tabId: chrome.devtools.inspectedWindow.tabId,
})

backgroundPageConnection.onMessage.addListener((message) => {
  // dispatch document events
  console.log(message, 'devtools')
  window.dispatchEvent(
    new CustomEvent('traceCollected', {
      detail: message,
    }),
  )
})
