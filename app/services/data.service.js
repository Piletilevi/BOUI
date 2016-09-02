(function() {
    'use strict';

    angular.module('boApp').factory("Data", connect);
    Data.$inject = ['$http', 'bo'];
    function connect($http, bo) { // This service connects to our REST API

        var serviceBase = 'api/v1/';
        var ipUrl = 'http://ipv4.myexternalip.com/json';

        var service ={
            page:page,
            get:get,
            getIp:getIp,
            post:post,
            put:put,
            delete:del
        };
        return service;



        function page (data) {
            bo.pop(data.status, "", data.message, 10000, 'trustedHtml');
        }
        function get (q) {
            return $http.get(serviceBase + q).then(function (results) {
                return results.data;
            });
        };
         function getIp () {
            return $http.get(ipUrl).then(function (results) {
                return results.data;
            });
        };
        function post (q, object) {
            return $http.post(serviceBase + q, object).then(function (results) {
                return results.data;
            });
        };
         function put (q, object) {
            return $http.put(serviceBase + q, object).then(function (results) {
                return results.data;
            });
        };
        function del (q) {
            return $http.delete(serviceBase + q).then(function (results) {
                return results.data;
            });
        };


    }

})();
