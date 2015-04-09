!function($) {
  
  var camera = [];
  var route = [
    {
      name: 'West Ashley',
      camera: [
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
      ]
    },
    {
      name: 'Ravenel Bridge',
      camera: [
        { index: 326 },
        { index: 327 },
        { index: 328 },
        { index: 329 },
        { index: 330 },
        { index: 331 },
        { index: 332 },
        { index: 333 },
        { index: 334 },
      ]
    }
  ];
  
  $(function() {
    
    Handlebars.registerHelper('if_eq', function(a, b, opts) {
      return a == b ? opts.fn(this) : opts.inverse(this);
    });

    Handlebars.registerHelper('mod', function(i, n, r, opts) {
      return parseInt(i) % n == r ? opts.fn(this) : opts.inverse(this);
    });
    
    $.getJSON('assets/data/cameras-2014-10-01.json', function(data) {
      
      // Store all the cameras
      camera = data;
      
      // Reverse route in afternoon
      if ((new Date()).getHours() > 12) {
        for (var i = 0, j = route.length; i < j; i++) {
          route[i].camera.reverse();  
        }        
      }
      
      // Build HTML
      $('.compiled').html(Handlebars.compile($('#template').html())({
        route: route,
        camera: camera
      }));
      
      // Load requested camera
      $('body').on('click', 'a[href^="#"]', function(e) {
        
        // This stops the link from trying to go there in the DOM, but allows the URL to be updated
        e.stopPropagation();
        
        // location.hash hasn't changed yet
        updateView($(this).attr('href'));
      });
      
      // Default entry point
      updateView(location.hash);
      
    });
    
    function updateView(hash) {
      
      // View enums + default view
      var ROUTE = '#route',
          CAMERA = '#camera',
          ADD = '#add',
          view = ROUTE,
          index = 0,
          indexSet = false;
      
      if (hash != '') {
        var parts = hash.split('-');
        view = parts[0];        
        if (parts.length == 2) {
          index = parseInt(parts[1]);
          indexSet = true;
        }
      }
      
      // Switch tabs and show the correct view
      switch (view) {
        case ROUTE:
        default:          
          showRoute(index);
          showTab(ROUTE + '-' + index);
        break;
        case ADD:
          showTab(ADD);
        break;
        case CAMERA:
          if (indexSet) {
            showCamera(index);
          }
          showTab(CAMERA);
        break;
      }
    }
    
    function showTab(hash) {
      $('a[href="' + hash + '"]').tab('show');
    }
    
    function showCamera(index) {
      setupPlayer('player', camera.features[index].properties);
      $('#camera li').removeClass('active');
      $('a[href="#camera-' + index + '"]').closest('li').addClass('active');
    }
    
    function showRoute(index) {
      for (var i = 0, j = route[index].camera.length; i < j; i++) {
        setupPlayer('route-' + index + '-camera-' + i, camera.features[route[index].camera[i].index].properties);
      }
    }
    
    function setupPlayer(selector, properties) {
      jwplayer(selector).setup({
        autostart: true,
        stretching: 'fill',
        width: '100%',
        aspectratio: '4:3',
        playlist: [{
          sources: [
            { file: properties.rtmp_url },
            { file: properties.http_url }
          ]
        }]
      });
    }
    
  });
}(jQuery);
