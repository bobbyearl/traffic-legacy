!function($) {

  var players = {};
  var camera = [];
  var route = [
    {
      name: '526 E',
      camera: [
        { id: 60025 },
        { id: 60026 },
        { id: 60027 },
        { id: 60028 },
        { id: 60029 },
        { id: 60030 },
        { id: 60043 },
        // { id: 60044 }, Not working as of 2016-12-19
        { id: 60046 },
        { id: 60047 },
        { id: 60048 },
        { id: 60049 }
        // { id: 60050 } Not working as of 2016-12-19
      ]
    },
    {
      name: '526 W',
      camera: [
        { id: 60039 },
        { id: 60040 },
        { id: 60041 },
        { id: 60042 },
        { id: 60045 },
        { id: 60052 },
        { id: 60054 }
      ]
    },
    {
      name: '26 Outer',
      camera: [
        { id: 60002 },
        { id: 60003 },
        { id: 60004 },
        { id: 60005 },
        { id: 60006 },
        { id: 60007 },
        { id: 60008 },
        { id: 60096 },
        { id: 60097 }
      ]
    },
    {
      name: '26 Middle',
      camera: [
        { id: 60009 },
        { id: 60010 },
        { id: 60012 },
        // { id: 60013 }, Not working as of 2016-12-19
        { id: 60014 },
        { id: 60015 },
        { id: 60016 },
        { id: 60017 },
        { id: 60018 },
        { id: 60019 },
        { id: 60020 },
        { id: 60021 },
        { id: 60022 },
        { id: 60023 },
        { id: 60024 },
        { id: 60095 }
      ]
    },
    {
      name: '26 Inner',
      camera: [
        { id: 60031 },
        // { id: 60032 }, Not working as of 2016-12-19
        { id: 60033 },
        { id: 60034 },
        { id: 60036 },
        { id: 60037 },
        { id: 60038 },
        { id: 60058 },
        { id: 60060 },
        { id: 60061 },
        { id: 60062 },
        { id: 60063 }
      ]
    },
    {
      name: 'Bridge',
      camera: [
        { id: 60064 },
        { id: 60065 },
        { id: 60066 },
        { id: 60067 },
        { id: 60068 },
        { id: 60069 },
        { id: 60070 },
        { id: 60071 }
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

    $.getJSON('assets/data/cameras-2016-12-18.json', function(data) {

      data.features.forEach(function (feature) {
        if (feature.properties.region.indexOf('Charleston') > -1) {
          if (feature.properties.title.indexOf('I-26') > -1) {
          // console.log(feature.id + ': ' + feature.properties.region)
            console.log(feature.id + ': ' + feature.properties.title);
          }
        }
      });

      // Store all the cameras
      camera = data;

      // Build HTML
      $('.compiled').html(Handlebars.compile($('#template').html())({
        route: route,
        camera: camera
      }));

      $(document).on('click', '.toggle-camera-size', function (e) {
        e.preventDefault();
        setCameraSize();
        Cookies.set(
          'camera-size-small',
          $('.toggle-camera-size .fa').hasClass('fa-th-large'),
          { expires: 365 }
        );
      });

      // Read Camera Size Cookies
      if (Cookies.get('camera-size-small') === 'true') {
        setCameraSize();
      }

      // Load requested camera
      $('body').on('click', 'a[href^="#"][class!="toggle-camera-size"]', function(e) {

        // This stops the link from trying to go there in the DOM, but allows the URL to be updated
        e.stopPropagation();

        // location.hash hasn't changed yet
        updateView($(this).attr('href'));
      });

      // Close mobile menu on nav click
      var navMain = $(".navbar-collapse");
      navMain.on("click", "a:not([data-toggle])", null, function () {
        navMain.collapse('hide');
      });

      // Default entry point
      updateView(location.hash);

    });

    function setCameraSize() {
      console.log('Setting Camera Size');
      $('.col-camera').toggleClass('col-sm-4 col-sm-2');
      $('.toggle-camera-size .fa').toggleClass('fa-th fa-th-large');      
    }

    function updateView(hash) {

      // View enums + default view
      var ROUTE = '#route',
          CAMERA = '#camera',
          ADD = '#add',
          view = '',
          id = '';

      if (hash !== '') {
        var parts = hash.split('-');
        view = parts[0];
        if (parts.length == 2) {
          id = parts[1];
        }
      }

      // Memory leaks are no fun
      clearPlayers();

      // Switch tabs and show the correct view
      switch (view) {
        case ROUTE:
          showRoute(id);
          showTab(ROUTE + '-' + id);
        break;
        case CAMERA:
          if (id !== '') {
            showCamera(id);
          }
          showTab(CAMERA);
        break;
        default:
          showTab(ADD);
        break;
      }
    }

    function showTab(hash) {
      $('a[href="' + hash + '"]').tab('show');
    }

    function showCamera(id) {
      setupPlayer('player', getCameraById(id).properties);
      $('#camera li').removeClass('active');
      $('a[href="#camera-' + id + '"]').closest('li').addClass('active');
    }

    function getCameraById(id) {
      for (var i = 0, j = camera.features.length; i < j; i++) {
        if (camera.features[i].id === id.toString()) {
          return camera.features[i];
        }
      }
    }

    function showRoute(index) {
      for (var i = 0, j = route[index].camera.length; i < j; i++) {
        setupPlayer('route-' + index + '-camera-' + i, getCameraById(route[index].camera[i].id).properties);
      }
    }

    function setupPlayer(selector, properties) {
      $('#' + selector + '-desc').html(properties.title);
      players[selector] = jwplayer(selector).setup({
        autostart: true,
        stretching: 'fill',
        width: '100%',
        aspectratio: '4:3',
        controls: false,
        playlist: [{
          sources: [
            { file: properties.rtmp_url },
            { file: properties.http_url }
          ]
        }]
      });
    }

    function clearPlayers() {
      for (var id in players) {
        players[id].remove();
      }
    }

  });
}(jQuery);
