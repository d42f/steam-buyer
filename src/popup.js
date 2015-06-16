;(function (cxt, $) {
  var reMarketListings = /\/market\/listings\/([\d]+)\/([\d\w\%]+)/,
      console = chrome.extension.getBackgroundPage().console;

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

    chrome.tabs.getSelected(null, function (tab) {
      $timeout(function () {
        $scope.tab = tab;
        $scope.appendForm = {
          url: undefined
        };
        var res = reMarketListings.exec(tab.url);
        if (res && res[1] && res[2]) {
          $scope.appendForm.url = 'http://steamcommunity.com/market/listings/' + res[1] + '/' + res[2];
        }
      });
    });

    //chrome.storage.sync.clear();
    chrome.storage.sync.get('steam-buyer', function (o) {
      o = o['steam-buyer'] || {};
      o.listings = o.listings || [];
      $timeout(function () {
        $scope.storage = o;
      });
    });

    function appendSteamListing (rsp) {
      var url = this.url,
          $o = $(rsp).find('.market_listing_row:first');
      if (!$o.length) {
        return undefined;
      }
      $timeout(function () {
        $scope.storage.listings.push({
          url: url,
          title: $o.find('.market_listing_item_name:first').text() || url,
          thumbnail: $o.find('.market_listing_item_img:first').attr('src') || undefined
        });
        chrome.storage.sync.set({'steam-buyer': $scope.storage});
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
        });
    };

    $(cxt).on('storage.steam-buyer', function (evt, newValue, oldValue) {
      console.log('popup.storage.steam-buyer', newValue, oldValue);
    });
  });
})(this, jQuery);
