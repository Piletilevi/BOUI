var SlidingTabs = function(componentElement) {
	var self = this;
	var parentElement;
	var dropdownElement;
	var dropdownListElement;
	var textMore;
	var resizeTimeout;

	var init = function() {
		parentElement = $(componentElement).parent();
		dropdownElement = document.createElement('div');
		dropdownElement.className = 'dropdown sliding-tabs-dropdown hidden-xs';

		var linkElement = document.createElement('a');
		linkElement.className = 'dropdown-toggle';
		$(dropdownElement).append(linkElement);
		$(linkElement).attr('data-toggle', 'dropdown');
		$(linkElement).attr('aria-haspopup', 'true');
		$(linkElement).attr('aria-expanded', 'false');
		$(linkElement).attr('role', 'button');
		$(linkElement).html(textMore + '&nbsp;&nbsp;<span class="caret"></span>');

		dropdownListElement = document.createElement('ul');
		dropdownListElement.className = 'dropdown-menu';
		$(dropdownElement).append(dropdownListElement);

		parentElement.append(dropdownElement);
		$(linkElement).dropdown();
		self.adjustToContainer();
		$(window).on('resize', onResize);
	};
	this.setTextMore = function(text) {
		textMore = text;
	};
	this.adjustToContainer = function() {
		// enable potential overflow
		$(dropdownListElement).children().each(function(i, item) {
			componentElement.appendChild(item);
		});
		var occupiedWidth = 0;
		$(componentElement).children().each(function(i, item) {
			occupiedWidth += item.offsetWidth;
		});
		var containerWidth = parentElement.width();
		if ($(window).width() < 720 || occupiedWidth <= containerWidth) {
			// all tabs can be displayed at once
			$(dropdownElement).hide();
			return;
		}
		// put overflowing tabs into dropdown
		$(dropdownElement).show();
		var desiredWidth = containerWidth - dropdownElement.offsetWidth;
		occupiedWidth = 0;
		$(componentElement).children().each(function(i, item) {
			var child = $(item);
			occupiedWidth += child.width();
			if (occupiedWidth > desiredWidth) {
				child.appendTo($(dropdownListElement));
			}
		});
	};
	this.initialize = function() {
		init();
	};
	this.destroyed = function() {
		window.clearTimeout(resizeTimeout);
		$(window).off('resize', onResize);
	};
	var onResize = function() {
		window.clearTimeout(resizeTimeout);
		window.setTimeout(self.adjustToContainer, 500);
	};
}