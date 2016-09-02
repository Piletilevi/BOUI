(function() {
    'use strict';
    angular.module('bo', ['ngAnimate']);
    
	angular.module('bo');

    angular.module('bo').service('bo', ['$rootScope', boService]);


    angular.module('bo').constant('boConfig', {
        'limit': 0,                   // limits max number of pages
        'tap-to-dismiss': true,
        'newest-on-top': true,
        'time-out': 5000,
        //'extendedTimeout':0,// Set timeOut and extendedTimeout to 0 to make it sticky
        'icon-classes': {
            error: 'bo-error',
            info: 'bo-info',
            success: 'bo-success',
            warning: 'bo-warning'
        },
        'body-output-type': '', // Options: '', 'trustedHtml', 'template'
        'body-template': '',
        'icon-class': 'bo-info',
        'position-class': 'bo-bottom-left',
        'title-class': 'bo-title',
        'message-class': 'bo-message'
    })

    angular.module('bo').directive('boContainer',[
        '$compile',
        '$timeout',
        '$sce',
        'boConfig',
        'bo',
        boDirective
    ]);

    function boService ($rootScope) {
        this.pop = function (type, title, body, timeout, bodyOutputType) {
			this.page = {
                type: type,
                title: title,
                body: body,
                timeout: timeout,
                bodyOutputType: bodyOutputType
            };
            $rootScope.$broadcast('bo-newPage');
        };

        this.clear = function () {
            $rootScope.$broadcast('bo-clearPages');
        };
    }

    function boDirective ($compile, $timeout, $sce, boConfig, bo) {
		return {
            replace: true,
            restrict: 'EA',
            link: linkFunction,
            controller: ['$scope', '$element', '$attrs', boController],
            template:
				'<div id="bo-container" ng-class="config.position">' +
				'  <div ng-repeat="page in pages" class="bo" ng-class="page.type" ng-click="remove(page.id)" ng-mouseover="stopTimer(page)"  ng-mouseout="restartTimer(page)">' +
				'    <div ng-class="config.title">{{page.title}}</div>' +
				'      <div ng-class="config.message" ng-switch on="page.bodyOutputType">' +
				'      <div ng-switch-when="trustedHtml" ng-bind-html="page.html"></div>' +
				'      <div ng-switch-when="template"><div ng-include="page.bodyTemplate"></div></div>' +
				'      <div ng-switch-default >{{page.body}}</div>' +
				'    </div>' +
				'  </div>' +
				'</div>'
        };

        function linkFunction (scope, elm, attrs) {

            var id = 0;

            var mergedConfig = boConfig;
            if (attrs.boOptions) {
                angular.extend(mergedConfig, scope.$eval(attrs.boOptions));
            }

            scope.config = {
                position: mergedConfig['position-class'],
                title: mergedConfig['title-class'],
                message: mergedConfig['message-class'],
                tap: mergedConfig['tap-to-dismiss']
            };

            scope.configureTimer = function configureTimer(page) {
                var timeout = typeof (page.timeout) == "number" ? page.timeout : mergedConfig['time-out'];
                if (timeout > 0)
                    setTimeout(page, timeout);
            };

            function addPage(page) {
				page.type = mergedConfig['icon-classes'][page.type];
                if (!page.type)
                    page.type = mergedConfig['icon-class'];

                id++;
                angular.extend(page, { id: id });

                // Set the page.bodyOutputType to the default if it isn't set
                page.bodyOutputType = page.bodyOutputType || mergedConfig['body-output-type'];

                switch (page.bodyOutputType) {
                    case 'trustedHtml':
                        page.html = $sce.trustAsHtml(page.body);
                        break;
                    case 'template':
                        page.bodyTemplate = page.body || mergedConfig['body-template'];
                        break;
                }

				scope.configureTimer(page);

                if (mergedConfig['newest-on-top'] === true) {
                    scope.pages.unshift(page);
                    if (mergedConfig['limit'] > 0 && scope.pages.length > mergedConfig['limit']) {
                        scope.pages.pop();
                    }
                } else {
                    scope.pages.push(page);
                    if (mergedConfig['limit'] > 0 && scope.pages.length > mergedConfig['limit']) {
                        scope.pages.shift();
                    }
                }
            }

            function setTimeout(page, time) {
                page.timeout = $timeout(function () {
                    scope.removePage(page.id);
                }, time);
            }

            scope.pages = [];
            scope.$on('bo-newPage', function () {
                addPage(bo.page);
            });

            scope.$on('bo-clearPages', function () {
                scope.pages.splice(0, scope.pages.length);
            });
        }

        function boController ($scope, $element, $attrs) {

            $scope.stopTimer = function (page) {
                if (page.timeout) {
                    $timeout.cancel(page.timeout);
                    page.timeout = null;
                }
            };

            $scope.restartTimer = function (page) {
                if (!page.timeout)
                    $scope.configureTimer(page);
            };

            $scope.removePage = function (id) {
                var i = 0;
                for (i; i < $scope.pages.length; i++) {
                    if ($scope.pages[i].id === id)
                        break;
                }
                $scope.pages.splice(i, 1);
            };

            $scope.remove = function (id) {
                if ($scope.config.tap === true) {
                    $scope.removePage(id);
                }
            };
        }


    }


})();