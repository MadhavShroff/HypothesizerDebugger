
const contentScriptPort = chrome.runtime.connect({ name: "connectDevtoolsAndContentScript" });


const nullthrows = (v) => {
    if (v == null) throw new Error("it's a null");
    return v;
}

function injectCode(src) {
    const script = document.createElement('script');
    // This is why it works!
    script.src = src;
    script.onload = function () {
        console.log("script injected!!", chrome.runtime);
        // this.remove();
    };

    // This script runs before the <head> element is created,
    // so we add the script to <html> instead.
    nullthrows(document.head || document.documentElement).appendChild(script);
}

injectCode(chrome.runtime.getURL('scripts/inject.js'));

window.addEventListener('connectionBetweenInjectedScriptAndContentScript', function (event) {
    const data = JSON.parse(event.detail.data);
    console.log("got data from injected script", data);
    contentScriptPort.postMessage({ data, name: "dataFromInjectedScript" });

});


