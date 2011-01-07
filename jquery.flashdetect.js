/**
 * jquery.flashdetect plugin
 *
 * based on http://jquery.lukelutman.com/plugins/flash
 **/

(function($){

/**
 * @name flash.hasFlash
 * @desc Check if a specific version of the Flash plugin is installed
 * @type Boolean
 *
**/
$.hasFlash = function(arguments) {
    arguments = typeof(arguments) != 'undefined' ? arguments : [1,0,0];
  // look for a flag in the query string to bypass flash detection
  if(/hasFlash=true/.test(location)) return true;
  if(/hasFlash=false/.test(location)) return false;
  var pv = $.hasFlash.playerVersion().match(/\d+/g);
  for(var i = 0; i < 3; i++) {
    var p = parseInt(pv[i] || 0);
    var r = arguments[i] || 0;
    // player is less than required
    if(p < r) return false;
    // player is greater than required
    if(p > r) return true;
  }
  // major version, minor version and revision match exactly
  return true;
};

/**
 * @name flash.hasFlash.playerVersion
 * @desc Get the version of the installed Flash plugin.
 * @type String
**/
$.hasFlash.playerVersion = function() {
  // ie
  try {
    try {
      // avoid fp6 minor version lookup issues
      // see: http://blog.deconcept.com/2006/01/11/getvariable-setvariable-crash-internet-explorer-flash-6/
      var axo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6');
      try { axo.AllowScriptAccess = 'always'; }
      catch(e) { return '6,0,0'; }
    } catch(e) {}
    return new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];
  // other browsers
  } catch(e) {
    try {
      if(navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin){
        return (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]).description.replace(/\D+/g, ",").match(/^,?(.+),?$/)[1];
      }
    } catch(e) {}
  }
  return '0,0,0';
};

})(jQuery);