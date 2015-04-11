(function() {
  var ipc = require('ipc')
  var url = require('url');

  // Modify page styles.
  var updateStyles = function() {
    var newStyle = document.createElement('style');
    var content = document.createTextNode("\
    *::-webkit-scrollbar-track {\
      background-color: #F1F1F1;\
    }\
    *::-webkit-scrollbar {\
      width: 10px;\
      height: 10px;\
      background-color: #F5F5F5;\
    }\
    *::-webkit-scrollbar-thumb {\
      background-color: #CCC;\
    }\
    *::-webkit-scrollbar-thumb:hover {\
      background-color: #BBB;\
    }\
    *::-webkit-scrollbar-thumb:active {\
      background-color: #AAA;\
    }\
    ");
    newStyle.appendChild(content);
    var head = document.head;
    head.appendChild(newStyle);
  }
  
  var getFaviconLink = function() {
    var href = window.location.href;
    
    var final_favicon = "";
    var elem = document.getElementsByTagName('link');
    for(var i=0;i<elem.length;i++){
      if(/icon/.test(elem[i].rel) == true){
        final_favicon = elem[i].href;
        
        if(/^shortcut /.test(elem[i].rel) == true){
          break;
        }
      }
    }
    
    if(final_favicon == "") {
      return url.resolve(href, "favicon.ico");
    } else {
      return url.resolve(href, final_favicon);
    }
  }
  window.onbeforeunload = function() {
      ipc.sendToHost('webview:beforenavigate');
  }
  
  document.addEventListener("DOMContentLoaded", function() {
    updateStyles();
    ipc.sendToHost('webview:faviconchange', getFaviconLink());

    ipc.sendToHost('webview:locationchange', window.location.href);
    Object.observe(window.location, function(changes) {
        if(changes.name == "href" && changes.type == "update") {
          window.location.href = changes.oldValue;
          ipc.sendToHost('webview:locationchange', window.location.href);
        }
    });
    
    var title = document.getElementsByTagName("title");
    if(title && title.length > 0) {
      ipc.sendToHost('webview:titlechange', title[0].innerHTML);
      Object.observe(title[0], function(changes) {
          if(changes.name == "innerHTML" && changes.type == "update")
          ipc.sendToHost('webview:titlechange', title[0].innerHTML);
      });
    } else {
      ipc.sendToHost('webview:titlechange', window.location.href);
    }
  });
})();
