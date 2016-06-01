'use strict';

/**
 * @ngdoc overview
 * @name oblivionApp
 * @description
 * # oblivionApp
 *
 * Main module of the application.
 */
angular
  .module('oblivionApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'appServices',
    'updateMeta',
    'djds4rce.angular-socialshare'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/start.html'
        //controller: 'MainCtrl'
      })
      .when('/vote', {
        templateUrl: 'views/vote.html'
        //controller: 'MainCtrl'
      })
      .when('/create', {
        templateUrl: 'views/create.html'
        //controller: 'CreateController',
        //controllerAs:'create'
      })
      .when('/user/:userid', {
        templateUrl: 'views/user.html'
        //controller: 'CreateController'
      })
      .when('/share/:userid', {
        templateUrl: 'views/share.html',
        //controller: 'CreateController'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
 .run(function($FB){
  $FB.init('1029741847095272');
});
