!(function(app) {
  app.controller('application', ['$rootScope', '$scope', '$state', '$sessionStorage', '$http', function($rootScope, $scope, $state, $sessionStorage, $http) {

    $rootScope.$session = $sessionStorage;

    if ($sessionStorage.currentUser && $sessionStorage.currentUser.token) {
      $http.defaults.headers.common['User-Token'] = $sessionStorage.currentUser.token;
    }

    $scope.$state = $state;
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
      $rootScope.referrer = {
        fromState: fromState,
        fromParams: fromParams
      }

      if (!$sessionStorage.currentUser && !toState.skipAuth) {
        $rootScope.goTo = toState;
        $state.go("signIn");
        event.preventDefault();
      }
    });

    $rootScope.signOut = function() {
      delete $sessionStorage.currentUser;
    }
  }]);
})(window.bunsen);