(function() {

    'use strict';

    angular
        .module('boApp')
        .factory('colorService', ColorService);

    function ColorService() {
        
		var service = {
			getRandomColor : getRandomColor,
			getColorByType : getColorByType
        };
        return service;

		// This function generates vibrant, "evenly spaced" colours (i.e. no clustering). 
		// This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
		function getRandomColor(numOfSteps, step) {
			var r, g, b;
			var h = step / numOfSteps;
			var i = ~~(h * 6);
			var f = h * 6 - i;
			var q = 1 - f;
			switch(i % 6){
				case 0: r = 1; g = f; b = 0; break;
				case 1: r = q; g = 1; b = 0; break;
				case 2: r = 0; g = 1; b = f; break;
				case 3: r = 0; g = q; b = 1; break;
				case 4: r = f; g = 0; b = 1; break;
				case 5: r = 1; g = 0; b = q; break;
			}
			var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
			return (c);
		}

		function getColorByType(typeName) {
			var color;
			switch(typeName) {
				case 'api_sold_by_internet': 	color = '#99e394'; break;
				case 'api_sold_by_salespoint': 	color = '#8e7cc3'; break;
				case 'api_avail_for_sale': 		color = '#ff3f68'; break;
				case 'api_organizer_reserved_promoter': 		color = '#fcd8c2'; break;
			}

			return color;
		}
    }
})();
