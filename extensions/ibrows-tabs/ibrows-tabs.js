var Tab = require("./Tab.js");

var api = ibrows_api;
var $ = api.$;

var tablist = [];
var selected = {index: null, id: ""};

var tabs = function(name, version) {
  api.Extension.apply(this, arguments);
  
  this.onEnable = function() {
    var _self = this;
    this.log("Extension Enabled");
    this.addStyles(__dirname+"/less/tabs.less");

    
    $(".titlebar .content").append('<div class="tabstrip"></div><div class="addBtn btn fa fa-plus"></div>');
    $("#main").append('<div class="pagearea"></div>');
    
    $(".titlebar .addBtn").click(function() {
      _self.addTab(null, true, true);
    });

    $(".titlebar").wheel(function(e) {
      var selTab = $(".tab.active");
      if(e.delta > 1) {
        var ind = selected.index+1;
        if(ind == tablist.length) {
          ind = 0;
        }
        
        var nextTab = _self.getTabByIndex(ind);
        if(nextTab != null) {
          _self.selectTab(nextTab);
        }
      } else {
        var ind = selected.index-1;
        if(ind < 0) {
          ind = tablist.length-1;
        }
        
        var prevTab = _self.getTabByIndex(ind);
        if(prevTab != null) {
          _self.selectTab(prevTab);
        }
      }
    });

    this.addTab(null, true, true);
  }
  
  this.onDisable = function() {
    this.removeStyles(__dirname+"/less/tabs.less");
    $(".titlebar .content .tabstrip").remove();
    $(".titlebar .content .addBtn").remove();
    $(".main .pagearea").remove();
  }
  
  this.getTabList = function() {
    return tablist;
  }
  
  this.getSelected = function() {
    return selected;
  }

  this.addTab = function(url, select, edit) {
    var select = select != null ? select : true;
    var thisTab = new Tab(this, url);
    
    $(".tabstrip").append(thisTab.getElement());
    
    tablist.push(thisTab);
    
    if(select) {
      this.selectTab(thisTab);
      if(edit)
        thisTab.toggleEdit(true);
    }
    
    return thisTab;
  }

  this.recalculateSize = function() {
    var tabWidth = Math.floor(($(".titlebar").width()-364)/tablist.length);
    var inactiveTabs = $(".tab:not(.active)");
    $(".tab.active").removeClass("mini");
    
    if(tabWidth <= 150) {
      inactiveTabs.css({
        width: tabWidth+"px"
      });
      
      inactiveTabs.children(".title").css({
        width: tabWidth-50 >= 0 ? tabWidth-50 : 0+"px"
      });
      
      if(tabWidth < 70) {
        inactiveTabs.addClass("mini");
      } else {
        inactiveTabs.removeClass("mini");
      }
    }
  }

  this.selectTab = function(tab) {
    if(tab != null) {
      if(selected.index != null) {
        if(tablist.indexOf(tab) == selected.index) return;
        if(tablist.length > selected.index) {tablist[selected.index].setSelected(false)};
      }
      selected = {index: tablist.indexOf(tab), id: tab.getId()};
      tab.setSelected(true);
      $(".titlebar .tabstrip .tab.active").removeClass("active");
      tab.getElement().addClass("active");
      this.recalculateSize();
    } else {
      selected = {index: null, id: ""};
      this.recalculateSize();
    }
  }

  this.getSelectedTab = function() {
    return this.getTabById(selected.id);
  }

  this.getTabById = function(id) {
    for(var i = 0; i < tablist.length; i++) {
      if(tablist[i].getId() == id) return tablist[i];
    }
    
    return null;
  }

  this.getTabByIndex = function(index) {
    return tablist.length > index ? tablist[index] : null;
  }
  
  return this;
};

tabs.prototype = api.Extension.prototype;
tabs.prototype.constructor = tabs;

module.exports = tabs;
