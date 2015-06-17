;(function (cxt, CONFIG, common, $) {
  console.log('background', new Date().getTime());

  var storage = {};

  function getPrice () {
    var vals, valn;
    for (var i = 0, n = arguments.length; i < n; i++) {
      if (valn) {
        break;
      }
      vals = arguments[i].find('span.market_listing_price:first').text();
      valn = parseFloat(vals.replace(',', '.'));
    }
    return {
      price: valn || undefined,
      price_label: valn ? vals.replace(/[\n\s]+/g, '') : ''
    };
  }

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
        price = getPrice($($o[0]), $($o[1]), $($o[2]));
    if (price.price !== item.price) {
      return $.extend(item, {$timestamp: new Date().getTime()}, price);
    }
  }

  function observer () {
    if (storage.isDisabled === true) {
      return undefined;
    }

    console.log('observer', new Date().getTime());
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
        common.saveStorage(storage);
      }
      setTimeout(observer, CONFIG.OBSERVTIMEOUT);
    });
  }

  chrome.storage.sync.get(CONFIG.STORAGEKEY, function (o) {
    storage = o[CONFIG.STORAGEKEY] || {};
    storage.listings = storage.listings || [];
    observer();
  });

  $(cxt).on('storage.' + CONFIG.STORAGEKEY, function (evt, o) {
    $.extend(storage, o);
    if (storage.isDisabled !== true) {
      observer();
    }
  });
})(this, this['CONFIG'], this['common'], jQuery);
