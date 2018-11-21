$(function() {
  $('.dropdown').on('show.bs.dropdown', function() {
    $(this).find('.dropdown-menu').first().stop(true, true).slideDown('fast');
  });
  $('.dropdown').on('hide.bs.dropdown', function() {
    $(this).find('.dropdown-menu').first().stop(true, true).slideUp('fast');
  });

  //NAV BAR collapse
  var c, currentScrollTop = 0,
    autocomplete = $('#search-autocomplete'),
    navbar = $('nav');
  $(window).scroll(function() {
    var a = $(window).scrollTop();
    var b = navbar.height();
    currentScrollTop = a;

    if (c < currentScrollTop && a > b + b) {
      navbar.addClass("scrollUp");
      autocomplete.slideUp();
      if ($('.dropdown-menu').hasClass('show'))
        $('.dropdown-menu').dropdown('toggle');
    } else if ((c - 13 > currentScrollTop && !(a <= b)) || a <= b) {
      navbar.removeClass("scrollUp");
    }
    c = currentScrollTop;
  });
});
