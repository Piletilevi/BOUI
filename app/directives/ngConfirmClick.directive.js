(function() {
	'use strict';
	angular.module('boApp')
		.directive('ngConfirmClick', ngConfirmClick);

	function ngConfirmClick() {
		return {
			priority: -1,
			restrict: 'A',
			link: function(scope, element, attrs) {

				var confirmModal;

				element.bind('click', function(e) {
					var message = attrs.ngConfirmClick;
					var description = attrs.ngConfirmDescription;
					if (message) {
						e.stopImmediatePropagation();
						e.preventDefault();
						$('.bo-confirm-modal').remove();
						var modalHtml = '<div class="modal fade bo-modal bo-confirm-modal">' +
							'<div class="modal-dialog">' +
							'	<div class="modal-content">' +
							'		<div class="modal-header">' +
							'			<button type="button" class="btn btn-sm btn-default bo-close-btn bo-confirm-modal-close"><i class="fa fa-times"></i></button>' +
							'			<h4 class="modal-title">' + message + '</h4>' +
							'		</div>' +
							'		<div class="modal-body">' + description +
							'		</div>' +
							'		<div class="modal-footer">' +
							'			<button type="button" class="btn btn-success bo-confirm-modal-submit">Send</button>' +
							'			<button type="button" class="btn btn-default bo-confirm-modal-close">Cancel</button>' +
							'		</div>' +
							'	</div>' +
							'</div>' +
						'</div>';
						$(modalHtml).appendTo('body');
						confirmModal = $('.bo-confirm-modal');
						confirmModal.modal('show');
						$('.dropdown.open .dropdown-toggle').dropdown('toggle');
						confirmModal.find('.bo-confirm-modal-close').bind('click', function() {
							closeModal();
						});
						confirmModal.find('.bo-confirm-modal-submit').bind('click', function() {
							locateAction();
						});
					}
				});

				function locateAction() {
					scope.$eval(attrs.ngClick);
					closeModal();
				}

				function closeModal() {
					confirmModal.modal('hide');
				}
			}
		}
	}
})();