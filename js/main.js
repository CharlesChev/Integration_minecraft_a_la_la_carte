function positionMapOnPlace(address, coord_x, coord_y) {
    map.getView().setCenter(ol.proj.transform([coord_x, coord_y], 'EPSG:4326', 'EPSG:3857'));
    if(datatype_geopos == 'spw') // temporary adjustment for SPW
        map.getView().setZoom(12);
    else
        map.getView().setZoom(13);
    $('#address_field').val(address);
    $('#search_results').hide();
    var current_center = map.getView().getCenter();
    drawPolygon(current_center[0], current_center[1],true);
    current_center = ol.proj.transform(map.getView().getCenter(), 'EPSG:3857', 'EPSG:2154');
}

function findPlaceAgain(place_name, callback) {
    $.ajax({
        type: 'POST',
        url: config.completion_service_url['ign'].replace('$api_key', config.api_key),
        data: {
            text: place_name,
            type: 'PositionOfInterest,StreetAddress',
            maximumResponses: 10
        },
        success: function(data) {
            response = jQuery.parseJSON(JSON.stringify(data));
            if (response.status == 'OK' && !$('ul li:contains("'+ response.results[0].fulltext + '")').length) {
                // If the API request succeeded and if the response isn't already listed in the search results
                callback(response.results[0]);
            }
        },
        dataType: 'jsonp',
        timeout: 2000
    });
}

function addPositionOnList(value) {
    $('#search_results ul').append('<li onclick="positionMapOnPlace(\'' + value.fulltext.replace('\'', '\\\'') + '\', ' + value.x + ', ' + value.y + ');">' + value.fulltext + '</li>');
}

function sanitize(string) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": ' ',
        "/": '&#x2F;',
    };
    const reg = /[&<>"'/]/ig;
    return string.replace(reg, (match)=>(map[match]));
}

function findPlace(place_name) {
    if(datatype_geopos == 'ign') {//country == 'fr') {
        if (config.completion_provider == 'ign') {
            $.ajax({
                type: 'POST',
                url: config.completion_service_url['ign'].replace('$api_key', config.api_key),
                data: {
                    text: place_name,
                    type: 'PositionOfInterest,StreetAddress',
                    maximumResponses: 10
                },
                success: function(data) {
                    response = jQuery.parseJSON(JSON.stringify(data));
                    if (response.status == 'OK') {
                        $('#search_results ul').empty();
                        $('#search_results').show();
                        $(':not(#search_results)').click(function() {
                            $('#search_results').hide();
                        });
                        $.each(response.results, function(key, value) {
                            if(value.x=="0" && value.y=="0") { // That means that the Postal code has been written first (as in that particular case, Geoportail API returns 0,0)
                                var firstSpace = value.fulltext.indexOf(" ");
                                findPlaceAgain(value.fulltext.substring(firstSpace) + " " + value.fulltext.split(" ")[0], addPositionOnList); // Switching Postal code & City name to prevent Geoportail API bug, then retrying to find the place
                            } else {
                                addPositionOnList(value);
                            }
                        });
                    } else {
                        $('#search_results').hide();
                    }
                },
                dataType: 'jsonp',
                timeout: 2000
            });
        } else {
            $.get(config.completion_service_url['ban'], {q: place_name, limit: 10}, function(data) {
                response = jQuery.parseJSON(JSON.stringify(data));
                if (response.features.length > 0) {
                    $('#search_results ul').empty();
                    $('#search_results').show();
                    $(':not(#search_results)').click(function() {
                        $('#search_results').hide();
                    });
                    $.each(response.features, function(key, value) {
                        $('#search_results ul').append('<li onclick="positionMapOnPlace(\'' + value.properties.label.replace('\'', '\\\'') + '\', ' + value.geometry.coordinates[0] + ', ' + value.geometry.coordinates[1] + ');">' + value.properties.label + '</li>');
                    });
                } else {
                    $('#search_results').hide();
                }
            });
        }
    } else if (datatype_geopos == 'spw') {
        $.get('https://geoservices.wallonie.be/geolocalisation/rest/searchRues/' + place_name, {}, function(data) {
            response = jQuery.parseJSON(JSON.stringify(data));
            if (response.rues.length > 0) {
                $('#search_results ul').empty();
                $('#search_results').show();
                $(':not(#search_results)').click(function() {
                    $('#search_results').hide();
                });
                $.each(response.rues, function(key, value) {
                    $('#search_results ul').append('<li onclick="positionMapOnPlace(\'' + sanitize(value.nom) + ' ' + sanitize(value.cps[0]+"") + ' ' + sanitize(value.commune) + '\', ' + ol.proj.transform([ (value.xMin+value.xMax)/2, (value.yMin+value.yMax)/2 ], 'EPSG:31370', 'EPSG:4326')[0] + ', ' + ol.proj.transform([ (value.xMin+value.xMax)/2, (value.yMin+value.yMax)/2 ], 'EPSG:31370', 'EPSG:4326')[1] + ');">' + sanitize(value.nom) + ' ' + sanitize(value.cps[0]+"") + ' ' + sanitize(value.commune) + '</li>');
                });
            } else {
                $('#search_results').hide();
            }
        });
    } else if (datatype_geopos == 'osm') {
        $.get('https://dev.virtualearth.net/REST/v1/Locations?query=' + place_name + '&key=AiWD0OJSFLjbrMX8P3nXR-Tc6uwDcZFuGVbmixFBxfSp_d0ptrL20rGk_gA0giS_', {}, function(data) {
            response = jQuery.parseJSON(JSON.stringify(data));
            if (response.resourceSets[0].resources.length > 0) {
                $('#search_results ul').empty();
                $('#search_results').show();
                $(':not(#search_results)').click(function() {
                    $('#search_results').hide();
                });
                $.each(response.resourceSets[0].resources, function(key, value) {
                    $('#search_results ul').append('<li onclick="positionMapOnPlace(\'' + sanitize(value.name) + '\', ' + (value.bbox[1]+value.bbox[3])/2 + ', ' + (value.bbox[0]+value.bbox[2])/2 + ');">' + sanitize(value.name) + '</li>');
                });
            } else {
                $('#search_results').hide();
            }
        });
    }  
}

