// Main navigation list
var navList = $('.navbar .navbar-inner > nav ul.nav li');

// Main navigation link
var navLink = $('.subnavLink');

// Subnavigation content
var navContent = $('.navbar .navbar-inner > div');

// My info navigation link
var myInfo = $('#myinfo');

var myInfoMenu = $('#myinfo .dropdown-menu');

var footer = $("body > footer");

// Navigation link onClick actions
$(navLink).click(function(event) {
	// Add '.active' class for active navigation link
	$(this).parent().siblings().removeClass('active');
	$(this).closest('li').toggleClass('active');

	// Hide & show link badges
	if ( $(this).closest('li').hasClass('active') ) {
		$('.badge', navList).fadeOut('fast');
	} else {
		$('.badge', navList).fadeIn('fast');
	}

	if ($(myInfo).hasClass('open')) {
		$(myInfo).removeClass('open');
	}

	if ($(myInfoMenu).parent().hasClass('open')) {
		$(myInfoMenu).parent().removeClass('open')
		$(myInfoMenu).fadeOut('fast');
	}

	// Add '.in' class for active submenu content
	var subnavID = $(this).attr('href');
	$(navContent).not(subnavID).removeClass();
	$(subnavID).toggleClass('in');

	event.preventDefault();

});

$(myInfo).click( function() {
	// Hide active submenu content
	$(navContent).removeClass('in');

	// Show badges when submenu content is not activated
	$('.badge', navList).fadeIn('fast');
});

// Click outside actions
$(document).click(function() {

	// Hide active submenu content
	$(navContent).removeClass('in');

	// Show badges when submenu content is not activated
	$('.badge', navList).fadeIn('fast');
});

$(document).bind("ajaxSend", function(){
   $('#loadingIcon').css("visibility", "visible");
}).bind("ajaxStop", function(event, xhr, settings){
   $('#loadingIcon').css("visibility", "hidden");
}).bind("ajaxComplete", function(event, xhr, settings){
   $('#loadingIcon').css("visibility", "hidden");
   try {
  	  var obj = jQuery.parseJSON( xhr.responseText );
	  if (obj && obj.redirectURL) {
	     window.location.href=obj.redirectURL;
	     return;
	  }
   } catch (e) {
   }
});

// Preventing perform click outside actions in navigation bar
$(navList).click(function(e) {
	e.stopPropagation();
});

var makeField = function(name, value) {
	return $('<input />').attr({
		type: 'hidden',
		name: name,
		value: value
	});
};

$('.setlang').click(function(event) {
	$('#newLanguage').val( $(this).attr("href") );
	$('#setLanguageForm').submit();
	event.preventDefault();
});

$('.setsalespoint').click(function(event) {
	$('#newSalespoint').val( $(this).attr("href") );
	$('#setSalesPointForm').submit();
	event.preventDefault();
});

String.prototype.replaceAll = function( token, newToken, ignoreCase ) {
    var _token;
    var str = this + "";
    var i = -1;

    if ( typeof token === "string" ) {
        if ( ignoreCase ) {
            _token = token.toLowerCase();
            while( (
                i = str.toLowerCase().indexOf(
                    token, i >= 0 ? i + newToken.length : 0
                ) ) !== -1
            ) {
                str = str.substring( 0, i ) +
                    newToken +
                    str.substring( i + token.length );
            }
        } else {
            return this.split( token ).join( newToken );
        }
    }
	return str;
};
