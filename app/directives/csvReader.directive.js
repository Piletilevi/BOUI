(function() {
    'use strict';

    angular.module('boApp')
		.directive('csvReader', csvReader);

		// Function to convert to JSON
	var convertToJSON = function (content) {

		// Declare our variables
		var lines = content.csv.split('\n'),
			headers = lines[0].split(content.separator),
			columnCount = lines[0].split(content.separator).length,
			results = [],
			returnData = {};
			
		
		returnData['headers'] = headers;
		
		// For each row
		for (var i = 1; i <= lines.length; i++) {

			// Declare an object
			var obj = {};

			// Get our current line
			var line = lines[i - 1].split(new RegExp(content.separator + '(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)'));
			
			if (line.length > 1) {
				// For each header
				for (var j = 0; j < headers.length; j++) {

					// Populate our object
					obj[headers[j].trim()] = line[j];
				}

				// Push our object to our result array
				results.push(obj);
			}
			
		}
		
		returnData['rows'] = results;
		
		// Return our array
		return returnData;
	};

	function csvReader() {
		return {
			restrict: 'A',
			scope: {
				results: '=',
				headers: '=',
				separator: '=',
				callback: '&saveResultsCallback'
			},
			link: function (scope, element, attrs) {

				// Create our data model
				var data = {
					csv: null,
					separator: scope.separator || ','
				};

				// When the file input changes
				element.on('change', function (e) {

					// Get our files
					var files = e.target.files;

					// If we have some files
					if (files && files.length) {

						// Create our fileReader and get our file
						var reader = new FileReader();
						var file = (e.srcElement || e.target).files[0];
						var isValidFile = false;
						
						if (file != null) {
							var extension = file.name.split('.').pop().toLowerCase();
							if (file.type == "application/vnd.ms-excel" && extension == "csv") {
								isValidFile = true;
							} else {
								alert('Invalid file type. Please choose csv!');
							}
						}
						
						// Once the fileReader has loaded
						reader.onload = function (e) {

							// Get the contents of the reader
							var contents = e.target.result;

							// Set our contents to our data model
							data.csv = contents;

							// Apply to the scope
							scope.$apply(function () {

								// Our data after it has been converted to JSON
								var parsedResult = convertToJSON(data);
								if (parsedResult) {
									scope.headers = parsedResult['headers'];
									scope.results = parsedResult['rows'];									
								}

								// Call our callback function 
								scope.callback(scope.headers, scope.results);
							});
						};

						// Read our file contents
						if (isValidFile) {
							reader.readAsText(file);
						}
					}
				});
			}
		};
	}


})();