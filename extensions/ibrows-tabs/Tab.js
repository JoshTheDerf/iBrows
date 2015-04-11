var api = ibrows_api;
var $ = api.$;

var tabTemplate = '\
<div class="tab" id="{{id}}">\
<img src=""/>\
<span class="hidden pointer"><i></i></span>\
<span class="title"></span>\
<span class="closeBtn fa fa-times"></span>\
</div>';

var defaultFavicon = "./images/appicons/document.png";

var Tab = function(tabs, url) {
  var id = "tab-"+api.uuid4();
  var url = url ? url : "ibrows:blank";
  var favicon = defaultFavicon;
  var title = "New Tab";
  var element = "";
  var webview = $('<webview src="'+url+'" plugins preload="./js/injection.js"></webview>');
  var editMode = false;
  $(".pagearea").append(webview);
  
  
  var isSelected = true;
  
  this.getId      = function() {return       id};
  this.getURL     = function() {return      url};
  this.getFavicon = function() {return  favicon};
  this.getTitle   = function() {return    title};
  this.getElement = function() {return  element};
  this.getWebview = function() {return  webview};
  this.isSelected = function() {return selected};
  
  this.setURL = function(newURL, navigate) {
    var navigate = navigate != null ? navigate : true;
    url = api.reverseResolveURL(newURL);
    
    if(navigate) {
      webview.attr("src", api.resolveURL(newURL));
    }
  };
  
  this.setFavicon  = function(newFavicon) {
    favicon = newFavicon;
  };
  
  this.setIcon = function(isImage, path) {
    if(element) {
      if(isImage) {
        element.children(".pointer").addClass("hidden");
        element.children("img").removeClass("hidden");
        if(path) {
          element.children("img").attr("src", path);
        }
      } else {
        element.children(".pointer").removeClass("hidden");
        element.children("img").addClass("hidden");
        element.find(".pointer i").removeClass().addClass("fa "+path);
      }
    }
  }
  
  this.setTitle = function(newTitle)   {
    title = newTitle;
    element.children("span.title").text(title).attr("title", title);
  };
  
  this.setElement  = function(newElement) {element  = newElement};
  this.setWebview  = function(newWebview) {webview  = newWebview};
  
  this.setSelected = function(isSelected) {
    isSelected = isSelected;
    if(isSelected) {
      webview.removeClass("out").addClass("in");
    } else {
      webview.removeClass("in").addClass("out");
      this.toggleEdit(false);
    }
  };
  
  this.toggleEdit = function(mode) {
    if(mode == null) mode = !editMode;
    var _self = this;
    if(mode != editMode) {
      if(mode) {
        element.children(".title").replaceWith('<input type="text" class="title" value="'+url+'"/>')
        
        element.children(".title").focus().select().blur(function() {
          _self.toggleEdit(false);
          
        }).keyup(function(e) {
          if (e.keyCode == 13) {
            _self.setURL(this.value);
            _self.toggleEdit(false);
          }
        });
        
        this.setIcon(false, "fa-caret-right");
        element.addClass("editing");
      } else {
        element.children(".title").replaceWith('<span class="title">'+title+'</span>');
        
        element.children(".title").click(function() {
          if(tabs.getSelected().index == tabs.getTabList().indexOf(_self)) {
            _self.toggleEdit(true);
          }
        });
        
        this.setIcon(true);
        element.removeClass("editing");
      }
    }
    
    editMode = mode;
  }
  
  this.bindEvents = function() {
    var _self = this;
    element.on("click", function () {
      tabs.selectTab(_self);
    });
    
    element.children(".title").click(function() {
      _self.toggleEdit(true);
    });
    
    element.children(".closeBtn").click(function(e) {
      var nextTab = tabs.getTabByIndex(tabs.getTabList().indexOf(_self)-1);
      if(nextTab == null) {
        nextTab = tabs.getTabByIndex(tabs.getTabList().indexOf(_self)+1);
      }
      
      if(nextTab == null) {
        nextTab = tabs.getTabByIndex(0);
      }
      
      if(nextTab != _self && nextTab != null) {
        tabs.selectTab(nextTab);
      } else {
        tabs.selectTab(null);
      }
      
      _self.close();
      return false;
    });
    
    webview[0].addEventListener("did-start-loading", function(e) {
      var int = setInterval(function() {
        if(webview) {
          if(webview[0].isWaitingForResponse()) {
            _self.setIcon(false, "fa-circle-o-notch spin reverse");
          } else if (webview[0].isLoading()) {
            _self.setIcon(false, "fa-circle-o-notch spin");
          } else {
            clearInterval(int);
            _self.setIcon(true);
          }
        } else {
          clearInterval(int);
        }
      }, 500);
    });
    
    /*webview[0].addEventListener("did-finish-load", function(e) {
    _self.setTitle(webview[0].getTitle());
    _self.setURL(webview[0].getUrl(), false);
  });*/
  
  
  webview[0].addEventListener('did-fail-load', function(e) {
    _self.setURL("ibrows:error:generic");
  });
  
  webview[0].addEventListener('new-window', function(e) {
    tabs.addTab(e.url, false);
  });
  
  webview[0].addEventListener("page-title-updated", function(e) {
  });
  
  webview[0].addEventListener('ipc-message', function(e) {
    if(e.channel == "webview:faviconchange") {
      api.$.ajax({
        url: e.args[0],
      }).done(function(err, data) {
        if(data != null)
        _self.setFavicon(e.args[0]);
        _self.setIcon(true, e.args[0]);
      }).fail(function(err) {
        _self.setFavicon(defaultFavicon)
        _self.setIcon(true, defaultFavicon);
      });
    } else if(e.channel == "webview:locationchange") {
      _self.setURL(e.args[0], false);
    } else if(e.channel == "webview:titlechange") {
      _self.setTitle(e.args[0]);
    } else if(e.channel == "webview:beforenavigate") {
    }
  });
}

this.close = function() {
  if(tabs.getTabList().indexOf(this) != -1) {
    tabs.getTabList().splice(tabs.getTabList().indexOf(this), 1);
  }
  element.remove();
  webview.remove();
  element = null;
  webview = null;
  delete element;
  delete webview;
}

var preparedTemplate = tabTemplate.replace("{{id}}", id);
this.setElement($(preparedTemplate));
this.setIcon(true, favicon);
this.setTitle(title);
this.setURL(url);
this.bindEvents();

}

module.exports = Tab;
