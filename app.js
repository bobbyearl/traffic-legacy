!function($) {
  $(function() {
    
    var route = [
      { index: 307 }, 
      { index: 308 }, 
      { index: 309 },
      { index: 313 },
      { index: 319 },
      { index: 310 },
      { index: 311 },
      { index: 312 },
      // { index: 314 },
      { index: 293 },
      { index: 294 },
      { index: 295 },
      { index: 296 },
      { index: 297 },
      { index: 298 },
      { index: 315 },
      { index: 316 }
    ];
    
    $.getJSON('cameras-2014-10-01.json', function(data) {
      
      Handlebars.registerHelper('if_eq', function(a, b, opts) {
        return a == b ? opts.fn(this) : opts.inverse(this);
      });
      
      // Reverse route in afternoon
      if ( (new Date()).getHours() > 12) {
        route.reverse();
      }
      
      // Find route
      for ( var i = 0, j = route.length; i < j; i++) {
        route[i].feature = data.features[route[i].index];
      }
      
      // Build route
      $('.compiled-routes').html(Handlebars.compile($('#template-route').html())(route));
      
      // Initialize route video
      for (var i = 0, j = route.length; i < j; i++) {
        jwplayer('route-' + i).setup({
          autostart: true,
          stretching: 'fill',
          width: '100%',
          aspectratio: '4:3',
          playlist: [{
            sources: [
              { file: route[i].feature.properties.rtmp_url },
              { file: route[i].feature.properties.http_url }
            ]
          }]
        })
      }
      
      // Build camera list
      $('.compiled-cameras').html(Handlebars.compile($('#template-cameras').html())(data));      
      
      // Load requested camera
      $('.camera').click(function(e) {
        e.stopPropagation();
        var p = data.features[$(this).data('index')].properties;
        jwplayer('player').setup({
          autostart: true,
          stretching: 'fill',
          width: '100%',
          aspectratio: '4:3',
          playlist: [{
            sources: [
              { file: p.rtmp_url },
              { file: p.http_url }
            ]
          }]
        });
      });
      
    });
    
  });
}(jQuery);
