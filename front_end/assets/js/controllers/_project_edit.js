!(function(angular, app) {
  app.controller('projectEdit', ['$scope', 'Restangular', '$state', function($scope, Restangular, $state) {
    var R = Restangular;

    R.one('users', window.userID)
      .one('projects', $state.params.id)
      .get().then(function(d) {
        $scope.project = d;
      });

    $scope.updateProject = function() {
      $scope.project.put().then(function() {
        $state.go("projects.items.item", {id: $scope.project.id});
      });
     }

    $scope.deleteProject = function() {
      R.one('users', window.userID)
       .one('projects', $state.params.id)
       .remove().then(function() {
          $state.go('projects');
       });
    };
  }]);
})(angular, window.bunsen);
