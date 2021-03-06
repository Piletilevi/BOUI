(function() {

    'use strict';

    angular
        .module('boApp')
        .factory('colorService', ColorService);

    function ColorService() {
        
		var service = {
			getRandomColor: getRandomColor,
			getColorByType: getColorByType
        };
        return service;

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

		function getColorByType(type) {
			var color;
			switch(type) {
				//SOLD GROUP
				case 'internet': color = '#58e393'; break;
				case 'salespoint': color = '#52ad9c'; break;
				case 'sms': color = '#58e3b6'; break;
                case 'pdf': color = '#52a7ad'; break;
                case 'chair_owner': color = '#6ee783'; break;
                case 'lodge': color = '#1ba1a1'; break;
				case 'refund': color = '#fe5f55'; break;
				//RESERVED GROUP
				case 'reserved_client': color = '#4ab1e2'; break;
				case 'reserved_lodge': color = '#17bebb'; break;
				case 'reserved_promoter': color = '#0471a6'; break;
				case 'reserved_seat_owner':	color = '#33658a'; break;
				//ORGANIZER GROUP
                case 'complimentary_with_fees': color = '#f5bb00'; break;
				case 'complimentary_without_fees': color = '#fed766'; break;
                case 'organizer_refund_with_fees': color = '#fe9000'; break;
				case 'organizer_refund_without_fees': color = '#ff6201'; break;
				//VENUE_OCCUPANCY GROUP
				case 'avail_for_sale': color = '#5e7287'; break;
			}
			return color;
		}
    }
})();
