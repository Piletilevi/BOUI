(function () {

    'use strict';

    angular
        .module('boApp')
        .factory('pdfService', PdfService);

    function PdfService() {

        var service = {
            printPdf: printPdf
        };
        return service;

        function printPdf(pdfName) {
            html2canvas($('body'), {
                onrendered: function (canvas) {
                    var data = canvas.toDataURL();
                    var docDefinition = {
                        content: [{
                            image: data,
                            width: 500
                        }]
                    };
                    pdfMake.createPdf(docDefinition).download(pdfName + ".pdf");
                }
            });
        }
    }
})();
