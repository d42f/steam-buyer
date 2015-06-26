;(function (cxt) {
  cxt['CONFIG'] = {
    ISDEVMODE: !('update_url' in chrome.runtime.getManifest()),
    STORAGEKEY: 'steam-buyer',
    HIGHLIGHTTIMEOUT: 500,
    OBSERVTIMEOUTS: [0, 1000, 2000, 3000, 4000, 5000],
    OBSERVTIMEOUTDEFAULT: 4000,
    reML: /\/market\/listings\/([\d]+)\/([\.\'\d\w\%]+)/
  };
})(this);
