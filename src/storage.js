;(function (cxt, CONFIG, $) {
  var $cxt = $(cxt);
  chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (var key in changes) {
      if (changes.hasOwnProperty(key)) {
        $cxt.trigger('storage.' + key, [changes[key].newValue, changes[key].oldValue])
      }
    }
  });
})(this, this['CONFIG'], jQuery);
