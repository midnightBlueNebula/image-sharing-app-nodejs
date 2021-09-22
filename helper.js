module.exports = {
  // helper function that prevents html/css/script malice
  cleanseString: function(string) {
    return string.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  },
  
  removeScriptTags: function(str) {
    while(str.match(/<script>/i)   || 
          str.match(/<\/script>/i) || 
          str.match(/<script/i)    || 
          str.match(/script>/i)    ||
          str.match(/\/script/i)) {
      str = str.replace(/<script>/gi, "")   
            .replace(/<\/script>/gi, "") 
            .replace(/<script/gi, "")    
            .replace(/script>/gi, "")    
            .replace(/\/script/gi, "")
    }
  }
};
