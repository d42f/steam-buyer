;(function (cxt, $, undef) {
  angular.module('App', [])
  .factory('factoryName', function () {
      return {
          name: 'factoryName'
      };
  })
  .controller('AppCtrl', function ($scope, factoryName) {
    console.log('popup', new Date().getTime());

    $scope.items = [1, 2, 3, 4, 5];

    $(cxt).on('storage.keyname', function (evt, newValue, oldValue) {
      console.log('background.storage.keyname', newValue, oldValue);
    });
  });
})(this, jQuery);
