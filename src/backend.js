// COPYRIGHT (c) 2015 Joshua Bemenderfer
//
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// Background process for iBrows

var app = require('app')
var BrowserWindow = require('browser-window')

require('crash-reporter').start()

var mainWindow = null

app.commandLine.appendSwitch('enable-transparent-visuals')

app.on('window-all-closed', function () {
  app.quit()
})

app.on('ready', function () {
  var screen = require('screen')
  var size = screen.getPrimaryDisplay().workAreaSize

  mainWindow = new BrowserWindow({
    show: false,
    frame: false,
    transparent: true,
    icon: __dirname + '/images/icon.mono.64.png',
    x: 0,
    y: 0,
    width: size.width,
    height: size.height
  })

  mainWindow.loadUrl('file://' + __dirname + '/index.html')

  mainWindow.on('closed', function () {
    mainWindow = null
  })
})
