// Load modules
require.config({
  baseUrl: 'js',	
  paths: {
    angular: 'lib/angular.min',
    jquery: 'lib/jquery.min',
    magnificPopup: 'lib/jquery.magnific-popup.min'
  },
  shim: {
    "angular": {
      exports: 'angular'
    }
  },
  deps: ['app']
});