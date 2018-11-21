$(function() {
  Barba.Pjax.cacheEnabled = false;
  Barba.Prefetch.init();
  Barba.transitionLength = 250;
  Barba.Pjax.start();
  Barba.Dispatcher.on('newPageReady', function(currentStatus, oldStatus, container) {
    var js = container.querySelector("script");
    if (js != null) {
      eval(js.innerHTML);
    }
  });
  $('a').on('click', function(e){
    if($(this).attr('href') == window.location.pathname)
      if(!$(this).hasClass('navbar-brand'))
        e.preventDefault();
  });
});
