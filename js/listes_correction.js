 /*Données topographiques -> Monde entier -> Aléatoire*/
$('#customRadio7').on("click", function(){
	$('#aleatoire_max_min').css('display','block');   
	$('#monde_entier_hauteur').css('display','none');
});
$('#customRadio6').on("click", function(){
	$('#aleatoire_max_min').css('display','none');   
	$('#monde_entier_hauteur').css('display','block'); 
});



/*checkbox consentement données perso*/
$("#radio_15plus").on("click", function(){
	$('#age_moins15').css('display','none');
	$('#derniere_etape_content').css('height','500px');
});
$("#radio_moins15").on("click", function(){
	$('#age_moins15').css('display','block');
	$('#derniere_etape_content').css('height','560px');
});

/*/////////////////////////////////////////////*/
/*a terminé*/
/*afficheage bulle sliders*/
$('#echelleRange').on('mouseenter',function(){
	$('#slider_value').css('display','block');
});
$('#echelleRange').on('mouseleave',function(){
	$('#slider_value').css('display','none');
});


$("#echelleRange").on("change", function(){
	var val = $('#echelleRange').val();
	$("#slider_value").text(val);

	var left = $('#echelleRange')['0']['offsetLeft'];
	var top = $('#echelleRange')['0']['offsetTop'];
	var max = $('#echelleRange').attr('max');
	var min = $('#echelleRange').attr('min');
	var step = $('#echelleRange').attr('step');

	topPos = top - 10;
	console.log(topPos);
	topPos = topPos.toString();
	console.log(topPos);

	$('#slider_value').css('top',topPos+'px');

	console.log(left);
	console.log(top);
	console.log(min);
	console.log(max);
	console.log(step);
	console.log($('#echelleRange'));

});
/////////////////////////////////////////////////////////////////


function errorModal(message ="Ceci est un message d'erreur") {
	$('#error_modal').html('<div id = error_content><div class = "modal_content_wrapper"><div class = "error"><p>'+message+'</p></div> <div class = "modal_button"><button type="button" id ="button_error"class= "button_optional">Fermer</button></div></div></div>');
	$("#error_modal").css("display","block");
	$("#button_error").on("click", function(){
		$("#error_modal").css("display","none");
	});
};	

/*event a sup après modal mis en responsive
$('#testfonc').on("mouseenter",function () {
	errorModal();
});*/

/*toogle ui_container/map en responsive*/
if($(window).width() <= 768){
		$('#ui_container').css("display","none");
		$('#map_container').css("display","block");
		$('#ui_map1').on("click",function(){
			$('#map_container').css("display","none");
			$('#ui_container').css("display","block");
		});

		$('#ui_map2').on("click",function(){
			$('#map_container').css("display","block");
			$('#ui_container').css("display","none");
		});
	}else {
		$('#map_container').css("display","block");
		$('#ui_container').css("display","block");
	}

$(window).resize(function(){
	if($(window).width() <= 768){
		$('#ui_container').css("display","none");
		$('#map_container').css("display","block");
		$('#ui_map1').on("click",function(){
			$('#map_container').css("display","none");
			$('#ui_container').css("display","block");
		});

		$('#ui_map2').on("click",function(){
			$('#map_container').css("display","block");
			$('#ui_container').css("display","none");
		});
	}else {
		$('#map_container').css("display","block");
		$('#ui_container').css("display","block");
	}
});





