'use strict';

angular
    .module('boApp')
    .directive('ngVenueMap', VenueMapDirective);

VenueMapDirective.$inject = ['$parse', '$location', '$translate', 'eventService'];

function VenueMapDirective($parse, $location, $translate, eventService) {
    var hostConf = {
        secure: window.location.protocol == 'https:',
        host: $location.host()
    };
    var link = function($scope, $element, $attributes) {
        var map = null;
        var previouslySelectedSeats = [];
        var fsMap = null;

        var toggleFsMap = function() {
            if (!fsMap) {
                fsMap = $('<div class="piletilevi_venue_map_places_sections_fullscreen"></div>');
                $element.append(fsMap);
                map.setLegendType('title');
                map.update();
                fsMap.append(map.getComponentElement());
                fsMap.append('<div class="fullscreen_close"><i class="fa fa-close"></i></div>');
                fsMap.show();
                fsMap.find('.fullscreen_close').one('click', function() {
                    map.extend(); // read "toggle extended mode"
                });
            } else {
                map.setLegendType('none');
                map.update();
                $element.append(map.getComponentElement());
                fsMap.remove()
                fsMap = null;
            }
            map.resize();
        };

        var disposeMap = function() {
            if (!map)
                return;
            map.dispose();
            map = null;
            fsMap = null;
            $element.empty();
        };
        $attributes.$observe('config', function() {
            var mapConfig = $parse($attributes.config)($scope);
            if (!mapConfig.confId || !mapConfig.concertId) {
                disposeMap();
                return false;
            }
            if (!map) {
                map = new piletilevi.venuemap.VenueMap();
                $element.append(map.getComponentElement());
                map.setShopDomain(hostConf.host);
                map.setConnectionSecure(hostConf.secure);
                map.setWithControls(true);
                map.setSectionsMapImageUrl('');
                map.setLegendType('none');
                map.setMassSelectable(true);

                map.addTranslation('booked', $translate.instant('api_seat_booked'));
                // TODO: set proper translation for 'not_sold'
                map.addTranslation('not_sold', $translate.instant('api_seat_booked'));
                map.addTranslation('available', $translate.instant('api_seat_available'));
                map.addTranslation('selected', $translate.instant('api_seat_selected'));
                // TODO: add other translations
                map.addTranslation('section', '');
                map.addTranslation('row', '');
                map.addTranslation('place', '');
                map.addTranslation('price', '');
                map.addTranslation('stage-field', '');
                map.addTranslation('stage-screen', '');
                map.addTranslation('stage-stage', '');

                map.setExtensionHandler(toggleFsMap);
                map.addHandler('visibilityChange', function(visible) {
                    $element.css({display: visible ? 'block' : 'none'});
                });
                map.addHandler('sectionMouseover', function(sectionId) {
                    $scope.setMouseoverSectionId(sectionId);
                    $scope.$apply();
                });
                map.addHandler('sectionSelected', function(sectionId) {
                    var sectorList = eventService.mySectorsData();
                    var sectorData;
                    angular.forEach(sectorList.sales, function(sector) {
                        if (sector.sectorId == sectionId) {
                            sectorData = sector;
                        }
                    });
                    if (!$scope.reservationMode || sectorData.statistics.availableTickets != 0) {
                        $scope.setSelectedSectionId(sectionId);
                        $scope.$apply();
                    }
                });
                map.addHandler('seatsSelected', function(seatIds) {
                    $scope.addSeatsToBasket(seatIds);
                    $scope.$apply();
                });
                map.addHandler('seatsDeselected', function(seatIds) {
                    for (var i = 0; i < seatIds.length; ++i) {
                        $scope.removeSelectedSeatId(seatIds[i]);
                        $scope.$apply();
                    }
                });
            }
            map.setConfId(mapConfig.confId);
            map.setConcertId(mapConfig.concertId);
            map.setSectionsMapType(mapConfig.sectionMapType);
            map.setSections(mapConfig.sections);
            map.setEnabledSections(mapConfig.enabledSections);

            if (mapConfig.type === 'seats') {
                var seatsInfo = mapConfig.seatsInfo || [];
                var priceClasses = mapConfig.priceClasses || [];
                // places details
                map.setSeatSelectionEnabled(mapConfig.seatClick);
                var sectionDetails = {
                    id: mapConfig.sectionId,
                    seatsInfo: seatsInfo,
                    priceClasses: priceClasses,
                    selectableSeats: true
                };
                map.addSectionDetails(sectionDetails);
                map.setSelectedSection(mapConfig.sectionId);
            }
            map.update();

            var sectionsMap = map.getSectionsMap();
            var regions = sectionsMap ? sectionsMap.getMapRegions() : {};
            if (mapConfig.mouseoverSectionId && regions[mapConfig.mouseoverSectionId]) {
                regions[mapConfig.mouseoverSectionId].markActive();
            }
            if (mapConfig.mouseoverSectionId != mapConfig.mouseoverPrevSectionId
                && regions[mapConfig.mouseoverPrevSectionId]) {
                regions[mapConfig.mouseoverPrevSectionId].markInactive();
            }
        }, true);

        $attributes.$observe('selectedseats', function() {
            if (!map) {
                return;
            }
            var selectedSeats = $parse($attributes.selectedseats)($scope);
            map.unSetSelectedSeats(previouslySelectedSeats);
            previouslySelectedSeats = selectedSeats;
            map.setSelectedSeats(selectedSeats);
            map.update();
        }, true);

        $scope.$on('$destroy', function() {
            disposeMap();
        });
    };
    return {
        restrict: 'E',
        scope: true,
        link: link
    };
}