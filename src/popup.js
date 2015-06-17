;(function (cxt, CONFIG, common, $) {
  var console = chrome.extension.getBackgroundPage().console;

  cxt.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
    console.log(errorMsg, url, lineNumber);
    return false;
  }

  angular.module('App', [])
  .factory('factoryName', function () {
      return {
          name: 'factoryName'
      };
  })
  .controller('AppCtrl', function ($scope, $timeout, factoryName) {
    console.log('popup', new Date().getTime(), $scope);

    angular.extend($scope, {
      forms: {},
      appendForm: undefined
    });

    function appendSteamListing (rsp) {
      var url = this.url,
          $o = $(rsp).find('.market_listing_row:first');
      if (!$o.length) {
        return undefined;
      }
      $timeout(function () {
        $scope.storage.listings.push({
          $id: new Date().getTime(),
          $timestamp: new Date().getTime(),
          url: url,
          title: $o.find('.market_listing_item_name:first').text() || url,
          thumbnail: $o.find('.market_listing_item_img:first').attr('src') || undefined,
          price: undefined,
          price_label: ''
        });
        common.saveStorage($scope.storage);
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

    $scope.toggle = function () {
      $scope.storage.isDisabled = !$scope.storage.isDisabled;
      common.saveStorage($scope.storage);
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

    //chrome.storage.sync.clear();
    chrome.storage.sync.get(CONFIG.STORAGEKEY, function (o) {
      o = o[CONFIG.STORAGEKEY] || {};
      o.listings = o.listings || [];
      $timeout(function () {
        $scope.storage = o;
      });
    });

    $(cxt).on('storage.' + CONFIG.STORAGEKEY, function (evt, o) {
      $timeout(function () {
        for (var j = $scope.storage.listings.length; j-- > 0;) {
          var listing = $scope.storage.listings[j];
          for (var i = o.listings.length; i-- > 0;) {
            if (listing.$id === o.listings[i].$id) {
              angular.extend(listing, o.listings[i]);
              break;
            }
          }
        }
      });
    });
  });
})(this, this['CONFIG'], this['common'], jQuery);
