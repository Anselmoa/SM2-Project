(function() {
    'use strict';

    angular
        .module('myApp')
        .directive('toolbar', toolbar);

    function toolbar() {
        return {
            templateUrl: "/tpl/toolbar/toolbar.tpl.html",
            controller: toolbarController,
            controllerAs: 'toolbar'
        }
    }

    function toolbarController(auth, store, $location, $rootScope, $http) {

        var vm = this;
        vm.login = login;
        vm.logout = logout;
        vm.auth = auth;
        vm.profile = store.get('profile');

        function login() {
            auth.signin({}, function(profile, token, e) {
                store.set('id_token', token);
                store.set('profile', profile);
                $rootScope.profile = profile;
                $rootScope.logged = true;



                // IF IS FIRSTLOGIN CREATE A PROFILE IN DB
                if (profile.firstLogin) {
                    var newUser = {
                        userId: profile.identities[0].user_id,
                        nickname: profile.nickname,
                        isRegistedCourse: false
                    };
                    // POST NEW USER
                    $http.post('/api/users', newUser)
                        .success(function(data, status, header, config) {
                            $scope.message = data.message;
                        });
                }
                $http.get('/api/users/' + profile.identities[0].user_id)
                    .success(function(data, status, header, config) {
                        store.set('isRegistedCourse', data[0].isRegistedCourse);
                        $rootScope.isRegistedCourse = store.get('isRegistedCourse');
                        console.log(data);
                    })

                $location.path("/home");
            }, function(error) {
                console.log(error);
            })
        }

        function logout() {
            store.remove('profile');
            store.remove('id_token');
            store.remove('isRegistedCourse');
            $rootScope.profile = '';
            $rootScope.isRegistedCourse = '';
            $rootScope.logged = false;
            auth.signout();
            $location.path("/home");
        }
    }


})();
