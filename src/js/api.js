var fs = require('fs')
var path = require('path')
var url = require('url')

var api = {
  '$': require('../../lib/jquery.min.js'),
  'window': null,
  'gui': null,
  'Extension': require('./extension.js'),
  'extensions': {},
  'extensionPaths': [
    path.join(__dirname, '../../extensions')
  ],
  'URLMappings': {

  },
  'logLevel': 0
}

api.getWindow = function () {
  return window
}

api.setWindow = function (window) {
  api.window = window
}

api.getGUI = function () {
  return api.gui
}

api.setGUI = function (gui) {
  api.gui = gui
}

api.registerURLMapping = function (source, dest) {
  api.URLMappings[source] = dest
}

api.resolveURL = function (source) {
  var mapping = api.URLMappings[source]
  if (mapping != null) {
    return mapping
  } else if (url.parse(source).protocol == null) {
    return 'http://' + source
  } else {
    return source
  }
}

api.reverseResolveURL = function (dest) {
  var reverse = dest
  api.$.each(api.URLMappings, function (k, v) {
    if (dest === v) {
      reverse = k
      return false
    }
  })
  return reverse
}

api.readJSON = function (path) {
  try {
    return JSON.parse(fs.readFileSync(path))
  } catch (e) {
    return null
  }
}

api.getExtension = function (name) {
  if (!api.extensions[name]) {
    for (var i = 0; i < api.extensionPaths.length; i++) {
      var extPath = api.extensionPaths[i]
      var manifest = api.readJSON(path.join(extPath, name, 'package.json'))
      if (manifest && manifest.name && manifest.main) {
        api.extensions[manifest.name] = require(path.join(extPath, name, manifest.main))(manifest.name, manifest.version)
        return api.extensions[manifest.name]
      }
    }
  } else {
    return api.extensions[name]
  }
  return null
}

api.loadExtensions = function () {
  var i, j
  for (i = 0; i < api.extensionPaths.length; i++) {
    var extRoot = api.extensionPaths[i]
    var extList = fs.readdirSync(extRoot)
    for (j = 0; j < extList.length; j++) {
      var extPath = extList[j]
      if (fs.lstatSync(path.join(extRoot, extPath)).isDirectory()) {
        api.getExtension(extPath)
      }
    }
  }
  var extensions = Object.keys(api.extensions)
  for (j = 0; j < extensions.length; j++) {
    api.enableExtension(extensions[j])
  }
}

api.enableExtension = function (extName) {
  var ext = api.getExtension(extName)
  ext && ext.onEnable ? ext.onEnable() : null
}

api.disableExtension = function (extName) {
  var ext = api.getExtension(extName)
  ext && ext.onDisable ? ext.onDisable() : null
}

/** From http://stackoverflow.com/a/21963136/3673077 **/
var lut = []
for (var i = 0; i < 256; i++) { lut[i] = (i < 16 ? '0' : '') + (i).toString(16) }
api.uuid4 = function () {
  var d0 = Math.random() * 0xffffffff | 0
  var d1 = Math.random() * 0xffffffff | 0
  var d2 = Math.random() * 0xffffffff | 0
  var d3 = Math.random() * 0xffffffff | 0
  return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
    lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
    lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
    lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff]
}

// jQuery addition
api.$.fn.wheel = function (callback) {
  return this.each(function () {
    api.$(this).on('mousewheel DOMMouseScroll', function (e) {
      e.delta = null
      if (e.originalEvent) {
        if (e.originalEvent.wheelDelta) e.delta = e.originalEvent.wheelDelta / -40
        if (e.originalEvent.deltaY) e.delta = e.originalEvent.deltaY
        if (e.originalEvent.detail) e.delta = e.originalEvent.detail
      }

      if (typeof callback === 'function') {
        callback.call(this, e)
      }
    })
  })
}

global.ibrows_api = api
module.exports = api
