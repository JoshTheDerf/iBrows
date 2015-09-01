/* global ibrows_api, less */

var fs = require('fs')
var path = require('path')
var util = require('util')

var extension = function (name, version) {
  this.name = name
  this.version = version

  this.log = function (string, logLevel) {
    logLevel = logLevel ? +logLevel : 0
    if (ibrows_api.logLevel >= logLevel) {
      console.log(util.format('[%s %s]: %s', this.name, this.version, string))
    }
  }

  this.addStyles = function (files, options, callback) {
    var appendStyles = function (file, styles) {
      var $ = ibrows_api.$
      var idFormatted = util.format('%s-%s', this.name, path.basename(file).split('.').join('-'))
      $(document.head).append('<style id="' + idFormatted + '">' + styles + '</style>')

      callback ? callback() : null
    }

    if (Array.isArray(files)) {
      for (var i = 0; i < files.length; i++) {
        fs.readFile(files[i], function (err, data) {
          if (err) throw err
          less.render(data.toString(), {

          }).then(function (output) {
            appendStyles(files[i], output.css)
          })
        })
      }
    } else {
      fs.readFile(files, function (err, data) {
        if (err) throw err
        less.render(data.toString(), {

        }).then(function (output) {
          appendStyles(files, output.css)
        })
      })
    }
  }

  this.removeStyles = function (files) {
    var stripStyle = function (file) {
      var $ = ibrows_api.$
      var idFormatted = util.format('%s-%s', this.name, path.basename(file).split('.').join('-'))
      $('#' + idFormatted).remove()
    }

    if (Array.isArray(files)) {
      for (var i = 0; i < files.length; i++) {
        stripStyle(files[i])
      }
    } else {
      stripStyle(files)
    }
  }

  this.onEnable = function () {
    this.log('Enabled!')
  }

  this.onDisable = function () {
    this.log('Disabled!')
  }

  this.on
}

module.exports = extension
