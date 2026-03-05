(function () {
  'use strict';

  const app = angular.module('adminFashion', ['ngRoute', 'ngSanitize']);

  app.constant('API_BASE', 'http://localhost:4000/api/fashions');

  app.config([
    '$routeProvider',
    function ($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'list.html',
          controller: 'ListCtrl',
        })
        .when('/new', {
          templateUrl: 'form.html',
          controller: 'FormCtrl',
        })
        .when('/edit/:id', {
          templateUrl: 'form.html',
          controller: 'FormCtrl',
        })
        .when('/view/:id', {
          templateUrl: 'view.html',
          controller: 'ViewCtrl',
        })
        .otherwise({
          redirectTo: '/',
        });
    },
  ]);

  app.directive('quillEditor', [
    function () {
      return {
        restrict: 'E',
        require: 'ngModel',
        template: '<div class="quill-editor"></div>',
        replace: true,
        link: function (scope, element, attrs, ngModel) {
          const quill = new Quill(element[0], {
            theme: 'snow',
            placeholder: 'Write fashion details here...',
          });

          ngModel.$render = function () {
            const value = ngModel.$viewValue || '';
            if (quill.root.innerHTML !== value) {
              quill.root.innerHTML = value;
            }
          };

          quill.on('text-change', function () {
            scope.$evalAsync(function () {
              ngModel.$setViewValue(quill.root.innerHTML);
            });
          });
        },
      };
    },
  ]);

  app.controller('ListCtrl', [
    '$scope',
    '$http',
    'API_BASE',
    function ($scope, $http, API_BASE) {
      $scope.loading = true;
      $scope.error = '';
      $scope.fashions = [];

      $scope.load = function () {
        $scope.loading = true;
        $scope.error = '';
        $http
          .get(API_BASE)
          .then(function (response) {
            $scope.fashions = response.data;
          })
          .catch(function (error) {
            $scope.error = error.data && error.data.message ? error.data.message : 'Failed to load fashions.';
          })
          .finally(function () {
            $scope.loading = false;
          });
      };

      $scope.deleteFashion = function (fashion) {
        if (!confirm(`Delete "${fashion.title}"?`)) {
          return;
        }

        $http
          .delete(`${API_BASE}/${fashion._id}`)
          .then(function () {
            $scope.load();
          })
          .catch(function (error) {
            $scope.error = error.data && error.data.message ? error.data.message : 'Delete failed.';
          });
      };

      $scope.load();
    },
  ]);

  app.controller('FormCtrl', [
    '$scope',
    '$http',
    '$routeParams',
    '$location',
    'API_BASE',
    function ($scope, $http, $routeParams, $location, API_BASE) {
      $scope.isEdit = Boolean($routeParams.id);
      $scope.loading = false;
      $scope.error = '';
      $scope.fashion = {
        title: '',
        style: 'Streetwear',
        thumbnail: '',
        details: '',
      };

      if ($scope.isEdit) {
        $scope.loading = true;
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
      }

      $scope.save = function () {
        $scope.loading = true;
        $scope.error = '';

        const payload = {
          title: $scope.fashion.title,
          style: $scope.fashion.style,
          thumbnail: $scope.fashion.thumbnail,
          details: $scope.fashion.details,
        };

        const request = $scope.isEdit
          ? $http.put(`${API_BASE}/${$routeParams.id}`, payload)
          : $http.post(API_BASE, payload);

        request
          .then(function () {
            $location.path('/');
          })
          .catch(function (error) {
            $scope.error = error.data && error.data.message ? error.data.message : 'Save failed.';
          })
          .finally(function () {
            $scope.loading = false;
          });
      };

      $scope.cancel = function () {
        $location.path('/');
      };
    },
  ]);

  app.controller('ViewCtrl', [
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