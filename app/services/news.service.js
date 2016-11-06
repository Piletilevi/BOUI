(function() {

    'use strict';

    angular
        .module('boApp')
        .factory('newsService', NewsService);

    NewsService.$inject = ['$rootScope', 'dataService'];

    function NewsService($rootScope, dataService) {
        var service = {
            news: news
        };
        return service;

        function news() {
			var list = new Array();
			for (var i = 0; i < 3; i++) { 
				var entry = {id:i + 1, 
							 title:"Promoters news title", 
							 text:"Cras justo odio, dapibus ac facilisis in, egestas eget quam. Donec id elit non mi porta gravida at eget metus. Nullam id dolor id nibh ultricies vehicula ut id e", 
							 created:"01.01.1970", 
							 createdBy:"Super Admin"};
				list.push(entry);
			}
			return list;
        }
    }
})();
