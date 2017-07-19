(function() {
    'use strict';

    angular.module('boApp')
        .factory("dataService", DataService);

    DataService.$inject = ['$http','bo', '$q', '$location', '$rootScope'];

    function DataService($http, bo, $q, $location, $rootScope) { // This service connects to our REST API

        var serviceBase = 'api/v1/';

        var service ={
            page : page,
            get : get,
            getIp : getIp,
            getBoUrl : getBoUrl,
            post : post,
            postBinary : postBinary,
            put : put,
            delete : del
        };

        return service;

        function page (data) {
            if (data != undefined) {
				bo.pop(data.status, "", data.message, 10000, 'trustedHtml');
			}
        }

        function get (q) {
            return $http.get(serviceBase + q).then(function (results) {
                return results.data;
            }, function errorCallback(response) {
  			  if (response.status == 401) {
                  $rootScope.sessionExpired = true;
                  $location.path("/login").search({expired: 1});
			  }
		    });
        };
        
        function getIp () {
			return $q(function(resolve, reject) {
				resolve({ip: REMOTE_ADDRESS});
			});
        };
        
        function getBoUrl () {
            return $http.get(serviceBase + 'boUrl').then(function(results){
                return results.data;
            });
        }
        
        function post (q, object) {
			return $http.post(serviceBase + q, object).then(function (results) {
				return results.data;
            }, function errorCallback(response) {
  			  if (response.status == 401) {
                  $location.path("/login").search({expired: 1});
			  }
			  console.log(response);
		    });
        };

        function postBinary (q, object) {
			return $http.post(serviceBase + q, object, {responseType: "arraybuffer"}).then(function (response) {
				return response.data;
            }, function errorCallback(response) {
  			  if (response.status == 401) {
                  $location.path("/login").search({expired: 1});
			  }
			  console.log(response);
		    });
        };
        
        function put (q, object) {
            return $http.put(serviceBase + q, object).then(function (results) {
                return results.data;
            }, function errorCallback(response) {
  			  if (response.status == 401) {
                  $location.path("/login").search({expired: 1});
			  }
			  console.log(response);
		    });
        };
        
        function del (q) {
            return $http.delete(serviceBase + q).then(function (results) {
                return results.data;
            }, function errorCallback(response) {
  			  if (response.status == 401) {
                  $location.path("/login").search({expired: 1});
			  }
			  console.log(response);
		    });
        };
    }
})();
