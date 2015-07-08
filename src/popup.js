;(function (cxt, CONFIG, common, $) {
  var background = chrome.extension.getBackgroundPage();
  cxt.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
    background.console.log(errorMsg, url, lineNumber);
  }

  angular.module('App', [])
  .filter('translate', function () {
    return common.translate;
  })
  .directive('translate', function () {
    return function (scope, el, attr) {
      el.text(common.translate(el.text()));
    };      
  })
  .directive('ngAnimateOnChange', function ($timeout) {
    return function (scope, el, attr) {
      scope.$on('$destroy', scope.$watch(attr.ngAnimateOnChange, function (nv, ov) {
        if (nv == ov) {
          return undefined;
        }
        el.addClass('ng-change');
        $timeout(function () {
          el.removeClass('ng-change');
        }, CONFIG.HIGHLIGHTTIMEOUT);
      }));
    };
  })
  .directive('ngOnlynumbers', function () {
    function onkeypress (evt) {
      if (evt.keyCode === 46) {
        if (String(evt.target.value).indexOf('.') !== -1) {
          evt.preventDefault();
        }
        return undefined;
      }
      if (evt.keyCode < 48 || evt.keyCode > 57) {
        evt.preventDefault();
      }
    }

    return function (scope, el, attr) {
      el.on('keypress', onkeypress);
      scope.$on('$destroy', function () {
        el.off('keypress', onkeypress);
      });
    };
  })
  .controller('AppCtrl', function ($scope, $interval, $timeout) {
    console.log('popup', new Date().getTime(), $scope);

    angular.extend($scope, {
      bg: {
        value: 0,
        interval: 0
      },
      forms: {},
      appendForm: undefined,
      observTimeouts: CONFIG.OBSERVTIMEOUTS
    });

    function saveStorage () {
      common.saveStorage($scope.storage);
    }

    function appendSteamListing (rsp) {
      var url = this.url,
          $page = $(rsp),
          $o = $page.find('.market_listing_row');
      if (!$o.length) {
        return undefined;
      }
      $timeout(function () {
        $scope.storage.listings.push(angular.extend({
          $id: new Date().getTime(),
          $timestamp: new Date().getTime(),
          url: url,
          thumbnail: $page.find('div.market_listing_largeimage:first img').attr('src') || undefined,
          title: $o.filter(':first').find('.market_listing_item_name:first').text() || url,
          price: undefined,
          price_label: ''
        }, common.getPrice($o[0], $o[1], $o[2])));
        saveStorage();
      });
    }      

    $scope.appendSteamListing = function (form) {
      if (form.$$buzy === true) {
        return undefined;
      }
      for (var i = $scope.storage.listings.length; i-- > 0;) {
        if ($scope.storage.listings[i].url === $scope.appendForm.url) {
          return undefined;
        }
      }
      form.$$buzy = true;
      $.ajax({url: $scope.appendForm.url, dataType: 'html'})
        .done(appendSteamListing)
        .fail(function () {
          console.log('ajax error');
        })
        .always(function () {
          form.$$buzy = false;
        })
      ;
    };

    $scope.updateSettings = function () {
      saveStorage();
    };

    $scope.changeItemMaxPrice = (function () {
      var timeout;
      return function (item) {
        if (!parseFloat(item.max_price)) {
          item.max_price = '';
        }
        clearTimeout(timeout);
        timeout = setTimeout(saveStorage, 1000);
      };
    })();

    $scope.remove = function (item) {
      var hasChanges = false;
      for (var i = $scope.storage.listings.length; i-- > 0;) {
        if ($scope.storage.listings[i].$id === item.$id) {
          hasChanges = true;
          $scope.storage.listings.splice(i, 1);
        }
      }
      if (hasChanges) {
        saveStorage();
      }
    };

    $scope.buy = function (item) {
      //
    };

    $scope.clear = function () {
      chrome.storage.sync.clear();
    };

    $scope.onUpdateConfig = function (evt, o) {
      $timeout(function () {
        common.extendStorage($scope.storage, o);
      });
    };

    $scope.onDevUpdate = function () {
      $scope.bg.value = background.$timestamp;
    };

    chrome.tabs.getSelected(null, function (tab) {
      $timeout(function () {
        $scope.tab = tab;
        $scope.appendForm = {
          url: undefined
        };
        var res = CONFIG.reML.exec(tab.url);
        if (res && res[1] && res[2]) {
          $scope.appendForm.url = 'http://steamcommunity.com/market/listings/' + res[1] + '/' + res[2];
        }
      });
    });

    chrome.storage.sync.get(CONFIG.STORAGEKEY, function (o) {
      $timeout(function () {
        $scope.storage = common.getStorage(o);
      });
    });

    $(cxt).on('storage.' + CONFIG.STORAGEKEY, $scope.onUpdateConfig);

    if (CONFIG.ISDEVMODE) {
      $scope.onDevUpdate();
      $scope.bg.interval = $interval($scope.onDevUpdate, 3000);
    }

    $scope.$on('$destroy', function () {
      $interval.cancel($scope.bg.interval);
      $(cxt).off('storage.' + CONFIG.STORAGEKEY, $scope.onUpdateConfig);
    });
  });
})(this, this['CONFIG'], this['common'], jQuery);
