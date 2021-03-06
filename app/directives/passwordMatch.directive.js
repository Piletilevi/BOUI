/**
 * Created by kaur on 2.09.2016.
 */
(function() {
    'use strict';
    angular.module('boApp')
        .directive('passwordMatch', passwordMatch);

    function passwordMatch() {
        return {
            restrict: 'A',
            scope: true,
            require: 'ngModel',
            link: link
        };

    }
    link.$inject = ['scope', 'elem', 'attrs', 'control'];
    function link (scope, elem, attrs, control) {
        var checker = function () {

            //get the value of the first password
            var e1 = scope.$eval(attrs.ngModel);

            //get the value of the other password
            var e2 = scope.$eval(attrs.passwordMatch);
            if (e2 != null)
                return e1 == e2;
        };
        scope.$watch(checker, function (n) {

            //set the form control to valid if both
            //passwords are the same, else invalid
            control.$setValidity("passwordNoMatch", n);
        });
    }
})();