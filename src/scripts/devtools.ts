const backgroundPageConnection : chrome.runtime.Port = chrome.runtime.connect({
  name: 'panel',
})

console.log(backgroundPageConnection);

backgroundPageConnection.postMessage({
  name: 'init',
  tabId: chrome.devtools.inspectedWindow.tabId,
})

backgroundPageConnection.onMessage.addListener((message) => {
  // dispatch document events
  if (message.data === 'debuggerOnline') {
    window.dispatchEvent(
      new CustomEvent('debuggerOnline', {
        detail: undefined,
      }),
    )
  } else {
    console.log('backgroundPageConnection.onMessage: ', message)
    window.dispatchEvent(
      new CustomEvent('newEventRecorded', { // changed event name from "traceCollected" to "newEvent" for better clarity
        detail: message,
      }),
    )
  }
})
