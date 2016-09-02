(function() {
    'use strict';

    angular.module('boApp').factory("Data", ['$http', 'bo', connect]);

    function connect($http, bo) { // This service connects to our REST API

        var serviceBase = 'api/v1/';
        var ipUrl = 'http://ipv4.myexternalip.com/json';

        var obj = {};

        obj.page = function (data) {
            bo.pop(data.status, "", data.message, 10000, 'trustedHtml');
        }
        obj.get = function (q) {
            return $http.get(serviceBase + q).then(function (results) {
                return results.data;
            });
        };
        obj.getIp = function () {
            return $http.get(ipUrl).then(function (results) {
                return results.data;
            });
        };
        obj.post = function (q, object) {
            return $http.post(serviceBase + q, object).then(function (results) {
                return results.data;
            });
        };
        obj.put = function (q, object) {
            return $http.put(serviceBase + q, object).then(function (results) {
                return results.data;
            });
        };
        obj.delete = function (q) {
            return $http.delete(serviceBase + q).then(function (results) {
                return results.data;
            });
        };

        return obj;
    }

})();