function setDefaultValues() {
    ratio = 1;
    emprise = 2.5;
    empriseY = 0;
    orientation = 0;
    include_underground = 0;
    snow_checked = 0;
    snow_height_min = 0;
    snow_height_max = 5;
    border_filling = 0;
    enlarged_emprise = 0;
    fusion = 0;
    altitude_ratio = 1;
    hypso = 0;
    stream_array = [1,2,3,4,5];
    stream_array_buffer = [1,2,3,4,5];
    eggs = 0;
    storedX = "err";
    storedY = "err";
    captchaCode = "";
    validationCode = "";
    datatype_topo = 'ign';
    datatype_relief = 'ign';
    datatype_geopos = 'ign';
    data_osm_min_height = 0;
    data_osm_max_height = 0;
    data_osm_height = 0;
}

// Load website parameters (API key, projections, URLs, zoom level ...) into config var
$.getJSON('./inc/config.json', {_: new Date().getTime()}, function(data) {
    config = data;
    initDragAbility(); // Openlayers
    getRemainingGenerations();
    // Set a periodic function (event) to refresh remaining generation counter
    setInterval(function() {
        getRemainingGenerations();
    }, 4000);
    //$('.generations_per_day').text(config.generations_per_day);

map = new ol.Map({
    target: 'map_container',
    controls: [
        new ol.control.Zoom(),
        new ol.control.ScaleLine(),
        new ol.control.MousePosition({
            coordinateFormat: ol.coordinate.createStringXY(4),
            projection: 'EPSG:4326',
            className: 'custom-mouse-position',
            target: document.getElementById('mouse_position'),
            undefinedHTML: '&nbsp;'
        })
    ],
    view: new ol.View({
            center: ol.proj.transform(config.default_location, 'EPSG:4326', 'EPSG:3857'),
            zoom: config.default_zoom_level,
            minZoom: 4,
            maxZoom: 18
    }),
    interactions: ol.interaction.defaults().extend([new app.Drag()])
});
initMap();

// Set-up coherence controls for fields (mail, captcha etc) + reverse geocoding event for address field (findPlace function)
$('#address_field').keyup(function() {
    findPlace($('#address_field').val());
});
});


//Travail de Charles

/* script pour slide*/
const slide_un = $('#slide1');
const slide_deux = $('#slide2');

function slide() {
    slide_un.toggle();
    slide_deux.toggle();
}

