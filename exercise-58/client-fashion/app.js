(function () {
  'use strict';

  const app = angular.module('clientFashion', ['ngRoute', 'ngSanitize']);

  app.constant('API_BASE', 'http://localhost:4000/api/fashions');

  app.config([
    '$routeProvider',
    function ($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'home.html',
          controller: 'HomeCtrl',
        })
        .when('/fashion/:id', {
          templateUrl: 'detail.html',
          controller: 'DetailCtrl',
        })
        .otherwise({
          redirectTo: '/',
        });
    },
  ]);

  app.controller('HomeCtrl', [
    '$scope',
    '$http',
    'API_BASE',
    function ($scope, $http, API_BASE) {
      $scope.loading = true;
      $scope.error = '';
      $scope.fashions = [];
      $scope.grouped = {};
      $scope.groupOrder = [];
      $scope.styleQuery = '';
      $scope.styleSelect = '';
      $scope.styles = ['Streetwear', 'Minimalist', 'Vintage'];

      function buildGroups(list) {
        const groups = list.reduce((acc, item) => {
          if (!acc[item.style]) {
            acc[item.style] = [];
          }
          acc[item.style].push(item);
          return acc;
        }, {});

        const knownOrder = $scope.styles.filter((style) => groups[style]);
        const other = Object.keys(groups)
          .filter((style) => !knownOrder.includes(style))
          .sort();

        $scope.groupOrder = knownOrder.concat(other);
        $scope.grouped = groups;
      }

      function applyFilter() {
        const query = ($scope.styleQuery || '').trim().toLowerCase();
        const selected = ($scope.styleSelect || '').trim().toLowerCase();
        const filterValue = selected || query;

        const filtered = filterValue
          ? $scope.fashions.filter((item) => item.style.toLowerCase().includes(filterValue))
          : $scope.fashions;

        buildGroups(filtered);
      }

      $scope.$watchGroup(['styleQuery', 'styleSelect'], applyFilter);

      $scope.clearFilter = function () {
        $scope.styleQuery = '';
        $scope.styleSelect = '';
      };

      $http
        .get(API_BASE)
        .then(function (response) {
          $scope.fashions = response.data;
          const stylesFromData = Array.from(
            new Set($scope.fashions.map((item) => item.style).filter(Boolean))
          );
          if (stylesFromData.length) {
            $scope.styles = Array.from(new Set($scope.styles.concat(stylesFromData)));
          }
          applyFilter();
        })
        .catch(function (error) {
          $scope.error = error.data && error.data.message ? error.data.message : 'Failed to load fashions.';
        })
        .finally(function () {
          $scope.loading = false;
        });
    },
  ]);

  app.controller('DetailCtrl', [
    '$scope',
    '$http',
    '$routeParams',
    'API_BASE',
    function ($scope, $http, $routeParams, API_BASE) {
      $scope.loading = true;
      $scope.error = '';
      $scope.fashion = null;

      $http
        .get(`${API_BASE}/${$routeParams.id}`)
        .then(function (response) {
          $scope.fashion = response.data;
        })
        .catch(function (error) {
          $scope.error = error.data && error.data.message ? error.data.message : 'Failed to load fashion.';
        })
        .finally(function () {
          $scope.loading = false;
        });
    },
  ]);
})();