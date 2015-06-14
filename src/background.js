;(function (cxt, $, undef) {
  console.log('background', new Date().getTime());

  $(cxt).on('storage.keyname', function (evt, newValue, oldValue) {
    console.log('background.storage.keyname', newValue, oldValue);
  });
})(this, jQuery);
