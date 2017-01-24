(function () {

  'use strict';

  angular
    .module('boApp')
    .directive('ngSectionsMap', SectionsMap);

  SectionsMap.$inject = ['$parse', '$location'];

    function SectionsMap($parse, $location) {
      return {
        restrict: 'E',
        link: function ($scope, $element, $attributes) {
          var piletilevi = {};

          piletilevi.venuemap = {
            SHOP_DOMAIN: 'shop.piletilevi.ee',
            ASSETS_DOMAIN: 'localhost:83/boui',
            DEFAULT_SEAT_HOVER_COLOR: '#27272e',
            DEFAULT_SEAT_ACTIVE_COLOR: '#27272e',
            DEFAULT_SEAT_INACTIVE_COLOR: '#d0d0d0'
          };

          piletilevi.venuemap.Config = $parse($attributes.config)($scope);

          piletilevi.venuemap.SectionDetails = function (id, selectableSeats, seatsInfo, priceClasses) {
            this.id = id;
            this.selectableSeats = selectableSeats;
            this.seatsInfo = seatsInfo;
            this.priceClasses = priceClasses;
          };

          piletilevi.venuemap.Utilities = new function () {
            this.sendXhr = function (options) {
              var xhr = new XMLHttpRequest();
              xhr.onreadystatechange = function () {
                if (xhr.readyState == XMLHttpRequest.DONE) {
                  if (xhr.responseText) {
                    options.onSuccess(xhr.responseText);
                  } else if (options.onFailure) {
                    options.onFailure();
                  }
                }
              };
              xhr.open('GET', options.url, true);
              xhr.send(null);
            };
          };

          piletilevi.venuemap.VenueMap = function () {
            var self = this;
            var shopDomain = piletilevi.venuemap.SHOP_DOMAIN;
            var confId = '';
            var seatSelectionEnabled = false;
            var sectionsMapType = 'image';
            var sectionsMapImageUrl = '';
            var sections = [];
            var enabledSections = [];
            var selectedSeats = [];
            var selectedSeatsIndex = {};
            var eventHandlers = {};
            var sectionsDetails = {};
            var sectionsMap;
            var activeSection;
            var componentElement;
            var zoomLevel = 0;

            var seatColors = {
              'hover': piletilevi.venuemap.DEFAULT_SEAT_HOVER_COLOR,
              'active': piletilevi.venuemap.DEFAULT_SEAT_ACTIVE_COLOR,
              'inactive': piletilevi.venuemap.DEFAULT_SEAT_INACTIVE_COLOR
            };

            var init = function () {
              componentElement = document.createElement('div');
              componentElement.className = 'piletilevi_venue_map';
              self.hide();
              sectionsMap = new piletilevi.venuemap.SectionsMap(self);
              componentElement.appendChild(sectionsMap.getComponentElement());
            };
            var adjustToZoom = function () {
              if (activeSection) {
                if (sectionsMap) {
                  sectionsMap.position();
                }
              }
            };
            this.build = function () {
              self.update();
              self.display();
            };
            this.update = function () {
              if (activeSection) {
                sectionsMap.hide();
              } else {
                sectionsMap.update();
                sectionsMap.display();
              }
              self.display();
            };
            this.display = function () {
              componentElement.style.display = '';
            };
            this.hide = function () {
              componentElement.style.display = 'none';
            };
            this.setConfId = function (newConfId) {
              confId = newConfId;
            };
            this.getConfId = function () {
              return confId;
            };
            this.setSectionsMapType = function (newMapType) {
              sectionsMapType = newMapType;
            };
            this.getSectionsMapType = function () {
              return sectionsMapType;
            };
            this.setSectionsMapImageUrl = function (newMapImageUrl) {
              sectionsMapImageUrl = newMapImageUrl;
            };
            this.getSectionsMapImageUrl = function () {
              return sectionsMapImageUrl;
            };
            this.setSections = function (newSections) {
              sections = newSections;
            };
            this.getSections = function () {
              return sections;
            };
            this.setEnabledSections = function (newEnabledSections) {
              enabledSections = newEnabledSections;
            };
            this.getEnabledSections = function () {
              return enabledSections;
            };
            this.setSeatSelectionEnabled = function (newSeatSelectionEnabled) {
              seatSelectionEnabled = newSeatSelectionEnabled;
            };
            this.isSeatSelectionEnabled = function () {
              return seatSelectionEnabled;
            };
            this.addSectionDetails = function (details) {
              sectionsDetails[details.id] = details;
            };
            this.getSectionDetails = function (id) {
              return sectionsDetails[id] || null;
            };
            this.setSelectedSeats = function (newSelectedSeats) {
              selectedSeats = newSelectedSeats;
              for (var i = selectedSeats.length; i--;) {
                selectedSeatsIndex[selectedSeats[i]] = true;
              }
            };
            this.setSeatColors = function (newColors) {
              seatColors.hover = newColors.hover || piletilevi.venuemap.DEFAULT_SEAT_HOVER_COLOR;
              seatColors.active = newColors.active || piletilevi.venuemap.DEFAULT_SEAT_ACTIVE_COLOR;
              seatColors.inactive = newColors.inactive || piletilevi.venuemap.DEFAULT_SEAT_INACTIVE_COLOR;
            };
            this.getSeatColor = function (state) {
              return seatColors[state];
            };
            this.isSeatSelected = function (seatId) {
              return selectedSeatsIndex[seatId] || false;
            };
            this.addHandler = function (eventName, callBack) {
              if (typeof eventHandlers[eventName] == 'undefined') {
                eventHandlers[eventName] = [];
              }
              eventHandlers[eventName].push(callBack);
            };
            this.trigger = function (event, param) {
              for (var type in eventHandlers) {
                if (type != event) {
                  continue;
                }
                for (var i = eventHandlers[type].length; i--;) {
                  var handler = eventHandlers[type][i];
                  handler(param);
                }
                break;
              }
            };
            this.setSelectedSection = function (sectionId) {
              activeSection = sectionId;
            };
            this.setShopDomain = function (newShopDomain) {
              shopDomain = newShopDomain;
            };
            this.getShopDomain = function () {
              return shopDomain;
            };
            this.getSelectedSection = function () {
              return activeSection;
            };
            this.getComponentElement = function () {
              return componentElement;
            };
            this.zoomIn = function () {
              ++zoomLevel;
              adjustToZoom();
            };
            this.zoomOut = function () {
              --zoomLevel >= 0 || (zoomLevel = 0);
              adjustToZoom();
            };
            this.setZoomLevel = function (newZoom) {
              zoomLevel = newZoom;
              adjustToZoom();
            };
            this.getZoomLevel = function () {
              return zoomLevel;
            };
            init();
          };

          piletilevi.venuemap.SectionsMap = function (venueMap) {
            var mapRegions = {};
            this.imageElement = false;
            this.mapElement = false;
            this.vectorDocument = false;
            var componentElement;
            var self = this;
            var init = function () {
              componentElement = document.createElement('div');
              componentElement.className = 'piletilevi_venue_map_sections';
            };
            this.update = function () {
              var mapType = venueMap.getSectionsMapType();
              if (mapType) {
                if (mapType == 'image') {
                  if (!self.imageElement) {
                    self.createImageElement(venueMap.getSectionsMapImageUrl());
                  }
                }
                else if (mapType == 'vector') {
                  if (!self.mapElement) {
                    self.createMapElement();
                  }
                }
                self.updateMapElement();
              }
            };
            this.display = function () {
              componentElement.style.display = '';
            };
            this.hide = function () {
              componentElement.style.display = 'none';
            };
            this.createImageElement = function (imageSource) {
              var element = document.createElement('img');
              element.setAttribute('src', imageSource);
              self.imageElement = element;
              componentElement.appendChild(element);
            };

            var requestMapData = function () {
              var url = 'http://' + venueMap.getShopDomain() + '/img/venueplan/svg/'
                + venueMap.getConfId() + '.svg';
              piletilevi.venuemap.Utilities.sendXhr({
                'url': url,
                'onSuccess': receiveMapData,
                'onFailure': function () {
                  venueMap.trigger('sectionsMapLoadFailure');
                },
              });
            };
            var receiveMapData = function (response) {
              var mapData = response;
              var parser = new DOMParser();
              try {
                var svgDocument = parser.parseFromString(mapData, 'image/svg+xml');
                if (svgDocument && svgDocument.getElementsByTagName('parsererror').length > 0) {
                  svgDocument = null;
                }
                if (svgDocument) {
                  var elements = svgDocument.getElementsByTagName('image');
                  for (var i = elements.length; i--;) {
                    elements[i].setAttribute('xlink:href', 'http://' + piletilevi.venuemap.SHOP_DOMAIN
                      + elements[i].getAttribute('xlink:href'));
                  }
                  componentElement.appendChild(document.adoptNode(svgDocument.documentElement));
                  self.mapElement = componentElement.firstChild;
                  self.mapElement.style.verticalAlign = 'top';
                  self.checkMapElement();
                }
              } catch (e) {
                console.log(e);
              }
            };
            this.createMapElement = function () {
              requestMapData();
            };
            this.checkMapElement = function () {
              if (self.mapElement) {
                var vectorDocument = self.mapElement;
                if (vectorDocument) {
                  self.vectorDocument = vectorDocument;
                  self.updateMapElement();
                }
              }
            };
            this.updateMapElement = function () {
              if (self.mapElement && self.vectorDocument) {
                var vectorDocument = self.vectorDocument;
                var sectionsToRemove = [];
                var sectionsIndex = {};
                var sections = venueMap.getSections();
                for (var i = sections.length; i--;) {
                  sectionsIndex[sections[i]] = true;
                }
                var enabledSectionsIndex = {};
                var enabledSections = venueMap.getEnabledSections();
                for (var i = enabledSections.length; i--;) {
                  enabledSectionsIndex[enabledSections[i]] = true;
                }
                for (var j = 0; j < vectorDocument.childNodes.length; j++) {
                  if (vectorDocument.childNodes[j].id) {
                    var sectionId = vectorDocument.childNodes[j].id.split('section')[1];
                    var sectionVector = vectorDocument.childNodes[j];
                    if (sectionsIndex[sectionId]) {
                      if (!mapRegions[sectionId]) {
                        var regionObject = new piletilevi.venuemap.SectionsMapRegion(venueMap, self, sectionId,
                          sectionVector, enabledSectionsIndex[sectionId]);
                        mapRegions[sectionId] = regionObject;
                      }
                    } else {
                      sectionsToRemove.push(sectionVector);
                    }
                  }
                }
                for (var i = 0; i < sectionsToRemove.length; i++) {
                  sectionsToRemove[i].style.display = 'none';
                }
                self.mapElement.style.visibility = 'visible';
              }
            };
            this.getComponentElement = function () {
              return componentElement;
            };
            init();
          };

          piletilevi.venuemap.SectionsMapRegion = function (venueMap, sectionsMap, id, sectionVector, enabled) {
            var self = this;
            this.id = false;

            var init = function () {
              self.id = id;
              sectionVector.addEventListener('click', self.click);
              sectionVector.addEventListener('mouseover', self.mouseOver);
              sectionVector.addEventListener('mouseout', self.mouseOut);
              self.refreshStatus();
            };
            this.refreshStatus = function () {
              if (!enabled) {
                this.markDisabled();
              } else {
                this.markInactive();
              }
            };
            this.mouseOver = function (event) {
              self.markActive();
            };
            this.mouseOut = function (event) {
              self.markInactive();
            };
            this.markDisabled = function () {
              if (sectionVector) {
                sectionVector.setAttribute("style", "display: none;");
              }
            };
            this.markActive = function () {
              if (sectionVector) {
                sectionVector.setAttribute("fill", "#75bb01");
                sectionVector.setAttribute("opacity", "0.8");
                sectionVector.setAttribute("style", "display: block;");
              }
            };
            this.markInactive = function () {
              if (sectionVector) {
                sectionVector.setAttribute("fill", "#cccccc");
                sectionVector.setAttribute("opacity", "0");
                sectionVector.setAttribute("style", "display: block;");
              }
            };
            this.click = function (event) {
              venueMap.trigger('sectionSelected', id);
            };
            init();
          };

          window.touchManager = new function () {
            var self = this;
            var handlers = {};
            var eventsSet;
            var startEventName;
            var moveEventName;
            var endEventName;
            var cancelEventName;
            var pointerCache = {};

            var init = function () {
              handlers['start'] = [];
              handlers['end'] = [];
              handlers['move'] = [];
              handlers['cancel'] = [];
              eventsSet = self.getEventsSet();
              if (eventsSet == 'mouse') {
                captureStartEvent = captureStartEvent_mouse;
                captureEndEvent = captureEndEvent_mouse;
                compileEventInfo = compileEventInfo_mouse;
                startEventName = 'mousedown';
                moveEventName = 'mousemove';
                endEventName = 'mouseup';
                cancelEventName = 'mouseleave';
              } else if (eventsSet == 'touch') {
                compileEventInfo = compileEventInfo_touch;
                startEventName = 'touchstart';
                moveEventName = 'touchmove';
                endEventName = 'touchend';
                cancelEventName = 'touchcancel';
              } else if (eventsSet == 'pointer') {
                compileEventInfo = compileEventInfo_pointer;
                startEventName = 'pointerdown';
                moveEventName = 'pointermove';
                endEventName = 'pointerup';
                cancelEventName = 'pointercancel';
              } else if (eventsSet == 'mspointer') {
                compileEventInfo = compileEventInfo_mouse;
                startEventName = 'mspointerdown';
                moveEventName = 'mspointermove';
                endEventName = 'mspointerup';
                cancelEventName = 'mspointercancel';
              }
              window.addEventListener('load', initDom);
            };
            var initDom = function () {
              switch (eventsSet) {
                case 'pointer':
                case 'mspointer':
                  // cache pointers in these events for multi touch support
                  document.body.addEventListener(endEventName, pointerUp, true);
                  document.body.addEventListener(cancelEventName, pointerUp, true);
                  document.body.addEventListener(startEventName, pointerDown, true);
                  document.body.addEventListener(moveEventName, pointerMove, true);
                  break;
              }
            };
            this.getEventsSet = function () {
              eventsSet = false;
              if (window.PointerEvent) {
                //IE >=11, somebody else?
                eventsSet = 'pointer';
              } else if (window.navigator.msPointerEnabled) {
                //IE mobile <=10
                eventsSet = 'mspointer';
              } else if ('ontouchstart' in window) {
                eventsSet = 'touch';
              } else if ('onmousedown' in window) {
                eventsSet = 'mouse';
              }
              self.getEventsSet = getEventsSet_return;
              return eventsSet;
            };
            var getEventsSet_return = function () {
              return eventsSet;
            };
            var captureStartEvent = function (event) {
              var eventType = 'start';
              fireCallback(eventType, event);
            };
            var captureStartEvent_mouse = function (event) {
              if (event.button == 0) {
                var eventType = 'start';
                fireCallback(eventType, event);
              }
            };
            var captureMoveEvent = function (event) {
              var eventType = 'move';
              fireCallback(eventType, event);
            };
            var captureEndEvent = function (event) {
              var eventType = 'end';
              fireCallback(eventType, event);
            };
            var captureCancelEvent = function (event) {
              var eventType = 'cancel';
              fireCallback(eventType, event);
            };
            var captureEndEvent_mouse = function (event) {
              if (event.button == 0) {
                var eventType = 'end';
                fireCallback(eventType, event);
              }
            };
            var fireCallback = function (eventType, event) {
              var eventInfo = compileEventInfo(event);

              for (var i = 0; i < handlers[eventType].length; i++) {
                if (handlers[eventType][i]['element'] == eventInfo['currentTarget']) {
                  handlers[eventType][i]['callback'](event, eventInfo);
                }
              }
            };
            var compileEventInfo;
            var compileEventInfo_touch = function (event) {
              var eventInfo = {
                'target': event.target,
                'currentTarget': event.currentTarget,
                'touches': event.touches
              };
              if (typeof event.touches[0] != 'undefined') {
                var firstTouch = event.touches[0];
                eventInfo['clientX'] = firstTouch.clientX;
                eventInfo['clientY'] = firstTouch.clientY;
                eventInfo['pageX'] = firstTouch.pageX;
                eventInfo['pageY'] = firstTouch.pageY;
              }
              return eventInfo;
            };
            var compileEventInfo_pointer = function (event) {
              var touches = [];
              for (var id in pointerCache) {
                touches.push(pointerCache[id]);
              }
              return {
                'touches': touches,
                'target': event.target,
                'currentTarget': event.currentTarget,
                'clientX': event.clientX,
                'clientY': event.clientY,
                'pageX': event.pageX,
                'pageY': event.pageY
              };
            };
            var compileEventInfo_mouse = function (event) {
              var currentTouchInfo = {
                'clientX': event.clientX,
                'clientY': event.clientY,
                'pageX': event.pageX,
                'pageY': event.pageY
              };
              return {
                'touches': [currentTouchInfo],
                'target': event.target,
                'currentTarget': event.currentTarget,
                'clientX': event.clientX,
                'clientY': event.clientY,
                'pageX': event.pageX,
                'pageY': event.pageY,
              };
            };
            var cachePointerEvent = function (event) {
              if (event.pointerId) {
                pointerCache[event.pointerId] = {
                  'clientX': event.clientX,
                  'clientY': event.clientY,
                  'pageX': event.pageX,
                  'pageY': event.pageY,
                };
              }
            };
            var uncachePointerEvent = function (event) {
              if (event.pointerId && pointerCache[event.pointerId]) {
                delete pointerCache[event.pointerId];
              }
            };
            var pointerUp = function (event) {
              uncachePointerEvent(event);
            };
            var pointerDown = function (event) {
              cachePointerEvent(event);
            };
            var pointerMove = function (event) {
              cachePointerEvent(event);
            };
            this.addEventListener = function (element, eventType, callback, useCapture) {
              if (!useCapture) {
                useCapture = false;
              }
              if (typeof handlers[eventType] != 'undefined') {
                var handlerExists = false;

                for (var i = 0; i < handlers[eventType].length; i++) {
                  if (handlers[eventType][i]['callback'] == callback && handlers[eventType][i]['element'] == element) {
                    handlerExists = true;
                  }
                }
                if (!handlerExists) {
                  var handlerObject = {};
                  handlerObject['callback'] = callback;
                  handlerObject['element'] = element;
                  handlers[eventType].push(handlerObject);
                }
                if (typeof element != 'undefined' && typeof callback != 'undefined') {
                  if (eventType == 'start') {
                    element.addEventListener(startEventName, captureStartEvent, useCapture);
                  }
                  else if (eventType == 'move') {
                    element.addEventListener(moveEventName, captureMoveEvent, useCapture);
                  }
                  else if (eventType == 'end') {
                    element.addEventListener(endEventName, captureEndEvent, useCapture);
                  }
                  else if (eventType == 'cancel') {
                    element.addEventListener(cancelEventName, captureCancelEvent, useCapture);
                  }
                }
              }
            };
            this.removeEventListener = function (element, eventType, callback) {
              if (typeof handlers[eventType] != 'undefined') {
                for (var i = 0; i < handlers[eventType].length; i++) {
                  if (handlers[eventType][i]['callback'] == callback && handlers[eventType][i]['element'] == element) {
                    handlers[eventType][i] = null;
                    handlers[eventType].splice(i, 1);
                  }
                }
              }
            };
            this.setTouchAction = function (element, action) {
              if (eventsSet == 'mspointer') {
                // IE10
                element.style.msTouchAction = action;
              } else {
                element.style.touchAction = action;
              }
            };
            init();
          };

          var ScalableComponent = function () {
            var scaledElement;
            var gestureElement;
            var beforeStartCallback;
            var afterStartCallback;
            var afterChangeCallback;
            var endCallback;
            var speedX = 1;
            var speedY = 1;
            var minWidth;
            var minHeight;
            var maxWidth;
            var maxHeight;
            var scale;
            var startWidth;
            var startHeight;
            var currentWidth;
            var currentHeight;

            var startF0x;
            var startF0y;
            var startF1x;
            var startF1y;
            var startDistance;

            var f0x;
            var f0y;
            var f1x;
            var f1y;

            var self = this;
            this.registerScalableElement = function (parameters) {
              if (typeof parameters == 'object') {
                if (parameters.scaledElement != undefined) {
                  scaledElement = parameters.scaledElement;
                }

                if (parameters.gestureElement != undefined) {
                  gestureElement = parameters.gestureElement;
                }
                else {
                  gestureElement = scaledElement;
                }

                if (parameters.scaledElement != undefined) {
                  scaledElement = parameters.scaledElement;
                }
                if (typeof parameters.beforeStartCallback == 'function') {
                  beforeStartCallback = parameters.beforeStartCallback;
                }
                if (typeof parameters.afterStartCallback == 'function') {
                  afterStartCallback = parameters.afterStartCallback;
                }
                if (typeof parameters.afterChangeCallback == 'function') {
                  afterChangeCallback = parameters.afterChangeCallback;
                }
                if (typeof parameters.endCallback == 'function') {
                  endCallback = parameters.endCallback;
                }
                if (typeof parameters.speedX != 'undefined') {
                  speedX = parseFloat(parameters.speedX, 10);
                }
                else {
                  speedX = 1;
                }
                if (typeof parameters.speedY != 'undefined') {
                  speedY = parseFloat(parameters.speedY, 10);
                }
                else {
                  speedY = 1;
                }
                if (typeof parameters.minWidth != 'undefined') {
                  minWidth = parseInt(parameters.minWidth, 10);
                }
                if (typeof parameters.minHeight != 'undefined') {
                  minHeight = parseInt(parameters.minHeight, 10);
                }
                if (typeof parameters.maxWidth != 'undefined') {
                  maxWidth = parseInt(parameters.maxWidth, 10);
                }
                if (typeof parameters.maxHeight != 'undefined') {
                  maxHeight = parseInt(parameters.maxHeight, 10);
                }
                initScalableElement();
              }
            };
            this.unRegisterScalableElement = function () {
              removeScalableElement();
            };
            var initScalableElement = function () {
              removeScalableElement();
              touchManager.setTouchAction(gestureElement, 'none'); // disable browser-related touch manipulation
              touchManager.addEventListener(gestureElement, 'start', startHandler);
            };
            var removeScalableElement = function () {
              touchManager.removeEventListener(gestureElement, 'start', startHandler);
              touchManager.removeEventListener(gestureElement, 'move', moveHandler);
              touchManager.removeEventListener(gestureElement, 'cancel', endHandler);
              touchManager.removeEventListener(gestureElement, 'end', endHandler);
            };
            var startHandler = function (eventInfo, touchInfo) {
              if (touchInfo.touches != undefined && touchInfo.touches.length > 1) {
                eventInfo.preventDefault();
                scale = 1;
                if (scaledElement.tagName.toUpperCase() == 'SVG') {
                  // not all browsers provide offsetWidth/Height for SVGs
                  var svgBoxInfo = scaledElement.getBoundingClientRect();
                  startWidth = svgBoxInfo.width;
                  startHeight = svgBoxInfo.height;
                } else {
                  startWidth = scaledElement.offsetWidth;
                  startHeight = scaledElement.offsetHeight;
                }
                startF0x = touchInfo.touches[0].pageX;
                startF0y = touchInfo.touches[0].pageY;
                startF1x = touchInfo.touches[1].pageX;
                startF1y = touchInfo.touches[1].pageY;

                startDistance = Math.pow(Math.pow(startF1x - startF0x, 2) + Math.pow(startF1y - startF0y, 2), 0.5);

                if ((beforeStartCallback == undefined) || beforeStartCallback(compileInfo())) {
                  touchManager.addEventListener(gestureElement, 'move', moveHandler);
                  touchManager.addEventListener(gestureElement, 'end', endHandler);
                  touchManager.addEventListener(gestureElement, 'cancel', endHandler);

                  if (afterStartCallback) {
                    afterStartCallback(compileInfo());
                  }
                }
              }
            };
            var moveHandler = function (eventInfo, touchInfo) {
              if (touchInfo.touches != undefined && touchInfo.touches.length > 1) {
                eventInfo.preventDefault();
                f0x = touchInfo.touches[0].pageX;
                f0y = touchInfo.touches[0].pageY;
                f1x = touchInfo.touches[1].pageX;
                f1y = touchInfo.touches[1].pageY;

                var distance = Math.pow(Math.pow(f1x - f0x, 2) + Math.pow(f1y - f0y, 2), 0.5);
                scale = distance / startDistance;
                if (scale != 1) {
                  var change = 1 - scale;
                  currentWidth = startWidth - startWidth * change * speedX;

                  if (currentWidth > maxWidth) {
                    currentWidth = maxWidth;
                  }
                  if (currentWidth < minWidth) {
                    currentWidth = minWidth;
                  }

                  currentHeight = startHeight - startHeight * change * speedY;
                  if (currentHeight > maxHeight) {
                    currentHeight = maxHeight;
                  }
                  if (currentHeight < minHeight) {
                    currentHeight = minHeight;
                  }

                  scaledElement.style.width = currentWidth + 'px';
                  scaledElement.style.height = currentHeight + 'px';

                  if (afterChangeCallback) {
                    afterChangeCallback(compileInfo());
                  }
                }
              }
            };
            var endHandler = function (eventInfo, touchInfo) {
              eventInfo.preventDefault();
              touchManager.removeEventListener(gestureElement, 'move', moveHandler);
              touchManager.removeEventListener(gestureElement, 'end', endHandler);
              touchManager.removeEventListener(gestureElement, 'cancel', endHandler);

              if (endCallback) {
                endCallback(compileInfo());
              }
            };

            var compileInfo = function () {
              return {
                "speedX": speedX,
                "speedY": speedY,
                "minWidth": minWidth,
                "minHeight": minHeight,
                "maxWidth": maxWidth,
                "maxHeight": maxHeight,
                "scale": scale,
                "startWidth": startWidth,
                "startHeight": startHeight,
                "currentWidth": currentWidth,
                "currentHeight": currentHeight,

                "startF0x": startF0x,
                "startF0y": startF0y,
                "startF1x": startF1x,
                "startF1y": startF1y,
                "startDistance": startDistance,

                "f0x": f0x,
                "f0y": f0y,
                "f1x": f1x,
                "f1y": f1y
              }
            }
          };

          // Init

          var map = new piletilevi.venuemap.VenueMap();
          map.setConfId(piletilevi.venuemap.Config.confId);
          map.setSectionsMapType(piletilevi.venuemap.Config.sectionMapType);
          map.setSectionsMapImageUrl('');
          map.setShopDomain(piletilevi.venuemap.ASSETS_DOMAIN);
          map.setSections(piletilevi.venuemap.Config.sections);
          map.setEnabledSections(piletilevi.venuemap.Config.enabledSections);
          map.addHandler('sectionSelected', function (sectionId) {
            window.alert('section id: ' + sectionId);
          });
          map.build();
          $element.append(map.getComponentElement());
        }
      };
    }

})();