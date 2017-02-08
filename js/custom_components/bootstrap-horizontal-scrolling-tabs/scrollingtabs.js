var hidWidth;
var scrollBarWidths = 40;

var widthOfList = function(){
	var itemsWidth = 0;
	$('.scrollingtabs-list li').each(function(){
		var itemWidth = $(this).outerWidth();
		itemsWidth+=itemWidth;
	});
	return itemsWidth;
};

var widthOfHidden = function(){
	return (($('.scrollingtabs-wrapper').outerWidth())-widthOfList()-getLeftPosi())-scrollBarWidths;
};

var getLeftPosi = function(){
	return $('.scrollingtabs-list').position().left;
};

var reAdjust = function(){
	if (($('.scrollingtabs-wrapper').outerWidth()) < widthOfList()) {
		$('.scrollingtabs-scroller-right').show();
	}
	else {
		$('.scrollingtabs-scroller-right').hide();
	}

	if (getLeftPosi()<0) {
		$('.scrollingtabs-scroller-left').show();
	}
	else {
		$('.item').animate({left:"-="+getLeftPosi()+"px"},'slow');
		$('.scrollingtabs-scroller-left').hide();
	}
}

$(window).on('resize',function(e){
	reAdjust();
});

var initScrollers = function(){
	$('.scrollingtabs-scroller-right').click(function() {

		$('.scrollingtabs-scroller-left').fadeIn('slow');
		$('.scrollingtabs-scroller-right').fadeOut('slow');

		$('.scrollingtabs-list').animate({left:"+="+widthOfHidden()+"px"},'slow',function(){

		});
	});

	$('.scrollingtabs-scroller-left').click(function() {

		$('.scrollingtabs-scroller-right').fadeIn('slow');
		$('.scrollingtabs-scroller-left').fadeOut('slow');

		$('.scrollingtabs-list').animate({left:"-="+getLeftPosi()+"px"},'slow',function(){

		});
	});
};



