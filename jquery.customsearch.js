/**
 * jquery.customsearch plugin
 **/

(function($){

  var

  options,
  timeout;

  // API: main init function
  $.customsearch = function(in_options) {

    // default options
    options = $.extend({
      google_key: "",
      google_cx: "",
      query: "#query",
      message: "#message",
      results: "#results",
      more: "#more",
      not_found: "No results found",
      on_input: function(query){},
      on_query: function(query){},
      on_render: function(results, item){
          results.append('<div>' + item.title + '</div>');
        },
      on_message: function(message){
          $(options.message).html(message).toggle(message != null);
        },
      on_results: function(showing, total) {
          $(options.results).toggle(showing > 0);
          $(options.more).text(showing + '/' + total).toggle(showing < total);
        },
    }, in_options);

    // API: clear search
    arguments.callee.clear = function() {
      clearTimeout(timeout);
      $(options.query).val('');
      $(options.results).empty();
      options.on_message(null);
      options.on_results(0, 0);
      options.on_input('');
    };

    $(document).ready(_init);

    return this;

    function _init() {
      $(options.message).hide();
      $(options.results).hide();
      $(options.more).hide();
      $(options.query).keyup(function(){
        options.on_input(query);
        clearTimeout(timeout);
        timeout = setTimeout(function(){
          var query = $(options.query).val();
          if (query != '') {
            $(options.results).empty();
            _search(query, 1);
          } else {
            options.on_message(null);
            options.on_results(0, 0);
            options.on_input('');
          }
        }, 600);
      });
    }

    function _search(query, start) {

      var

      key = options.google_key,
      cx = options.google_cx,
      url = 'https://www.googleapis.com/customsearch/v1'
          + '?key=' + key
          + '&cx=' + cx
          + '&q=' + encodeURIComponent(query)
          + '&start=' + encodeURIComponent(start)
          + '&callback=?';

      options.on_query(query);

      $.getJSON(url, function(response) {

        if (query != $(options.query).val()) {
          return;
        }

        if (typeof response.items != 'undefined' && response.items.length > 0) {

          var results = $(options.results);
          $.each(response.items, function(index, item){
            options.on_render(results, item);
          });

          var count = response.queries.request[0].count;
          var total = response.queries.request[0].totalResults;

          $(options.more).unbind('click.more');
          $(options.more).bind('click.more', function(){
            start += count;
            _search(query, start);
          });

          var showing = (start + count - 1);

          options.on_message(null);
          options.on_results(showing, total);

        } else {

          var message;

          if (typeof response.error != 'undefined' && typeof response.error.errors != 'undefined' && error.errors.length > 0) {
            message = response.error.errors[0].message;
          } else {
            message = options.not_found;
          }

          options.on_message(message);
          options.on_results(0, 0);
        }
      });
    }

  };

})(jQuery);