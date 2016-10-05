!function($) {

  var players = {};
  var camera = [];
  var route = [
    {
      name: 'I-26 (220 - 213)',
      camera: [
        { id: 60063 },
        { id: 60062 },
        { id: 60061 },
        { id: 60060 },
        { id: 60059 },
        { id: 60074 },
        { id: 60035 },
        { id: 60034 },
        { id: 60033 },
        { id: 60032 },
        { id: 60031 },
        { id: 60038 }
      ]
    },
    {
      name: 'I-26 (212 - 210)',
      camera: [
        { id: 60023 },
        { id: 60037 },
        { id: 60036 },
        { id: 60024 },
        { id: 60021 },
        { id: 60020 },
        { id: 60019 },
        { id: 60018 },
        { id: 60017 },
        { id: 60016 },
        { id: 60015 },
        { id: 60014 },
      ]
    },
    {
      name: 'I-26 (210 - 199)',
      camera: [
        { id: 60013 },
        { id: 60095 },
        { id: 60012 },
        { id: 60010 },
        { id: 60009 },
        { id: 60008 },
        { id: 60007 },
        { id: 60006 },
        { id: 60005 },
        { id: 60096 },
        { id: 60002 }
      ]
    },
    {
      name: 'I-26 at I-95',
      camera: [
        { id: 10101 },
        { id: 10102 },
        { id: 10104 },
        { id: 10105 },
        { id: 10106 },
        { id: 10108 },
        { id: 10100 },
        { id: 10099 },
        { id: 10098 },
        { id: 10097 },
        { id: 10096 }
      ]
    },
    {
      name: 'I-26 (117 - 109)',
      camera: [
        { id: 10019 },
        { id: 10018 },
        { id: 10039 },
        { id: 10038 },
        { id: 10036 },
        { id: 10035 },
        { id: 10034 },
        { id: 10033 },
        { id: 10015 },
        { id: 10030 }
      ]
    },
    {
      name: 'I-77',
      camera: [
        { id: 10020 },
        { id: 10122 },
        { id: 10121 },
        { id: 10120 },
        { id: 10119 },
        { id: 10118 },
        { id: 10117 },
        { id: 10116 },
        { id: 10115 },
        { id: 10114 }
      ]
    },
    /*
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
    */
  ];

  $(function() {

    Handlebars.registerHelper('if_eq', function(a, b, opts) {
      return a == b ? opts.fn(this) : opts.inverse(this);
    });

    Handlebars.registerHelper('mod', function(i, n, r, opts) {
      return parseInt(i) % n == r ? opts.fn(this) : opts.inverse(this);
    });

    $.getJSON('assets/data/cameras-2016-05-05.json', function(data) {

      // Store all the cameras
      camera = data;

      // Reverse route in afternoon
      // if ((new Date()).getHours() > 12) {
      //   for (var i = 0, j = route.length; i < j; i++) {
      //     route[i].camera.reverse();
      //   }
      // }

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

      if (hash !== '') {
        var parts = hash.split('-');
        view = parts[0];
        if (parts.length == 2) {
          index = parseInt(parts[1]);
          indexSet = true;
        }
      }

      // Memory leaks are no fun
      clearPlayers();

      // Switch tabs and show the correct view
      switch (view) {
        // case ROUTE:
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

    function getIndexById(id) {
      for (var i = 0, j = camera.features.length; i < j; i++) {
        if (camera.features[i].id === id.toString()) {
          return i;
        }
      }
    }

    function showRoute(index) {
      for (var i = 0, j = route[index].camera.length; i < j; i++) {
        var k = route[index].camera[i].index ? route[index].camera[i].index : getIndexById(route[index].camera[i].id);
        setupPlayer('route-' + index + '-camera-' + i, camera.features[k].properties);
      }
    }

    function setupPlayer(selector, properties) {
      $('#' + selector + '-desc').html(properties.title);
      players[selector] = jwplayer(selector).setup({
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

    function clearPlayers() {
      for (var id in players) {
        players[id].remove();
      }
    }

  });
}(jQuery);
