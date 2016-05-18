"use strict";
angular
    .module('myApp', ['auth0', 'angular-storage', 'angular-jwt', 'ui.router'])

/*============== Controllers ================*/

.controller('homeCtrl', ['$scope', '$location', '$rootScope',
    function($scope, $location, $rootScope) {
        $rootScope.location = $location.path();
        console.log($scope.location);
    }
])


// Controller to user.tpl.html (All Users)
.controller('profileCtrl', ['$scope', '$rootScope', '$http', '$location',
    function($scope, $rootScope, $http, $location) {
        $rootScope.location = $location.path();
        $http.get('/api/users/' + $rootScope.profile.identities[0].user_id)
            .success(function(data, status, header, config) {
                $scope.userPicture = $rootScope.profile.picture;
                $scope.userNickname = $rootScope.profile.nickname;
                $scope.userEmail = $rootScope.profile.email;
            })
    }
])


.controller('coursesCtrl', ['$rootScope', '$location', '$http', 'store',
    function($rootScope, $location, $http, store) {
        $rootScope.location = $location.path();

        $rootScope.registerOnCourse = function() {

            var updatedUser = {
                isRegistedCourse: true
            };

            $http.put('/api/users/' + $rootScope.profile.identities[0].user_id, updatedUser)
                .success(function(data, status, header, config) {
                    $http.get('/api/users/' + $rootScope.profile.identities[0].user_id)
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
    }
])
    .controller('aboutCtrl', ['$scope', '$location', '$rootScope',
        function($scope, $location, $rootScope) {
            $rootScope.location = $location.path();
        }
    ])
    .controller('courseIntroCtrl', ['$scope', '$location', '$rootScope',
        function($scope, $location, $rootScope) {
            $rootScope.location = $location.path();
        }
    ])

.controller('course1ExercisesCtrl', ['$scope', '$location', '$rootScope', '$sce',
    function($scope, $location, $rootScope, $sce) {
        $rootScope.location = $location.path();
        $scope.next = false;
        $scope.question1T = false;
        $scope.question2T = false;

        $scope.question1 = {
            answer1: false,
            answer2: false,
            answer3: false,
            answer4: false
        }

        $scope.question2 = {
            answer1: false,
            answer2: false,
            answer3: false,
            answer4: "0"
        }

        $scope.submitExercise1 = function() {
            // Questions 1
            if (!$scope.question1.answer1 && !$scope.question1.answer2 && $scope.question1.answer3 && !$scope.question1.answer4) {
                $scope.question1T = true;
            } else {
                $scope.question1T = false;
            }

            // Questions 2
            if ($scope.question2.answer1 && $scope.question2.answer2 && $scope.question2.answer3 && $scope.question2.answer4 == '0') {
                $scope.question2T = true;
            } else {
                $scope.question2T = false;
            }

            // Next Page if both are correct
            if ($scope.question1T && $scope.question2T) {
                $scope.next = true;
            } else {
                $scope.next = false;
            }

            window.scrollTo(0, 0);
        }
    }
])



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
    $urlRouterProvider.otherwise('/home');

    $stateProvider
        .state("home", {
            url: '/home',
            templateUrl: '/tpl/home/home.tpl.html',
            controller: 'homeCtrl',
            authenticate: false
        })
        .state('courses', {
            url: '/courses',
            templateUrl: '/tpl/course/coursesHomePage.tpl.html',
            controller: 'coursesCtrl',
            authenticate: true
        })
        .state('profile', {
            url: '/profile',
            templateUrl: '/tpl/profile/profile.tpl.html',
            controller: 'profileCtrl',
            authenticate: true
        })
        .state('about', {
            url: '/about',
            templateUrl: '/tpl/about/about.tpl.html',
            controller: 'aboutCtrl',
            authenticate: false
        })
        .state('courseIntro', {
            url: '/courseintro',
            templateUrl: '/tpl/course/content/courseIntro.tpl.html',
            controller: 'courseIntroCtrl',
            authenticate: true
        })
        .state('course1', {
            url: '/course1',
            templateUrl: '/tpl/course/content/course1/course1.tpl.html',
            controller: 'courseIntroCtrl',
            authenticate: true
        })
        .state('course1Exercises', {
            url: '/course1Exercises',
            templateUrl: '/tpl/course/content/course1Exercises/course1Exercises.tpl.html',
            controller: 'course1ExercisesCtrl',
            authenticate: true
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
.run(function($rootScope, auth, store, jwtHelper, $location, $state) {

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
        }
    });

    //if u dont arent authenticated u can go to state that require authentication
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
        if (toState.authenticate && !auth.isAuthenticated) {
            // User isn’t authenticated
            $state.transitionTo("home");
            alert('Need to be Logged!');
            event.preventDefault();
        }
    });


    //On state change goes to the top of the page
    $rootScope.$on("$stateChangeSuccess", function(event, currentRoute, previousRoute) {

        window.scrollTo(0, 0);

    });

})

.directive('ngAllowTab', function() {
    return function(scope, element, attrs) {
        element.bind('keydown', function(event) {
            if (event.which == 9) {
                event.preventDefault();
                var start = this.selectionStart;
                var end = this.selectionEnd;
                element.val(element.val().substring(0, start) + '\t' + element.val().substring(end));
                this.selectionStart = this.selectionEnd = start + 1;
                element.triggerHandler('change');
            }
        });
    };
});