define(['jquery', 'angular', 'magnificPopup'], function ($, angular) {

  $.fn.scrollTo = function( target, options, callback ){
    if(typeof options == "function" && arguments.length == 2){ callback = options; options = target; }
    var settings = $.extend({
      scrollTarget  : target,
      offsetTop     : 50,
      duration      : 500,
      easing        : "swing"
    }, options);
    return this.each(function(){
      var scrollPane = $(this);
      var scrollTarget = (typeof settings.scrollTarget == "number") ? settings.scrollTarget : $(settings.scrollTarget);
      var scrollY = (typeof scrollTarget == "number") ? scrollTarget : scrollTarget.offset().top + scrollPane.scrollTop() - parseInt(settings.offsetTop);
      scrollPane.animate({scrollTop : scrollY }, parseInt(settings.duration), settings.easing, function(){
        if (typeof callback == "function") { callback.call(this); }
      });
    });
  };

  angular.module("app", []).controller("main", function ($scope) {

    var vm = $scope;

    vm.getDate = function (date) {
      var d = new Date(date);
      return d.toLocaleDateString();
    };

    vm.getVideos = function (map) {
      var d = $.Deferred(), l = [], count = 0;

      var query = map.nom.toLowerCase().replace(/[^a-z0-9]/g, "");

      $.each(vm.channels, function(index, channel) {
        $.getJSON("https://www.googleapis.com/youtube/v3/search?key=AIzaSyCHKe5NSr4dpxpelHn4rP359-R3TluG2XM&channelId=" + channel.id + "&part=snippet,id&maxResults=2&alt=json&orderby=relevance&q=" + query,
                  function(data) {
          var videos = data.items;
          $.each(videos, function(k, v) {
            var id = v.id.videoId, title = v.snippet.title;
            if(title.length >= 42) {
              title = title.substring(0, 39) + '...';
            }
            if(id !== undefined && title.replace(" ", "").toLowerCase().indexOf(query) > -1) {
              l.push({id: id, title: title});
            }
          });
          count += 1;
          if(count >= vm.channels.length) {
            map.videos = l;
            d.resolve(l);
          }
        }
                 );
      });  
      return d.promise();
    };

    vm.getSize = function (map) {
      return Math.round(map.size / (1024*1024));
    };

    vm.selectMap = function (map) {
      vm.tab = 2;
      vm.selectedMap = map;      
      setTimeout(function () {
        $("body").scrollTo(0);      
        $('.list-group').scrollTo('#' + map.id, {offsetTop: $(document).height()-$('.list-group').height()/1.6});
      }, 0);
      map.videos = undefined;    
      if (map.videos === undefined) {
        vm.getVideos(map).then(function () {          
          vm.$apply();
          $(".video").magnificPopup({type: "iframe"});          
        });
      }
    };

    vm.maps = [];

    vm.channels = [];

    $.getJSON("data/maps.json", function(data) {
      vm.maps = data.maps;
      vm.$apply();
    });

    $.getJSON("data/channels.json", function(data) {
      vm.channels = data;
      vm.$apply();
    });
  });

  angular.bootstrap(document, ["app"]);

});