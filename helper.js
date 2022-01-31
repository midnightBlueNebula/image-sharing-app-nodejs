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
  },
  
  renderWithData: function(
    res,
    viewFile,
    obj
  ) /*(response, "profile.ejs", { variableName: dataToRender })*/ {
    res.render(`${__dirname}/views/${viewFile}`, obj);
  },

  loggedIn: function(id) {
    if (typeof id === "undefined") {
      return false;
    }

    return true;
  },

  back: function(req, res) {
    req.session.currentURL = req.session.currentURL ? req.session.currentURL : "/"
    res.redirect(req.session.currentURL)
  }
};
