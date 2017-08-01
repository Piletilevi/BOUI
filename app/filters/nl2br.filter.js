(function () {

    'use strict';

    angular
        .module('boApp')
        .filter('nl2br', Nl2Br);

    function Nl2Br() {
        return function (text) {
            return text.replace(/\\n/g, "<br />");
        }
    }

})();