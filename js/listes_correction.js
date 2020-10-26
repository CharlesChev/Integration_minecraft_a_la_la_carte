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
