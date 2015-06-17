;(function (cxt, CONFIG, $) {
  cxt['common'] = {
    saveStorage: function (storage) {
      var data = {};
      data[CONFIG.STORAGEKEY] = storage;
      chrome.storage.sync.set(data);
    }
  };
})(this, this['CONFIG'], jQuery);