/* script pour modal "dernière étape" */
let btnGen = document.getElementById('genCarte');
let btnCan = document.getElementById('cancel_button');
let overlay = document.getElementById('derniere_etape_container');
function openModal1(){
    overlay.style.display = 'block';
}
function closeModal(){
    overlay.style.display = 'none';
}
btnGen.addEventListener('click', openModal1);
btnCan.addEventListener('click', closeModal);

/*traitement du formulaire*/
$(document).ready(function(){
    setDefaultValues();

    $("#retourPage").click(function(){
        $("#merci_container").css("display","none");
     }); 

    $('#genCarteForm').on('submit',function(e){
        e.preventDefault();
        let $this = $(this);
        $.ajax({
            url: $this.attr('action'),
            type: $this.attr('method'),
            data: $this.serialize(),
            dataType: 'json',
            success: function(json){
                if(json.response==='ok'){
                    /*renvoie vers la page avec la popup qui pop*/              
                }else{
                    /*faire choses*/
                }
            }

        })
        $("#derniere_etape_container").css("display","none");
        $("#merci_container").css("display","block");
    })
});

/*options présentes si d'autres sont cochées*/
/*Données topographiques --> Monde entier*/
$('#customRadio5').on("click", function(){
    $('#check_monde_entier').css('display','block')
});
$('#customRadio4').on("click", function(){
    $('#check_monde_entier').css('display','none')
});
$('#button_topo').on("click", function(){
    $('#check_monde_entier').css('display','none')
});
/*Données topographiques -> Monde entier -> Aléatoire*/
$('#customRadio7').on("click", function(){
    $('#aleatoire_max_min').css('display','block');   
    $('#monde_entier_hauteur').css('display','none');
});
$('#customRadio6').on("click", function(){
    $('#aleatoire_max_min').css('display','none');   
    $('#monde_entier_hauteur').css('display','block'); 
});
/*Neige*/
$('#button_neige').on("click", function(){
    $('#check_neige').css('display','none')
});
$('#customCheck7').change(function(){
    if ($(this).is(':checked')){
        $('#check_neige').css('display','block');
    }else{
        $('#check_neige').css('display','none');
    }
});
/*minetest, grand relief */
$('#select_platform').change(function(){
    if ($(this).children("option:selected").val() != ""){
        $('#check_platform').css('display','block');
        
        var java = '<option data-subtext="1.12.2" value="minecraft">Minecraft Java Edition</option>';
        var bedrock = '<option data-subtext="1.2.10" value="bedrock">Minecraft Bedrock</option>';
        var edu = '<option data-subtext="1.0.28" value="edu">Minecraft Education Edition</option>';
        var minetest = '<option data-subtext="0.4.16" value="minetest">Minetest</option>';

        var gamePlatform = $(this).children("option:selected").val();
        var gameFormat = $('#select_format');

        gameFormat.find('option')
        .remove()
        .end();

        switch(gamePlatform) {
            case 'windows10':
                gameFormat.append(java);
                gameFormat.append(bedrock);
                gameFormat.append(edu);
                gameFormat.append(minetest);
                break;
            case 'windows7': case 'linux':
                gameFormat.append(java);
                gameFormat.append(minetest);
                break;
            case 'mac':
                gameFormat.append(java);
                break;
            case 'xboxone':
            case 'ios': case 'android':
                gameFormat.append(bedrock);
                break;

        }
    }
});

$('#button_platform').on("click", function(){
    $('#check_platform').css('display','none')
});

$('#relief').change(function(){
    if ($(this).is(':checked')){
        $('.grandRelief').css('display','block');
    }else{
        $('.grandRelief').css('display','none');
    }
});

$('#select_format').change(function(){
    let mine = $(this).children("option:selected").val();
    if (mine == 'minetest'){
        $('#relief').removeAttr("disabled");
    }else{
        $('#relief').attr("disabled", true);
        $("#relief").prop("checked", false);
        $('.grandRelief').css('display','none');
    }
});

$('#select_format').change(function(){
    let mine = $(this).children("option:selected").val();
    if (mine == 'minetest'){
        $('#relief').removeAttr("disabled");
    }else{
        $('#relief').attr("disabled", true);
        $("#relief").prop("checked", false);
        $('.grandRelief').css('display','none');
    }
    
});

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





