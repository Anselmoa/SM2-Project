"use strict";
angular
    .module('myApp', ['auth0', 'angular-storage', 'angular-jwt', 'ui.router'])

/*============== Controllers ================*/

.controller('homeCtrl', ['$scope', '$location', '$rootScope', function($scope, $location, $rootScope) {
    $rootScope.location = $location.path();
    console.log($scope.location);
}])


// Controller to user.tpl.html (All Users)
.controller('usersCtrl', ['$scope', '$rootScope', '$http',
    function($scope, $rootScope, $http) {
        console.log($rootScope.inCourse);
        $http.get('http://localhost:3001/api/users')
            .success(function(data, status, header, config) {
                $scope.users = data;
                console.log(data);
            });
    }
])

// Controller to user_new.tpl.html (Create a user)
.controller('userNewCtrl', ['$scope', '$http',
        function($scope, $http) {
            $scope.submit = function() {

                var newUser = {
                    profileName: $scope.profileName
                };

                $http.post('http://localhost:3001/api/users', newUser)
                    .success(function(data, status, header, config) {
                        $scope.message = data.message;
                        console.log(data);
                        console.log(header);
                        console.log(config);
                    });

                $scope.profileName = '';
            }
        }
    ]) // end Controller to user_new.tpl.html (Create a user)


.controller('userRemoveCtrl', ['$scope', '$http', '$location', '$stateParams',
    function($scope, $http, $location, $stateParams) {

        $http.delete('http://localhost:3001/api/users/' + $stateParams.id)
            .success(function(data, status, header, config) {
                $location.path('/users');
            })
    }
])


.controller('userRegisterCourseCtrl', ['$scope', '$http', '$location', '$stateParams',
    function($scope, $http, $location, $stateParams) {

    }
])

.controller('coursesCtrl', ['$rootScope', '$location', '$http', 'store', function($rootScope, $location, $http, store) {
    $rootScope.location = $location.path();

    $rootScope.registerOnCourse = function() {

        var updatedUser = {
            isRegistedCourse: true
        };

        $http.put('http://localhost:3001/api/users/' + $rootScope.profile.identities[0].user_id, updatedUser)
            .success(function(data, status, header, config) {
                $http.get('http://localhost:3001/api/users/' + $rootScope.profile.identities[0].user_id)
                    .success(function(data, status, header, config) {
                        store.set('isRegistedCourse', data[0].isRegistedCourse);
                        $rootScope.isRegistedCourse = store.get('isRegistedCourse');
                        console.log(data[0].isRegistedCourse);
                        console.log(config);
                    })
               })
            .error(function(data, status, headers, config) {
                // data is always undefined here when there is an error
                console.error('Error fetching feed:', data);
            })

    }
}])



/*============== Config ================*/
.config(function($provide, authProvider, $urlRouterProvider, $stateProvider, $httpProvider, jwtInterceptorProvider) {

        //Auth0 inicial Values|Configurations
        authProvider.init({
            domain: 'fabioanselmo.eu.auth0.com',
            clientID: 'tBojVxtAQCzy3jnYAKIRD5gbMh9SrUqP'
        });

        /*============== Get Token ================*/
        jwtInterceptorProvider.tokenGetter = function(store) {
            return store.get('id_token');
        };

        /*============== Routes and Redirect(erro) ================*/
        $urlRouterProvider.otherwise('/users');

        $stateProvider
            .state("home", {
                url: '/home',
                templateUrl: 'public/tpl/home/home.tpl.html',
                controller: 'homeCtrl'
            })
            .state('users', {
                url: '/users',
                templateUrl: 'public/tpl/users/users.tpl.html',
                controller: 'usersCtrl'
            })
            .state('newUser', {
                url: '/user_new',
                templateUrl: 'public/tpl/user_new/user_new.tpl.html',
                controller: 'userNewCtrl'
            })
            .state('removeUser', {
                url: '/user_remove/:id',
                template: 'ok',
                controller: 'userRemoveCtrl'
            })
            .state('registerUser', {
                url: '/user_register/:id',
                template: 'Updated',
                controller: 'userRegisterCourseCtrl'
            })
            .state('courses', {
                url: '/courses',
                templateUrl: 'public/tpl/courses/courses.tpl.html',
                controller: 'coursesCtrl'
            })

        function redirect($q, $injector, auth, store, $location) {
            return {
                responseError: function(rejection) {
                    if (rejection.status === 401) {
                        auth.signout();
                        store.remove('profile');
                        store.remove('id_token');
                        store.remove('isRegistedCourse');
                        $location.path('/home');
                    }
                    return $q.reject(rejection);
                }
            };
        }

        /*============== Factory and services ================*/
        $provide.factory('redirect', redirect);
        $httpProvider.interceptors.push('redirect');
        $httpProvider.interceptors.push('jwtInterceptor');
    }) // END OF THE CONFIG


/*============== On refresh  ================*/
//Check if the toke accepted and is not Expired and the user is Authenticated
.run(function($rootScope, auth, store, jwtHelper, $location) {
    $rootScope.$on('$locationChangeStart', function() {
        var token = store.get('id_token');
        var profile = store.get('profile');
   	  var isRegistedCourse = store.get('isRegistedCourse');
        if (token) {
            if (!jwtHelper.isTokenExpired(token)) {
                if (!auth.isAuthenticated) {
                  auth.authenticate(store.get('profile'), token);
        				$rootScope.profile = profile;
        				$rootScope.isRegistedCourse = isRegistedCourse;
                }
            }
        } else {
            $location.path('/home');
        }
    });

});
