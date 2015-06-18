;(function (cxt, CONFIG, common, $) {
  console.log('background', new Date().getTime());

  var storage = {},
      observHandler;

  function updateListing ($id, rsp) {
    var listings = $.isArray(storage.listings) ? storage.listings : [],
        item;
    for (var i = listings.length; i-- > 0;) {
      if (listings[i].$id === $id) {
        item = listings[i];
      }
    }
    if (!item) {
      return undefined;
    }
    var $o = $(rsp).find('div.market_listing_row'),
        price = common.getPrice($o[0], $o[1], $o[2]);
    if (price.price !== item.price) {
      return $.extend(item, {$timestamp: new Date().getTime()}, price);
    }
  }

  function observer () {
    if (!storage.observTimeout) {;
      return undefined;
    }
    observHandler = undefined;

    console.log('observer', new Date().getTime(), storage.observTimeout);
    var listings = $.isArray(storage.listings) ? storage.listings : [],
        deferreds = [],
        indexes = [];
    for (var i = listings.length; i-- > 0;) {
      indexes.unshift(listings[i].$id);
      deferreds.unshift($.ajax({url: listings[i].url, dataType: 'html'}));
    }
    $.when.apply($, deferreds).done(function () {
      var hasChanges = false;
      for (var i = arguments.length; i-- > 0;) {
        if (updateListing(indexes[i], arguments[i][0])) {
          hasChanges = true;
        }
      }
      if (hasChanges) {
        if (storage.showNotifications) {
          common.checkPrice(storage.listings);
        }
        common.saveStorage(storage);
      }
    }).always(function () {
      if (!observHandler && storage.observTimeout) {
        observHandler = setTimeout(observer, storage.observTimeout);
      }
    });
  }

  chrome.storage.sync.get(CONFIG.STORAGEKEY, function (o) {
    storage = common.getStorage(o);
    if (storage.showNotifications) {
      common.checkPrice(storage.listings);
    }
    if (!observHandler && storage.observTimeout) {
      observer();
    }
  });

  $(cxt).on('storage.' + CONFIG.STORAGEKEY, function (evt, o) {
    common.extendStorage(storage, o);
    if (storage.showNotifications) {
      common.checkPrice(storage.listings);
    }
    if (!observHandler && storage.observTimeout) {
      observer();
    }
  });
})(this, this['CONFIG'], this['common'], jQuery);
