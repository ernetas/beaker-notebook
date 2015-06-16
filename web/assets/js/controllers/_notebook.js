;(function(angular, app) {
  app.controller('notebook', [
    '$scope',
    '$rootScope',
    '$state',
    'LastViewed',
    '$sce',
    'Factories',
    '$compile',
    '$location',
    '$route',
    '$routeParams',
    'Notebooks',
    'UserPreferences',
    'Beaker',
    'NotebookMenuService',
    'NotebookRestangular',
    'FullscreenState',
    'TrackingService',
    'bkSession',
    'bkSessionManager',
    'bkHelper',
    function(
      $scope,
      $rootScope,
      $state,
      LastViewed,
      $sce,
      F,
      $compile,
      $location,
      $route,
      $routeParams,
      Notebooks,
      UserPreferences,
      Beaker,
      NotebookMenuService,
      NotebookRestangular,
      FullscreenState,
      TrackingService,
      bkSession,
      bkSessionManager,
      bkHelper) {

      var frame;
      var prjId = $state.params.id;

      LastViewed.set('projects');

      $scope.projects.search = '';

      $scope.menu = false;

      $scope.warning = '';

      $scope.getLoadingMessage = function() {
        return bkHelper.getSessionId() ? bkHelper.getStatus() : null;
      };

      $scope.edited = function() {
        return bkSessionManager.isNotebookModelEdited();
      };

      $scope.otherOpenNotebooks = function(value, index) {
        return value.open && !$scope.isViewingNotebook(value['public-id']);
      };

      $scope.otherOpenNotebooksExist = function() {
        return _.any($scope.notebooks.list, $scope.otherOpenNotebooks);
      };

      $scope.beakerReady = function() {
        return Beaker.isReady() && $scope.isExistingSession !== void(0);
      };

      var notebookNameTaken = function() {
        return !!_.find($scope.notebooks.list, {name: $scope.saveAsName, projectId: $scope.notebook.current.projectId});
      };

      var scrollToBottom = function() {
        var body = document.body;
        var html = document.documentElement;
        var height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

        window.scrollTo(window.pageXOffset, height);
      };

      function broadcastNotebookReady() {
        // jscs: disable requireCamelCaseOrUpperCaseIdentifiers
        var baseRest = NotebookRestangular.one('notebooks', $state.params.notebook_id);
        // jscs: enable
        $rootScope.$broadcast('notebookReadyToRender', {
          // jscs: disable requireCamelCaseOrUpperCaseIdentifiers
          beakerSessionId: $state.params.notebook_id,
          // jscs: enable
          beakerNotebook: {
            uri: 'ajax:' +
              baseRest.all('contents').getRestangularUrl() + ':' +
              baseRest.getRestangularUrl()
          },
          openFromUri: !$scope.isExistingSession
        });
      }

      function openNotebook(notebook) {
        if (notebook.unavailable) {
          return $state.go('projects.items.item', {id: notebook.projectId});
        }
        Notebooks.update({id: notebook['public-id'], open: true});
        $scope.notebook = {current: notebook};
      }

      // jscs: disable requireCamelCaseOrUpperCaseIdentifiers
      F.Notebooks.getNotebook($state.params.notebook_id).then(function(notebook) {
      // jscs: enable
        openNotebook(notebook);
        if (notebook['public-id'] == bkSessionManager.getSessionId()) {
          $scope.isExistingSession = true;
        } else {
          Beaker.whenReady().then(function(result) {
            if (result === 'timeout') {
              $scope.warning = 'Beaker has timed out.  Please refresh to try again.';
              return;
            } else if (result === 'error') {
              $scope.warning = 'An Error has occurred';
              return;
            }
            TrackingService.mark('NotebookLoaded');
            TrackingService.measure('BaselineUnprovisionedNotebookLoad', 'LoadUnprovisionedNotebook', 'NotebookLoaded');
            TrackingService.measure('BaselineProvisionedNotebookLoad', 'LoadProvisionedNotebook', 'NotebookLoaded');
            TrackingService.measure('BaselineUnProvisionedNotebookCreate', 'CreateUnProvisionedNotebook', 'NotebookLoaded');
            TrackingService.measure('BaselineProvisionedNotebookCreate', 'CreateProvisionedNotebook', 'NotebookLoaded');

            return bkSession.getSessions().then(function(sessions) {
              // jscs: disable requireCamelCaseOrUpperCaseIdentifiers
              $scope.isExistingSession = sessions[$state.params.notebook_id] !== void(0);
              // jscs: enable
              broadcastNotebookReady();
            });
          });
        }
      });

      $scope.save = function() {
        $scope.hideMenu();
        return bkHelper.saveNotebook().then(function() {
          $rootScope.$broadcast('notebookUpdated', $scope.notebook.current);
        });
      };

      $scope.showStdoutStderr = function() {
        var data = {action: 'showStdoutStderr'};

        Notebooks.sendToIFrame($scope.notebook.current['public-id'], data);
        scrollToBottom();
      };

      $scope.saveAs = function() {
        $scope.saveAsName = $scope.notebook.current.name + ' 2';
        // jscs: disable requireCamelCaseOrUpperCaseIdentifiers
        $scope.$emit('openModal', $compile(templates.save_as_modal())($scope));
        // jscs: enable
      };

      $scope.checkSaveAs = function() {
        if (notebookNameTaken()) {
          $scope.error = 'That notebook name is already taken in this project.';
        } else {
          Notebooks.create($scope.notebook.current.project['public-id'],
                           {name: $scope.saveAsName,
                            data: bkSessionManager.getSaveData().notebookModelAsString});
          $scope.$emit('closeModal');
        }
      };

      $scope.menuItems = function() {
        return NotebookMenuService.menuItems($scope);
      };

      $scope.saveAsCancel = function() {
        $scope.$emit('closeModal');
      };

      $scope.destroyPublication = function() {
        F.Publications.destroy($scope.notebook.current.publication['public-id']).then(function() {
          F.Notebooks.getNotebook($scope.notebook.current['public-id']).then(function(notebook) {
            $scope.notebook.current = notebook;
          });
        });
      };

      $scope.openPublishModal = function() {
        // jscs: disable requireCamelCaseOrUpperCaseIdentifiers
        $scope.$emit('openModal', $compile(templates.publish_notebook_modal())($scope), {width: '400px'});
        // jscs: enable
      };

      FullscreenState.toggleFullscreen(UserPreferences.get('fullscreenView'));

      $scope.$on('$destroy', function() {
        FullscreenState.toggleFullscreen(false);
      });

      $scope.$watch('notebook.current', function(newVal) {
        if (!newVal) {
          return;
        }

        $scope.published = !_.isEmpty($scope.notebook.current.publication);
      });
    }]
  );
} (angular, window.bunsen));