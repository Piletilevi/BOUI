(function() {
	'use strict';
	angular.module('boApp')
		.directive('ngConfirmClick', ngConfirmClick);

	ngConfirmClick.$inject = ['$translate'];

	function ngConfirmClick($translate) {
		return {
			priority: -1,
			restrict: 'A',
			link: function(scope, element, attrs) {

				var modalElement;

				element.bind('click', function(e) {
					var message = attrs.ngConfirmClick;
					var description = $translate.instant(attrs.ngConfirmDescription);
					var pointName = attrs.ngPointName;
					description = description.replace('%pointName%', pointName);
					if (message) {
						e.stopImmediatePropagation();
						e.preventDefault();
						$('.bo-confirm-modal').remove();

						modalElement = document.createElement('div');
						modalElement.className = 'modal fade bo-modal bo-confirm-modal';

						var modalDialogElement = document.createElement('div');
						modalDialogElement.className = 'modal-dialog';
						modalElement.appendChild(modalDialogElement);

						var modalContentElement = document.createElement('div');
						modalContentElement.className = 'modal-content';
						modalDialogElement.appendChild(modalContentElement);

						var modalHeaderElement = document.createElement('div');
						modalHeaderElement.className = 'modal-header';
						modalContentElement.appendChild(modalHeaderElement);

						var modalHeaderCloseElement = document.createElement('button');
						modalHeaderCloseElement.className = 'btn btn-sm btn-default bo-close-btn bo-confirm-modal-close';
						modalHeaderCloseElement.innerHTML = '<i class="fa fa-times"></i>';
						modalHeaderElement.appendChild(modalHeaderCloseElement);

						var modalHeaderMessageElement = document.createElement('h4');
						modalHeaderMessageElement.className = 'modal-title';
						modalHeaderMessageElement.innerHTML = message;
						modalHeaderElement.appendChild(modalHeaderMessageElement);

						var modalBodyElement = document.createElement('div');
						modalBodyElement.className = 'modal-body';
						modalBodyElement.innerHTML = description;
						modalContentElement.appendChild(modalBodyElement);

						var modalFooterElement = document.createElement('div');
						modalFooterElement.className = 'modal-footer';
						modalContentElement.appendChild(modalFooterElement);

						var modalFooterSendElement = document.createElement('button');
						modalFooterSendElement.className = 'btn btn-default bo-confirm-modal-submit';
						modalFooterSendElement.innerHTML = $translate.instant('api_send');
						modalFooterElement.appendChild(modalFooterSendElement);

						var modalFooterCloseElement = document.createElement('button');
						modalFooterCloseElement.className = 'btn btn-default bo-confirm-modal-close';
						modalFooterCloseElement.innerHTML = $translate.instant('api_cancel');
						modalFooterElement.appendChild(modalFooterCloseElement);

						document.body.appendChild(modalElement);

						$(modalElement).modal('show');
						$('.dropdown.open .dropdown-toggle').dropdown('toggle');
						$(modalFooterCloseElement).bind('click', function() {
							closeModal();
						});
						$(modalHeaderCloseElement).bind('click', function() {
							closeModal();
						});
						$(modalFooterSendElement).bind('click', function() {
							locateAction();
						});
					}
				});

				function locateAction() {
					scope.$eval(attrs.ngClick);
					closeModal();
				}

				function closeModal() {
					$(modalElement).modal('hide');
				}
			}
		}
	}
})();