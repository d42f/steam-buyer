;(function (cxt, CONFIG, $) {
  var notifications = {};
  var common = {
    showNotification: function (item) {
      if (notifications[item.$id]) {
        return undefined;
      }
      notifications[item.$id] = new Notification('Steam Buyer', {
        icon: item.thumbnail,
        body: 'Hey! Current price ' + item.price_label
      });
      $.extend(notifications[item.$id], {
        onclick: function () {
          window.open(item.url);
        },
        onclose: function () {
          notifications[item.$id] = undefined;
        }
      });
    },
    hideNotification: function (item) {
      if (!notifications[item.$id]) {
        return undefined;
      }
      notifications[item.$id].close();
      notifications[item.$id] = undefined;
    },
    extendStorage: function (storage, o) {
      for (var key in o) {
        if (!o.hasOwnProperty(key)) {
          continue;
        }
        if ($.isArray(o[key])) {
          storage[key] = $.isArray(storage[key]) ? storage[key] : [];
          var a1 = storage[key], a2 = o[key], i, j;
          for (j = a2.length; j-- > 0;) {
            for (i = a1.length; i-- > 0;) {
              if (a1[i].$id === a2[j].$id) {
                $.extend(a1[i], a2[j]);
                break;
              }
            }
            if (i === -1) {
              a1.push(a2[j]);
            }
          }
          for (j = a1.length; j-- > 0;) {
            for (i = a2.length; i-- > 0;) {
              if (a2[i].$id === a1[j].$id) {
                break;
              }
            }
            if (i === -1) {
              a1.splice(j, 1);
            }
          }
          continue;
        }
        if (typeof o[key] === 'string' && isFinite(+o[key])) {
          storage[key] = +o[key];
          continue;
        }
        storage[key] = o[key];
      }
    },
    getStorage: function (storage) {
      storage = storage ? storage[CONFIG.STORAGEKEY] || {} : {};
      storage.listings = storage.listings || [];
      storage.observTimeout = isFinite(+storage.observTimeout) ? +storage.observTimeout : CONFIG.OBSERVTIMEOUTDEFAULT;
      storage.showNotifications = typeof storage.showNotifications === 'boolean' ? storage.showNotifications : true;
      return storage;
    },
    saveStorage: function (storage) {
      var data = {};
      data[CONFIG.STORAGEKEY] = storage;
      chrome.storage.sync.set(data);
    },
    getPrice: function () {
      var vals, valn;
      for (var i = 0, n = arguments.length; i < n; i++) {
        if (valn) {
          break;
        }
        vals = $(arguments[i]).find('span.market_listing_price:first').text();
        valn = parseFloat(vals.replace(',', '.'));
      }
      return {
        price: valn || undefined,
        price_label: valn ? vals.replace(/[\n\s]+/g, '') : ''
      };
    },
    checkPrice: function (listings) {
      listings = $.isArray(listings) ? listings : [listings];
      for (var i = 0, n = listings.length; i < n; i++) {
        var item = listings[i];
        if (item.price && +item.price <= +item.max_price) {
          common.showNotification(item);
        } else {
          common.hideNotification(item);
        }
      }
    }
  };
  cxt['common'] = common;
})(this, this['CONFIG'], jQuery);
