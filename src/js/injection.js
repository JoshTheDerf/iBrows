(function () {
  var ipc = require('ipc')

  document.addEventListener('DOMContentLoaded', function () {
    window.onbeforeunload = function () {
      console.log(window.location.href)
      ipc.sendToHost('webview:beforenavigate')
    }

    ipc.sendToHost('webview:locationchange', window.location.href)

    Object.observe(window.location, function (changes) {
      if (changes.name === 'href' && changes.type === 'update') {
        window.location.href = changes.oldValue
        ipc.sendToHost('webview:locationchange', window.location.href)
      }
    })
  })
})()
