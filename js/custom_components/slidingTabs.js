var SlidingTabs = function(elem) {
	var parentElement;
	var element;
	var dropdownWrapper;
	var dropdown;
	var dropdownElements;
	var childrensWidth;
	var textMore;

	var init = function() {
		parentElement = $(elem).parent();
		element = $(elem);
		dropdownWrapper = document.createElement('div');
		dropdownWrapper.className = 'dropdown sliding-tabs-dropdown hidden-xs';

		dropdown = document.createElement('a');
		dropdown.className = 'dropdown-toggle';
		$(dropdownWrapper).append(dropdown);
		$(dropdown).attr('data-toggle', 'dropdown');
		$(dropdown).attr('aria-haspopup', 'true');
		$(dropdown).attr('aria-expanded', 'false');
		$(dropdown).attr('role', 'button');
		$(dropdown).html(textMore + '&nbsp;&nbsp;<span class="caret"></span>');

		dropdownElements = document.createElement('ul');
		dropdownElements.className = 'dropdown-menu';
		$(dropdownWrapper).append(dropdownElements);

		parentElement.append(dropdownWrapper);
		$(dropdown).dropdown();

		onResize();
	}

	var onResize = function() {
		countSizes();
		recountElementChildrensWidth();
		if ($(window).width() < 720) {
			removeAllFromDropdown();
		} else if (childrensWidth > parentElement.width()) {
			addToDropdown();
		} else {
			removeFromDropdown();
		}
	}

	this.setTextMore = function(text) {
		textMore = text;
	}

	var countSizes = function() {
		for (var i = $(elem).children().length; i--;) {
			var child = $($(elem).children()[i]);
			child.attr('originalWidth', child.width());
		}
	}

	var addToDropdown = function() {
		$(dropdownWrapper).show();
		for (var i = $(elem).children().length; i--;) {
			var child = $($(elem).children()[i]);

			if (childrensWidth > parentElement.width()) {
				$(dropdownElements).prepend(child);
				recountElementChildrensWidth();
			} else {
				break;
			}
		}
	}

	var removeFromDropdown = function() {
		for (var i = 0; i < $(dropdownElements).children().length; i++) {
			var child = $($(dropdownElements).children()[i]);
			if (childrensWidth < (parentElement.width() - child.attr('originalWidth'))) {
				element.append(child);
				recountElementChildrensWidth();
			} else {
				break;
			}
		}

		if (!$(dropdownElements).children().length) {
			$(dropdownWrapper).hide();
		}
	}

	var removeAllFromDropdown = function() {
		for (var i = 0; i < $(dropdownElements).children().length; i++) {
			var child = $($(dropdownElements).children()[i]);
			element.append(child);
			recountElementChildrensWidth();
		}
	}

	var recountElementChildrensWidth = function() {
		childrensWidth = $(dropdownWrapper).width();
		for (var i = $(elem).children().length; i--;) {
			var child = $($(elem).children()[i]);
			childrensWidth = child.attr('originalWidth') - 0 + childrensWidth;
		}
	}

	$(window).on('resize', function() {
		onResize();
	});

	this.initialize = function() {
		init();
	}
}