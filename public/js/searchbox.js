$(function() {

  var searchbox = $('#search'),
    autocomplete = $('#search-autocomplete'),
    spinner = $('.search-load', autocomplete),
    noResults = $('.no-results', autocomplete),
    error = $('.error', autocomplete);

  var currentOffset = 0,
    searchUrl = '/',
    lastSearch = '',
    searchTimeout = 0.2,
    searchTimer;


  function loadData() {

    lastSearch = searchbox.val();

    var questOBJ = {
      'search': lastSearch,
      'start': currentOffset
    }
    $.ajax({
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json',
      url: searchUrl,
      data: questOBJ,
      success: function(data) {
        if (data.length > 0)
          $.each(data, function(i, user) {
            $('#alan').prepend('<li id="result" class="search-result"><a href="/user/' + user._id + '">' + '<img class="rounded-circle special-img mr-3" src="/' + user.profileImage + '"/>' + user.email + '<span class="search-description">' + user.createdAt +
              '</span></a></li>')
          })
        else {
          noResults.show();
          error.hide();
        }
        spinner.hide();
        currentOffset++;
      }
    });
    //end of AJAX request
  }
  //end of loadData function
  searchbox.on('focus', function() {
      if ($(this).val().length > 0) {
        autocomplete.slideDown('fast');
      }
    }).on('input propertychange paste', function() {
      //this will handle pasting text and clearing text with browser built in clear button
      $(this).trigger('keyup');
    }).on('keydown', function() {
      clearTimeout(searchTimer);
    })
    .on('keyup', function(e) {
      if (e.keyCode == 38) {
        autocomplete.focus();
        return false;
      }
      if (e.keyCode == 40) {
        autocomplete.children().focus()
        return false;
      }
      $('.search-result', autocomplete).remove();
      noResults.hide();
      error.hide();
      spinner.show();
      if ($(this).val().length > 0) {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(loadData, searchTimeout * 1000);
        autocomplete.slideDown('fast');
      } else {
        clearTimeout(searchTimer);
        autocomplete.slideUp('fast');
      }
    });

  $(document).on('click', function(e) {
    //click anywhere outside searchbox to close
    if (!$(e.target).closest('input[type=search]').length) {
      if (autocomplete.is(':visible')) {
        autocomplete.slideUp('fast');
        clearTimeout(searchTimer);
      }
    }
  });
  autocomplete.css('top', ((searchbox.outerHeight() + 12)) + 'px');
  noResults.hide();
  error.hide();

});
