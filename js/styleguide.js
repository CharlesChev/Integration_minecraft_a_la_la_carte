//Active navbar link
$(document).ready(function() {
    $(".navbar-nav--left .nav-link, .nav-submenu .nav-submenu-link").each(function(){
        var $this = $(this);
        if($this.attr('href') == window.location.href.substr(window.location.href.lastIndexOf('/') + 1)){
            $this.parent('li').addClass('is-active');
            $this.append('<span class="sr-only">(page courante)</span>');
            $this.parents('.nav-collapse').collapse('show');
        }
    });
});