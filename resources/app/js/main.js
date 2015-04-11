var remote = require("remote");
var path = require("path");
var api = require("./api.js");
var $ = api.$;

var main = function() {
  api.registerURLMapping("ibrows:blank", "file://"+path.resolve("./resources/app/pages/blank.html"));
  api.registerURLMapping("ibrows:error:generic", "file://"+path.resolve("./resources/app/pages/error/generic.html"));
  api.loadExtensions();
  
  var win = remote.getCurrentWindow();
  
  win.show();
  win.maximize();
  
  win.isMaximized = true;
  
  $(".titlebar .windowCloseBtn").click(function() {
    win.close();
  });
  
  $(".titlebar .windowMaximizeBtn").click(function() {
    if(win.isMaximized) {
      win.unmaximize();
    } else {
      win.maximize();
    }
    win.isMaximized = !win.isMaximized;
  });
  
  $(".titlebar .windowMinimizeBtn").click(function() {
    win.minimize();
  });
  
  $(".titlebar .windowDevBtn").click(function() {
    var tabs = api.getExtension("ibrows-tabs");
    if(tabs && tabs.getSelectedTab() != null) {
      var webview = tabs.getSelectedTab().getWebview()[0];
      if(!webview.isDevToolsOpened()) {
        webview.openDevTools();
      } else {
        webview.closeDevTools();
      }
    } else {
      win.toggleDevTools();
    }
  });
}

module.exports = main;
