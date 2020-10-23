function registerOrder() {
    /*if ($('input[name="age[]"]:checked').val()=="lessThan15") {
        if(!$('input[type="checkbox"]#personal_data_consentment').is(":checked") 
        || !$('input[type="checkbox"]#parental_data_consentment').is(":checked")) {
            $('#order_validation-modal').modal("hide");
            showCurtains();
            $('#error_message').html('Nous avons besoin de votre accord sur le traitement de vos données personnelles afin de traiter votre demande.');
            $('#error').css("height","140px");
            $('#notification').css('display', 'block');
            $('#error').css('display', 'block');
            return;
        }
    } else if ($('input[name="age[]"]:checked').val()=="moreOrEqThan15") {
        if(!$('input[type="checkbox"]#personal_data_consentment').is(":checked")) {
            $('#order_validation-modal').modal("hide");
            showCurtains();
            $('#error_message').html('Nous avons besoin de votre accord sur le traitement de vos données personnelles afin de traiter votre demande.');
            $('#error').css("height","140px");
            $('#notification').css('display', 'block');
            $('#error').css('display', 'block');
            return;
        }
    } else { // if age hasn't been told
        $('#order_validation-modal').modal("hide");
        showCurtains();
        $('#error_message').html('Vous devez préciser votre âge.');
        $('#error').css("height","140px");
        $('#notification').css('display', 'block');
        $('#error').css('display', 'block');
        return;
    }*/
    
    $('#validate_order').text('Chargement...');
    $('#validate_order').prop('disabled', true);

    // We kept snow_height intact in case the person would re-tick "Snow" checkbox
    // But we are at the order final phase and the person didn't tick again, so we reset snow_height to 0
    if(snow_checked == 0) {
        snow_height_min = 0;
        snow_height_max = 0;
    }

    // force altitude (if it isn't included, generation WON'T work)
    if(!stream_array.includes(1)) {
        stream_array.unshift(1);
    }

    stream_choice = "";
    for(var i = 0; i < stream_array.length-1; i++) {
        stream_choice = stream_choice + stream_array[i] + ",";
    }
    stream_choice = stream_choice + stream_array[i];

    if($('#captcha_response').val()) {
        captchaCode = $('#captcha_response').val();
    }

    // if FUSION is activated we trigger a second layer of confirmation (with a code delivered by mail)
    if($('#validationCode').val()) {
        if($('#validationCode').val() != validationCode && validationCode != "") {
            $("#validationLabel").html("Code de validation (dernière tentative incorrecte!)");
            $('#validate_order').text('Valider');
            $('#validate_order').prop('disabled', false);
            return;
        }
    } else if(parseInt(emprise) > 5) {
        $.post('./inc/email_validation.php', {
            captcha_response: captchaCode,
            requested_by: $("#email_field").val()
        }, function(response) {
            if(response['status'] == 'ERROR') {
                responseErrorTreatment(response);
                $('#validate_order').text('Valider');
                $('#validate_order').prop('disabled', false);
            } else if (response['status'] == 'SUCCESS') {
                validationCode = response['content'];
                $('#generate_map_form').html('Vous devez avoir reçu un mail contenant un code de confirmation. Merci de le renseigner ici.\
                <div id="">\
                    <label id="validationLabel">Code de validation</label><br> <input id="validationCode" name="validationCode" type="text">\
                </div>\
                <button id="validate_order" type="submit" class="btn btn-default">Valider</button>');
            }
        });
        return;
    }

    dataparameters_topo = "0";

    if(data_osm_height != 0) {
        dataparameters_topo = data_osm_height + "";
    } else if(data_osm_min_height != 0 && data_osm_max_height != 0 && data_osm_min_height <= data_osm_max_height) {
        dataparameters_topo = data_osm_min_height + "_" + data_osm_max_height;
    }

    $.post('./inc/register_order.php', {
        captcha_response: captchaCode,
        x_coord: x_coord,
        y_coord: y_coord,
        place: map_name,
        include_underground: include_underground,
        eggs: eggs,
        requested_by: $('#email_field').val(),
        format: $("#game_format").val(),
        data_source_topo: datatype_topo,
        data_source_relief: datatype_relief,
        data_parameters_topo: dataparameters_topo,
        ratio: ratio,
        emprise: emprise,
        empriseY: empriseY,
        //empriseY: (empriseY==0) ? emprise : empriseY,
        angle: orientation,
        snow_height_min: snow_height_min,
        snow_height_max: snow_height_max,
        border_filling: border_filling,
        stream_choice: stream_choice,
        altitude_ratio: altitude_ratio
    }, function(response) {
        if (response['status'] == 'ERROR') {
            responseErrorTreatment(response);
        } else if (response["status"] == 'SUCCESS') {
            $('#order_validation-modal').modal("hide");
            showCurtains();
            $('#success_message').html('Votre commande est prise en compte.');
            var remaining_generations = parseInt($('#download_countdown').text()) - 1;
            var remaining_periodic_generations = parseInt($('#download_periodic_countdown').text()) - 1;
            $('#download_countdown').text(remaining_generations);
            $('#download_periodic_countdown').text(remaining_periodic_generations);
            checkSpelling();
            $('#notification').css('display', 'block');
            $('#success').css('display', 'block');
            $('#address_field').val('');
            $('#email_field, #email_field_confirm').val('');
            $('#email_field, #email_field_confirm').css('color', '#999');
            if (typeof polygon_layer != 'undefined') {
                map.removeLayer(polygon_layer);
                map.removeLayer(orientation_layer);
                map.removeLayer(coordshow_layer);
                //$('#location_popup').hide();
            }
            $("input:checkbox").prop('checked', "");
            $("input:radio").prop('checked', "");
            $('input[name="underground[]"][value="no"]').prop('checked',true);
            datatype_topo_buffer = data_type_topo;
            datatype_relief_buffer = datatype_relief;
            datatype_geopos_buffer = datatype_geopos;
            data_osm_min_height_buffer = data_osm_min_height;
            data_osm_max_height_buffer = data_osm_max_height;
            data_osm_height_buffer = data_osm_height;
            setDefaultValues();
            data_type_topo = data_type_topo_buffer;
            datatype_relief = datatype_relief_buffer;
            datatype_geopos = datatype_geopos_buffer;
            data_osm_min_height = data_osm_min_height_buffer;
            data_osm_max_height = data_osm_max_height_buffer;
            data_osm_height = data_osm_height_buffer;
            refreshFrontWithValues();
        }
        $('#validate_order').text('Valider');
        $('#validate_order').prop('disabled', false);
    });
}

function responseErrorTreatment(response) {
    if (response['error_code'] == 4) {
        $('#wrong_captcha').css('visibility', 'visible');
        $('#captcha_container').css('border', '1px solid #ff0000');
        setTimeout(function() {
            $('#wrong_captcha').css('visibility', 'hidden');
            $('#captcha_container').css('border', '1px solid #e3e3e3');
        }, 2000);
    } else if (response['error_code'] == 12) {
        $('#order_validation-modal').modal("hide");
        showCurtains();
        $('#error_message').html('Plus de générations possibles aujourd\'hui.');
        $('#notification').css('display', 'block');
        $('#error').css('display', 'block');
    } else if (response["error_code"] == 15) {
        $('#order_validation-modal').modal("hide");
        showCurtains();
        $('#error_message').html('Une seule génération vous est permise toutes les 24 heures.');
        $('#notification').css('display', 'block');
        $('#error').css('display', 'block');
    } else if (response["error_code"] == 8) {
        $('#order_validation-modal').modal("hide");
        showCurtains();
        $('#error_message').html('Vérifiez votre format d\'adresse mail (attention les accents ne sont pas autorisés).');
        $('#notification').css('display', 'block');
        $('#error').css('display', 'block');
    } else {
        $('#order_validation-modal').modal("hide");
        showCurtains();
        $('#error_message').html('Un problème est survenu sur nos serveurs.');
        $('#notification').css('display', 'block');
        $('#error').css('display', 'block');
    }
}

function validateOrder() {
    $('#wrong_captcha').css('visibility', 'hidden');
    $('#validate_order').prop('disabled', true);
    /* var french_territory = {
        min_x: -378305.81,
        min_y: 6093283.21,
        max_x: 1212610.74,
        max_y: 7186901.68
    }; // French territory (in Lambert 93). */

    if (typeof polygon_layer != 'undefined') {
        var polygon_extent = polygon_layer.getSource().getExtent(); // [min_x, min_y, max_x, max_y]
        var current_center = ol.proj.transform([polygon_extent[0] + ((polygon_extent[2] - polygon_extent[0]) / 2), polygon_extent[1] + ((polygon_extent[3] - polygon_extent[1]) / 2)], 'EPSG:3857', 'EPSG:4326'); 
        map.getView().setCenter(ol.proj.transform([current_center[0], current_center[1]], 'EPSG:4326', 'EPSG:3857'));
        //map.getView().setZoom(14);
    } else {
        var current_center = map.getView().getCenter();
        //map.getView().setZoom(14);
        drawPolygon(current_center[0], current_center[1], true);
        var current_center = ol.proj.transform(map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326');
    }

    x_coord = current_center[0];
    y_coord = current_center[1];

    showCurtains();

    if(!isOnTerritory(x_coord,y_coord)) {
        $('#error_message').html('La zone sélectionnée n\'est pour le moment pas supportée.');
        $('#notification').css('display', 'block');
        $('#error').css('display', 'block');
        return;
    }

    if($('#checkboxCGU:checked').val() != "on") {
        $('#error_message').html('Veuillez accepter les <a href="doc/CGU_Minecraft_ALAC.pdf" target="_blank">CGU</a>.');
        $('#notification').css('display','block');
        $('#error').css('display','block');
        return;
    }

    if(include_underground == null) {
        $('#error_message').html('Veuillez choisir vos paramètres de sous-sols.');
        $('#notification').css('display','block');
        $('#error').css('display','block');
        return;
    }

    if ($('#email_field').val().length == 0) {
        $('#error_message').html('Veuillez introduire votre adresse e-mail.');
        $('#notification').css('display', 'block');
        $('#error').css('display', 'block');
        return;
    }

    if ($('#game_format').val() == null || $('#game_format').val().length == 0) {
        $('#error_message').html('Vous devez choisir un format de carte.');
        $('#notification').css('display', 'block');
        $('#error').css('display', 'block');
        return;
    }

    var requested_by = $('#email_field').val();
    var pattern = new RegExp(/^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i); // Source: http://stackoverflow.com/a/2855946

    if (pattern.test(requested_by) == false) {
        $('#error_message').html('L\'adresse e-mail introduite n\'est pas valide.');
        $('#notification').css('display', 'block');
        $('#error').css('display', 'block');
        return;
    }
    if ($('#email_field_confirm').val().length == 0) {
        $('#error_message').html('Veuillez confirmer votre adresse e-mail.');
        $('#notification').css('display', 'block');
        $('#error').css('display', 'block');
        return;
    }
    if ($('#email_field_confirm').val() != $('#email_field').val()) {
        console.log($('#email_field').val());
        console.log($('#email_field_confirm').val());
        $('#error_message').html('Les adresses e-mails introduites doivent être identiques.');
        $('#notification').css('display', 'block');
        $('#error').css('display', 'block');
        return;   
    }

    fetchCaptcha();
    $('#captcha_response').val('');
    $('#order_validation-modal').modal("show");
    removeCurtains();

    map_name = 'minecraft_alac'; // This is the default name used for the generated card.
    $.get(config.reverse_geocode_service_url, { lon: parseFloat(x_coord), lat: parseFloat(y_coord) }, function(data) {
        response = jQuery.parseJSON(JSON.stringify(data));
        if (response.features.length > 0) {
            map_name = response.features[0].properties.city; // If we manage to reverse geocode the given coordinates to find the associated place's name, we overwrite the default name.
        }
    });
}

// This is only used for old style modals (as most modals of the page have been replaced by the standard Bootstrap modal)
function showCurtains() {
    $('#curtains').css({
        'display': 'block',
        'width': $(document).width(),
        'height': $(document).height(),
        opacity: 0.7,
    });
    $('body').css('overflow', 'hidden');
}
function removeCurtains() {
    $("#curtains").css("display","none");
    $('body').css('overflow','');
}

function checkCaptchaAndConsent() {
    if ($('#captcha_response').val().length > 0) { // If something is written on the captcha field
        if (/\s/.test($('#captcha_response').val()) == false) {
            if ($('input[name="age[]"]:checked').val()=="lessThan15") { // .. and if the age is less than 15 
                if($('input[type="checkbox"]#personal_data_consentment').is(":checked") // with both personal and parental consent
                && $('input[type="checkbox"]#parental_data_consentment').is(":checked")) {
                    $('#validate_order').prop('disabled', false);
                } else // without
                    $('#validate_order').prop('disabled', true);
            } else if($('input[name="age[]"]:checked').val()=="moreOrEqThan15") { // .. or if the age is more than 15
                if($('input[type="checkbox"]#personal_data_consentment').is(":checked")) { // with personal consent
                    $('#validate_order').prop('disabled', false);
                } else // without
                    $('#validate_order').prop('disabled', true);
            } else { // .. or if the age isn't defined (no radio checked)
                $('#validate_order').prop('disabled', true);
            }
        } else {
            $('#validate_order').prop('disabled', true);
        }
    } else { // Or if nothing is written on the captcha field
        $('#validate_order').prop('disabled', true);
    }
}

function popAboutSection() {
    var period_duration = 24 / config.generation_periods;
    var periods_explanation = "Il y a <b>un nombre fixe de périodes de relâchement de cartes</b> par jour. L'heure du relâchement suivant est indiqué sous le compteur indiquant le nombre de générations restantes sur la période.<br/>";
    periods_explanation += "<b>" + addZero(0) + "h00 :</b> vous avez " + Math.round(config.generations_per_day / config.generation_periods) + " cartes disponibles.";
    for(i=1; i<config.generation_periods; i++) {
        periods_explanation += "<br /><b>" + addZero(period_duration*i%24) + "h00 :</b> vous avez le reste de la précédente période ainsi que " + Math.round(config.generations_per_day / config.generation_periods) + " cartes en plus disponibles.";
    }

    $(".periods_explanation").html(periods_explanation);

    /*$('#curtains').css({
        'display': 'block',
        'width': $(document).width(),
        'height': $(document).height(),
        opacity: 0.7,
    });
    
    $('body').css('overflow', 'hidden');
    $('#about').css('display', 'block');
    $('#about_container').css('display', 'block');*/
}

function popWhySection() {
    $(".next_phase").html(getPeriodHour(config.generation_periods));

    var period_duration = 24 / config.generation_periods;
    var periods_explanation = "<br /><b>" + addZero(0) + "h00 :</b> vous avez " + Math.round(config.generations_per_day / config.generation_periods) + " cartes disponibles.";
    for(i=1; i<config.generation_periods; i++) {
        periods_explanation += "<br /><b>" + addZero(period_duration*i%24) + "h00 :</b> vous avez le reste de la précédente période ainsi que " + Math.round(config.generations_per_day / config.generation_periods) + " cartes en plus disponibles.";
    }
    periods_explanation += "<br />";

    $(".periods_explanation").html(periods_explanation);
    
    /*$('#curtains').css({
        'display': 'block',
        'width': $(document).width(),
        'height': $(document).height(),
        opacity: 0.7,
    });
    $('body').css('overflow', 'hidden');
    $('#why').css('display', 'block');
    $('#why_container').css('display', 'block');*/
}

/*function popPregenMaps() {
    $('#curtains').css({
        'display': 'block',
        'width': $(document).width(),
        'height': $(document).height(),
        opacity: 0.7,
    });
    $('body').css('overflow', 'hidden');
    $('#pregen').css('display', 'block');
    $('#pregen_container').css('display', 'block');
}

function popFormatSelector() {
    $('#curtains').css({
        'display': 'block',
        'width': $(document).width(),
        'height': $(document).height(),
        opacity: 0.7,
    });
    $('body').css('overflow', 'hidden');
    $('#format').css('display', 'block');
    $('#format_container').css('display', 'block');
}*/

function triggerConsentmentCheckboxes() {
    if ($('input[name="age[]"]:checked').val()=="lessThan15") {
        $('input[type="checkbox"]#personal_data_consentment').prop('checked', "");
        $('input[type="checkbox"]#parental_data_consentment').prop('checked', "");
        $('input[type="checkbox"]#personal_data_consentment + label').css("display","block");
        $('input[type="checkbox"]#parental_data_consentment + label').css("display","block");
    } else {
        $('input[type="checkbox"]#personal_data_consentment').prop('checked', "");
        $('input[type="checkbox"]#parental_data_consentment').prop('checked', "");
        $('input[type="checkbox"]#personal_data_consentment + label').css("display","block");
        $('input[type="checkbox"]#parental_data_consentment + label').css("display","none");
    }
}

function closePopup() {
    $('body').css('overflow','');
    $('#curtains, #about, #about_container, #format, #format_container, #pregen, #pregen_container, #why, #why_container, #order_validation, #notification, #error, #success').css('display', 'none');
    $("#error").css("height","120px");
}

function checkSpelling() {
    if ($('#download_countdown').text() > 1) {
        $('#download_countdown_desc').html('Générations restantes aujourd\'hui');
    } else {
        $('#download_countdown_desc').html('Génération restante aujourd\'hui');
    }

    var period_hour = getPeriodHour(config.generation_periods);
        
    if ($('#download_periodic_countdown').text() > 1) {
        $('#download_periodic_countdown_desc').html('Générations restantes jusqu\'à ' + period_hour + "h00");
    } else {
        $('#download_periodic_countdown_desc').html('Génération restante jusqu\'à ' + period_hour + "h00");
    }
}

function filterGameFormat() {
    $('.input-group-format').css("display","table");
    var gamePlatform = $("#game_platform").val();
    var gameFormat = $("#game_format");
    gameFormat.empty();

    var java = '<option data-subtext="1.12.2" value="minecraft">Minecraft Java Edition</option>';
    var bedrock = '<option data-subtext="1.2.10" value="bedrock">Minecraft Bedrock</option>';
    var edu = '<option data-subtext="1.0.28" value="edu">Minecraft Education Edition</option>';
    var minetest = '<option data-subtext="0.4.16" value="minetest">Minetest</option>';

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

    gameFormat.selectpicker('render');
    gameFormat.selectpicker('refresh');
}

function getPeriodHour(generation_periods) {
    var d = new Date();
    var period_duration = 24 / generation_periods;

    for(i=1; i<=generation_periods; i++) {
        if(d.getHours() < period_duration*i) {
            return addZero(period_duration*i%24);
        }
    }
    // If there's a problem with the actual hour or the generation period
    $('#download_countdown').text('0');
    $('#download_periodic_countdown').text('0');
    disableUI();
    return 0;
}

function addZero(hour) {
    if (hour < 10)
        hour = "0" + hour;
    return hour;
}

function toggleUI() {
    $('#ui_container').toggle("display");
    $('#map_container').toggleClass("active");
    map.updateSize();
}

// TODO il reste des activations désactivations à faire ! pour les nouveaux arguments
function enableUI() {
    $('#address_field, #email_field, #email_field_confirm, #game_format, #game_platform, #generate_map').prop('disabled', false);
    $('#address_field, #email_field, #email_field_confirm, #generate_map').removeAttr('Title');
    $("#ratio").slider("enable");
    $("#emprise").slider("enable");
    $("#empriseY").slider("enable");
    $("#orientation").slider("enable");
    $('#game_format').removeAttr('Title');
    $('#game_platform').removeAttr('Title');
    $('#download_countdown, #download_countdown_desc, #download_periodic_countdown, #download_periodic_countdown_desc').css('color', '#666666');
    $('#why_tooltip').css('display','none');
    $('#game_platform,#game_format').selectpicker('refresh');
}

function disableUI() {
    $('#address_field, #email_field, #email_field_confirm, #game_format, #game_platform, #generate_map').prop('disabled', true);
    $('#address_field, #email_field, #email_field_confirm, #generate_map').attr('Title', 'Plus de générations disponibles pour aujourd\'hui.');
    $("#ratio").slider("disable");
    $("#emprise").slider("disable");
    $("#empriseY").slider("disable");
    $("#orientation").slider("disable");
    $('#game_platform').attr('Title', 'Sélectionnez votre plateforme.');
    $('#game_format').attr('Title', 'Format du jeu');
    $('#why_tooltip').css('display','inline-block');
    $('#game_platform,#game_format').selectpicker('refresh');
}

function getRemainingGenerations() {
    $.get('./inc/refresh_counter.php', function(response) {
        if (response['status'] == 'ERROR') {
            $('#download_countdown').text('0');
            $('#download_periodic_countdown').text('0');
            disableUI();
        } else {
            var data = JSON.parse(response['content']);
            if (data.remaining_generations != 0 && data.remaining_periodic_generations != 0) {
                // If daily & periodic generations are remaining, enable the UI
                enableUI();
            } else {
                disableUI();
                if(data.remaining_generations == 0) {
                    // Put daily countdown & periodic countdown in RED
                    // Put periodic countdown to 0 (visual)
                    $('#download_countdown, #download_countdown_desc, #download_periodic_countdown, #download_periodic_countdown_desc').css('color', '#ff0000');
                    data.remaining_periodic_generations = 0;
                } else if(data.remaining_periodic_generations == 0) {
                    // Put periodic countdown in RED
                    $('#download_periodic_countdown, #download_periodic_countdown_desc').css('color', '#ff0000');
                }
            }

            if (data.fusion == 0) {
                $("#checkboxFusion").attr("disabled","true");
                fusionEstimationText = 'Plus de générations disponibles.';
                if(data.fusion_time)
                    fusionEstimationText += 'Retour dans ' + showCorrectTime(data.fusion_estimate);
                $("#checkboxFusion").parent().attr('title', fusionEstimationText)
                                            .tooltip('fixTitle');
            } else {
                $("#checkboxFusion").removeAttr("disabled");
                $("#checkboxFusion").parent().attr('title', 'Ces cartes volumineuses et longues à calculer (jusqu\'à plusieurs jours) sont livrées avec parcimonie : A n\'utiliser que pour un besoin avéré.')
                                            .tooltip('fixTitle');
            }
            
            $('#download_countdown').text(data.remaining_generations);
            $('#download_periodic_countdown').text(data.remaining_periodic_generations);
        }
        checkSpelling();
    });
}

function showCorrectTime(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600*24));
    var h = Math.floor(seconds % (3600*24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);

    var dDisplay = d > 0 ? d + (d == 1 ? " jour, " : " jours, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " heure, " : " heures, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " seconde" : " secondes") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
}

function redrawAndCenterPolygon() {
    if (typeof polygon_layer != 'undefined') {
        var polygon_extent = polygon_layer.getSource().getExtent(); // [min_x, min_y, max_x, max_y]
        var current_center = [polygon_extent[0] + ((polygon_extent[2] - polygon_extent[0]) / 2), polygon_extent[1] + ((polygon_extent[3] - polygon_extent[1]) / 2)]; 
        map.getView().setCenter([current_center[0], current_center[1]]);
        drawPolygon(current_center[0], current_center[1],false);
    }
}

function rotatePoints(center, points, yaw) {
    var res = []
    var angle = yaw * (Math.PI / 180)
    for(var i=0; i<points.length; i++) {
      var p = points[i]
      // translate to center
      var p2 = [ p[0]-center[0], p[1]-center[1] ]
      // rotate using matrix rotation
      var p3 = [ Math.cos(angle)*p2[0] - Math.sin(angle)*p2[1], Math.sin(angle)*p2[0] + Math.cos(angle)*p2[1]]
      // translate back to center
      var p4 = [ p3[0]+center[0], p3[1]+center[1]]
      // done with that point
      res.push(p4)
    }
    return res
}

function drawPolygon(x,y,reproj) {
    if (typeof polygon_layer !== 'undefined')  { // Check if there's already a polygon displayed.
        map.removeLayer(polygon_layer);
        map.removeLayer(orientation_layer);
        map.removeLayer(coordshow_layer);
        //$('#location_popup').hide();
    }

    if(reproj === false && storedX != "err" && storedY != "err") { // if there is no reprojection to do, we use stored [x,y] values from previous reprojection
        // this helps to avoid reprojecting a coordinate when we don't have to reproj (thus avoiding center drift)
        x = storedX;
        y = storedY;
    }

    var mapScalingFactor = ratio / (emprise/5);
    var offset = (2500/mapScalingFactor);
    var offsetY = offset;

    if(empriseY != 0) {
        var mapScalingFactorY = ratio / (empriseY/5);
        offsetY = (2500/mapScalingFactorY);
    }
    
    var coord = ol.proj.transform([x,y], 'EPSG:3857', 'EPSG:4326');
    if(ratio <= 0.01)
        actualProjection = 'EPSG:3857';
    else
        actualProjection = getProjectionFromArea(coord[0],coord[1]);
    var reprojCenter = ol.proj.transform([x,y], 'EPSG:3857', actualProjection);

    oldX = x;
    oldY = y;
    x = reprojCenter[0];
    y = reprojCenter[1];

    if(actualProjection == 'EPSG:3857') {
        offset = offset/Math.cos(coord[1] * (Math.PI/180));
        offsetY = offsetY/Math.cos(coord[1] * (Math.PI/180));
    }

    var polygon_geoJSON = {
        'type': 'FeatureCollection',
        'features': [
        {
            'type': 'Feature',
            'geometry': {
                'type': 'Polygon',
                'coordinates': [
                    [
                        ol.proj.transform(rotatePoints([x,y],[[x-offset,y+offsetY]],orientation)[0], actualProjection, 'EPSG:3857'),
                        ol.proj.transform(rotatePoints([x,y],[[x+offset,y+offsetY]],orientation)[0], actualProjection, 'EPSG:3857'),
                        ol.proj.transform(rotatePoints([x,y],[[x+offset,y-offsetY]],orientation)[0], actualProjection, 'EPSG:3857'),
                        ol.proj.transform(rotatePoints([x,y],[[x-offset,y-offsetY]],orientation)[0], actualProjection, 'EPSG:3857'),
                        ol.proj.transform(rotatePoints([x,y],[[x-offset,y+offsetY]],orientation)[0], actualProjection, 'EPSG:3857')
                    ]
                ]
            }
        }]
    }
    var polygon_source = new ol.source.Vector({
        features: (new ol.format.GeoJSON()).readFeatures(polygon_geoJSON)
    });
    polygon_style = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#666666',
            width: 4
        }),
        fill: new ol.style.Fill({
            color: 'rgba(102, 102, 102, 0.3)'
        })
    });
    polygon_style_unsupported = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#776464',
            width: 4
        }),
        fill: new ol.style.Fill({
            color: 'rgb(167, 151, 151, 0.5)'
        })
    });
    polygon_layer = new ol.layer.Vector({
        source: polygon_source,
        style: polygon_style
    });
    polygon_layer.setZIndex(10);
    map.addLayer(polygon_layer);

    var orientation_source = new ol.source.Vector({
        features: [
            new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform([x,y], actualProjection, 'EPSG:3857'))
            })
        ]
    });
    orientation_layer = new ol.layer.Vector({
        source: orientation_source,
        style: function(feature,resolution) {
            var h = ol.proj.transform(rotatePoints([x,y],[[x-offset,y-offset]],orientation)[0], actualProjection, 'EPSG:3857')[1] - ol.proj.transform(rotatePoints([x,y],[[x+offset,y-offset]],orientation)[0], actualProjection, 'EPSG:3857')[1];
            var l = ol.proj.transform(rotatePoints([x,y],[[x-offset,y-offset]],orientation)[0], actualProjection, 'EPSG:3857')[0] - ol.proj.transform(rotatePoints([x,y],[[x+offset,y-offset]],orientation)[0], actualProjection, 'EPSG:3857')[0];

            var orientation_image = new ol.style.Icon({
                src: '../img/orientation_axis.png',
                rotateWithView: true,
                rotation: -Math.atan(h/l)
              });
            var orientation_style = new ol.style.Style({
                image: orientation_image
            });
            if(ratio >= 1)
                orientation_image.setScale(Math.max(0.05, (1/(ratio / (emprise/5))) * 0.1 * (Math.max(10,map.getView().getZoom())/10%1*10) )); // à retravailler
            else
                orientation_image.setScale(Math.max(0.05, ((1/(ratio / (emprise/5)))/5) * 0.1 * (Math.max(10,map.getView().getZoom())/10%1*10) )); // à retravailler
            return orientation_style;
        }
    });
    orientation_layer.setZIndex(10);
    map.addLayer(orientation_layer);

    coordshow_layer = new ol.layer.Vector({
        source: orientation_source,
        style: function(feature,resolution) {
            var coordshow_style = new ol.style.Style({
                text: new ol.style.Text({
                    text: coord[1].toPrecision(6) + "\n" + coord[0].toPrecision(6),
                    scale: 1.1,
                    fill: new ol.style.Fill({
                      color: '#000000'
                    }),
                    stroke: new ol.style.Stroke({
                      color: '#FFFF99',
                      width: 2.0
                    })
                })
            });
            return coordshow_style;
        }
    });
    coordshow_layer.setZIndex(10);
    map.addLayer(coordshow_layer);

    if(reproj === true) {
        var polygon_extent = polygon_layer.getSource().getExtent(); // [min_x, min_y, max_x, max_y]
        var current_center = [polygon_extent[0] + ((polygon_extent[2] - polygon_extent[0]) / 2), polygon_extent[1] + ((polygon_extent[3] - polygon_extent[1]) / 2)] 
        storedX = current_center[0];
        storedY = current_center[1];
    }

    /*popup_layer = new ol.Overlay({ // This is a little popup used to describe the delimited zone.
        element: document.getElementById('location_popup'),
        positioning: 'center-center',
        stopEvent: false
    });
    map.addOverlay(popup_layer);
    popup_layer.setPosition(map.getView().getCenter());
    $('#location_popup').show();*/
}

function positionMapOnPlace(address, coord_x, coord_y) {
    map.getView().setCenter(ol.proj.transform([coord_x, coord_y], 'EPSG:4326', 'EPSG:3857'));
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
        $.get('http://geoservices.wallonie.be/geolocalisation/rest/searchRues/' + place_name, {}, function(data) {
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
        $.get('https://nominatim.openstreetmap.org/search?q=' + place_name + '&format=json', {}, function(data) {
            response = jQuery.parseJSON(JSON.stringify(data));
            if (response.length > 0) {
                $('#search_results ul').empty();
                $('#search_results').show();
                $(':not(#search_results)').click(function() {
                    $('#search_results').hide();
                });
                $.each(response, function(key, value) {
                    $('#search_results ul').append('<li onclick="positionMapOnPlace(\'' + sanitize(value.display_name) + '\', ' + value.lon + ', ' + value.lat + ');">' + sanitize(value.display_name) + '</li>');
                });
            } else {
                $('#search_results').hide();
            }
        });
    }
   
}

function getLayer(layer_id) {
    var projection = new ol.proj.get(config.projection);
    var projection_extent = projection.getExtent();
    var max_resolution = ol.extent.getWidth(projection_extent) / 256;
    var resolutions = new Array(19);
    var matrix_ids = new Array(19);

    for (var i = 0; i <= 19; i++) {
        resolutions[i] = max_resolution / Math.pow(2, i);
        matrix_ids[i] = i;
    }

    layer = new ol.layer.Tile({
        extent: projection_extent,
        source: new ol.source.WMTS({
            url: config.wmts_service_url.replace('$api_key', config.api_key),
            version: config.wmts_service_version,
            layer: config.layers[layer_id].id,
            style: config.layers[layer_id].style,
            format: config.layers[layer_id].format,
            matrixSet: 'PM',
            tileGrid: new ol.tilegrid.WMTS({
                origin: ol.extent.getTopLeft(projection_extent),
                resolutions: resolutions,
                matrixIds: matrix_ids
            })
        })
    });

    return layer;
}

function reinitMap() {
    if(datatype_geopos == 'osm') {
        if (layerExists(bdortho)) map.removeLayer(bdortho);
        if (layerExists(transportnet)) map.removeLayer(transportnet);
        if (layerExists(scanexpress)) map.removeLayer(scanexpress);
        map.addLayer(osm);
        map.addControl(attributionControls);
    } else {
        if (layerExists(osm)) map.removeLayer(osm);
        if (layerExists(attributionControls)) map.removeControl(attributionControls);
        initMap();
        moveend_function();
    }
}

function initMap() {
    var projection = new ol.proj.get(config.projection);
    var projection_extent = projection.getExtent();
    var max_resolution = ol.extent.getWidth(projection_extent) / 256;
    var resolutions = new Array(19);
    var matrix_ids = new Array(19);

    for (var i = 0; i <= 19; i++) {
        resolutions[i] = max_resolution / Math.pow(2, i);
        matrix_ids[i] = i;
    }

    bdortho = getLayer(0, config);
    transportnet = getLayer(1, config);
    scanexpress = getLayer(2, config);
    attributionControls = new ol.control.Attribution({
        collapsible: false
    });
    osm = new ol.layer.Tile({
        source: new ol.source.OSM()
    });
    orthophotos_spw = new ol.layer.Tile({
        source: new ol.source.TileWMS({
        url: 'http://geoservices.wallonie.be/arcgis/services/IMAGERIE/ORTHO_2018/MapServer/WMSServer?',
        params: {LAYERS: '0'}
        })
        });

    map.addLayer(bdortho);
    map.addLayer(transportnet);

    zoom_level = map.getView().getZoom();
    wasOnSPM = 0;

    moveend_function = function() { // Display/hide some layers according to the zoom level.
        var new_zoom_level = map.getView().getZoom();
        
        var extent = map.getView().getCenter();
        extent = ol.proj.transform(extent, 'EPSG:3857', 'EPSG:4326');
        
        if(datatype_geopos != 'osm') {
        if(isInSPM(extent[0],extent[1])) {
            if (layerExists(scanexpress)) {
                map.removeLayer(scanexpress);
                map.addLayer(bdortho);
                map.addLayer(transportnet);
            }
            wasOnSPM = 1;
        } else {
            if ((new_zoom_level < 16) && (zoom_level >= 16)) {
                if(layerExists(bdortho)) map.removeLayer(bdortho);
                if(layerExists(transportnet)) map.removeLayer(transportnet);
                map.addLayer(scanexpress);
            }
            if ((new_zoom_level >= 16) && (zoom_level < 16)) {
                if(layerExists(scanexpress)) map.removeLayer(scanexpress);
                if (datatype_geopos == 'spw' || isInBEL(extent[0],extent[1])) {
                    map.addLayer(orthophotos_spw);
                } /*else {*/
                    map.addLayer(bdortho);
                    map.addLayer(transportnet);
                //}
            }
            if(wasOnSPM == 1) {
                wasOnSPM = 0;
                if(layerExists(bdortho)) map.removeLayer(bdortho);
                if(layerExists(transportnet)) map.removeLayer(transportnet);
                map.addLayer(scanexpress);
            }
        }
        }
        zoom_level = new_zoom_level;
    };

    map.on('moveend', moveend_function);
}

function layerExists(layer) {
    for (var i=0;i<map.getLayers().getLength();i++) {
        if (map.getLayers().getArray()[i] === layer) // If the layer is present in the map
            return true;
    }
    return false;
}

function isInSPM(long,lat) {
    if((long < -64.7809) || (long > -47.4554) || (lat < 42.1980) || (lat > 50.3227))  // St-Pierre et Miquelon display area
        return false;
    else
        return true;
}

function isInBEL(long,lat) {
    if((long < 2.54) || (long > 6.41) || (lat < 49.49) || (lat > 51.55))  // Belgium display area
        return false;
    else
        return true;
}

function isOnTerritory(long,lat) {
    if(ratio <= 0.01 || datatype_topo == 'osm' || datatype_geopos == 'osm') // if ratio<=0.01 it's SRTM, so allow overseas mapping
        return true;

    /* TODO WALLONIE BOUNDARIES */

    // /!\ TEMPORARY ... To improve in the future (conditions are not clean)
    if ((long < -5.22) || (long > 9.6) || (lat < 41.3) || (lat > 51.1))  // Those coordinates are France's territory in WGS84.
        if ((long < 44.88) || (long > 45.33) || (lat < -13.1) || (lat > -12.53))  // Those coordinates are Mayotte's territory in WGS84.
            if((long < 55.18) || (long > 55.85) || (lat < -21.40) || (lat > -20.85))  // Those coordinates are Reunion's territory in WGS84.
                if((long < -61.25) || (long > -60.78) || (lat < 14.37) || (lat > 14.91))  // Those coordinates are Martinique's territory in WGS84.
                    if((long < -61.83) || (long > -60.97) || (lat < 15.81) || (lat > 16.54))  // Those coordinates are Guadeloupe's territory in WGS84.
                        if((long < -54.67) || (long > -51.44) || (lat < 2.06) || (lat > 5.86)) // Those coordinates are Guyane's territory in WGS84
                            if((long < -56.52) || (long > -56.07) || (lat < 46.74) || (lat > 47.16))  // Those coordinates are St-Pierre et Miquelon's territory in WGS84.
                                return false;
    return true;
}

function isXOnTerritory(long) {
    /* TODO WALLONIE BOUNDARIES */
    // /!\ TEMPORARY ... To improve in the future (conditions are not clean)
    if ((long < -5.22) || (long > 9.6))  // Those coordinates are France's territory in WGS84.
        if ((long < 44.88) || (long > 45.33))  // Those coordinates are Mayotte's territory in WGS84.
            if((long < 55.18) || (long > 55.85))  // Those coordinates are Reunion's territory in WGS84.
                if((long < -61.25) || (long > -60.78))  // Those coordinates are Martinique's territory in WGS84.
                    if((long < -61.83) || (long > -60.97))  // Those coordinates are Guadeloupe's territory in WGS84.
                        if((long < -54.67) || (long > -51.44)) // Those coordinates are Guyane's territory in WGS84
                            if((long < -56.52) || (long > -56.07))  // Those coordinates are St-Pierre et Miquelon's territory in WGS84.
                                return false;
    return true;
}

function isYOnTerritory(lat) {
    /* TODO WALLONIE BOUNDARIES */
    // /!\ TEMPORARY ... To improve in the future (conditions are not clean)
    if ((lat < 41.3) || (lat > 51.1))  // Those coordinates are France's territory in WGS84.
        if ((lat < -13.1) || (lat > -12.53))  // Those coordinates are Mayotte's territory in WGS84.
            if((lat < -21.40) || (lat > -20.85))  // Those coordinates are Reunion's territory in WGS84.
                if((lat < 14.37) || (lat > 14.91))  // Those coordinates are Martinique's territory in WGS84.
                    if((lat < 15.81) || (lat > 16.54))  // Those coordinates are Guadeloupe's territory in WGS84.
                        if((lat < 2.06) || (lat > 5.86)) // Those coordinates are Guyane's territory in WGS84
                            if((lat < 46.74) || (lat > 47.16))  // Those coordinates are St-Pierre et Miquelon's territory in WGS84.
                                return false;
    return true;
}

function getProjectionFromArea(long,lat) {
    if(datatype_geopos == 'osm')
        return 'EPSG:3857';
    else if(datatype_geopos == 'spw')
        return 'EPSG:31370';
    else if ((long > -5.22) && (long < 9.6) && (lat > 41.3) && (lat < 51.1)) // Those coordinates are France's territory in WGS84
        return 'EPSG:2154';
    else if((long > 44.88) && (long < 45.33) && (lat > -13.1) && (lat < -12.53)) // Those coordinates are Mayotte's territory in WGS84.
        return 'EPSG:4471';
    else if((long > 55.18) && (long < 55.85) && (lat > -21.40) && (lat < -20.85)) // Those coordinates are Reunion's territory in WGS84.
        return 'EPSG:2975';
    else if((long > -61.25) && (long < -60.78) && (lat > 14.37) && (lat < 14.91))  // Those coordinates are Martinique's territory in WGS84.
        return 'EPSG:32620';
    else if((long > -61.83) && (long < -60.97) && (lat > 15.81) && (lat < 16.54))  // Those coordinates are Guadeloupe's territory in WGS84.
        return 'EPSG:32620';
    else if((long > -54.67) && (long < -51.44) && (lat > 2.06) && (lat < 5.86)) // Those coordinates are Guyane's territory in WGS84
        return 'EPSG:2972';
    else if((long > -56.52) && (long < -56.07) && (lat > 46.74) && (lat < 47.16))  // Those coordinates are St-Pierre et Miquelon's territory in WGS84.
        return 'EPSG:4467';
    else
        return 'EPSG:2154';
}

function initDragAbility() { // http://openlayers.org/en/v3.6.0/examples/drag-features.html
    window.app = {};
    var app = window.app;
    app.Drag = function() {
        ol.interaction.Pointer.call(this, {
            handleDownEvent: app.Drag.prototype.handleDownEvent,
            handleDragEvent: app.Drag.prototype.handleDragEvent,
            handleMoveEvent: app.Drag.prototype.handleMoveEvent,
            handleUpEvent: app.Drag.prototype.handleUpEvent
        });
        this.coordinate_ = null;
        this.cursor_ = 'pointer';
        this.feature_ = null;
        this.previousCursor_ = undefined;
    };

    ol.inherits(app.Drag, ol.interaction.Pointer);

    app.Drag.prototype.handleDownEvent = function(evt) {
        var map = evt.map;
        var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
            return feature;
        });

        if (feature) {
            this.coordinate_ = evt.coordinate;
            this.feature_ = feature;
        }

        return !!feature;
    };

    app.Drag.prototype.handleDragEvent = function(evt) {
        var map = evt.map;
        var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
            return feature;
        });

        var deltaX = evt.coordinate[0] - this.coordinate_[0];
        var deltaY = evt.coordinate[1] - this.coordinate_[1];

        //this.feature_.getGeometry() => geometry du feature cliqué
        var geomList = [polygon_layer.getSource().getFeatures()[0].getGeometry(),orientation_layer.getSource().getFeatures()[0].getGeometry()]

        geomList.forEach(function (geometry) {
            geometry.translate(deltaX, deltaY);
        });

        var coord = ol.proj.transform([ polygon_layer.getSource().getExtent()[0] + ((polygon_layer.getSource().getExtent()[2] - polygon_layer.getSource().getExtent()[0]) / 2),polygon_layer.getSource().getExtent()[1] + ((polygon_layer.getSource().getExtent()[3] - polygon_layer.getSource().getExtent()[1]) / 2)], 'EPSG:3857', 'EPSG:4326');

        var evtCoord = ol.proj.transform([ evt.coordinate[0],evt.coordinate[1] ], 'EPSG:3857', 'EPSG:4326');
        if(isOnTerritory(evtCoord[0],evtCoord[1])) {
            storedX = evt.coordinate[0];
            storedY = evt.coordinate[1];
            drawPolygon(storedX,storedY,false);
        }

        geomList.forEach(function (geometry) {
            if(!isOnTerritory(coord[0],coord[1])) {
                //$('#location_popup').addClass("location_popup_unsupported");
                polygon_layer.setStyle(polygon_style_unsupported);
                //$('#location_popup').html('La zone que vous cherchez à atteindre n\'est pas supportée');
    
                if(isXOnTerritory(coord[0]))
                    geometry.translate(0,-deltaY);
                else if(isYOnTerritory(coord[1]))
                    geometry.translate(-deltaX,0);
                else
                    geometry.translate(-deltaX,-deltaY);
            } else {
                //$('#location_popup').removeClass("location_popup_unsupported");
                polygon_layer.setStyle(polygon_style);
                actualProjection = getProjectionFromArea(coord[0],coord[1]);
                coordshow_layer.setStyle(new ol.style.Style({
                    text: new ol.style.Text({
                        text: coord[1].toPrecision(6) + "\n" + coord[0].toPrecision(6),
                        scale: 1.1,
                        fill: new ol.style.Fill({
                          color: '#000000'
                        }),
                        stroke: new ol.style.Stroke({
                          color: '#FFFF99',
                          width: 2.0
                        })
                    })
                }));
                //$('#location_popup').html('La zone délimitée représente<br />l\'étendue de la carte à générer.');
            }
        });

        this.coordinate_[0] = evt.coordinate[0];
        this.coordinate_[1] = evt.coordinate[1];

        /*if (typeof popup_layer != 'undefined') {
            var polygon_extent = polygon_layer.getSource().getExtent(); // [min_x, min_y, max_x, max_y]
            popup_layer.setPosition([
                polygon_extent[0] + ((polygon_extent[2] - polygon_extent[0]) / 2),
                polygon_extent[1] + ((polygon_extent[3] - polygon_extent[1]) / 2)
            ]);
        }*/
    };

    app.Drag.prototype.handleMoveEvent = function(evt) {
        if (this.cursor_) {
            var map = evt.map;
            var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
                return feature;
            });
            var element = evt.map.getTargetElement();
            if (feature) {
                if (element.style.cursor != this.cursor_) {
                    this.previousCursor_ = element.style.cursor;
                    element.style.cursor = this.cursor_;
                }
            } else if (this.previousCursor_ !== undefined) {
                element.style.cursor = this.previousCursor_;
                this.previousCursor_ = undefined;
            }
        }
    };

    app.Drag.prototype.handleUpEvent = function(evt) {
        this.coordinate_ = null;
        this.feature_ = null;
        return false;
    };
}

function fetchCaptcha() {
    $.get('./inc/generate_captcha.php', function(response) {
        $('#captcha').attr('src', response);
    });
}

function checkCompetitionInViewport() {
    if(!$(".competition").isInViewport() && $(".competition-header").length <= 0) {
        $("body").prepend('<div class="competition-header"><a class="btn" href="https://villesterritoires-minecraft.gouv.fr" target="_blank"><img src="../img/logo_jeu_concours.png"></a></div>');
    } else if($(".competition").isInViewport() && $(".competition-header").length > 0) {
        $(".competition-header").remove();
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

function refreshFrontWithValues() {
    $("#checkboxUnderground").prop("checked", include_underground).change();
    $("#checkboxEggs").prop("checked", eggs).change();
    $("#checkboxSnow").prop("checked", snow_checked).change();
    $("#checkboxBorderfilling").prop("checked", border_filling).change();
    $('#checkboxHypsometric').prop("checked", hypso).change();
    $('#checkboxBuildingsTrace').prop("checked", false).change();
    $('#checkboxBuildings').prop("checked", false).change();
    $('#checkboxEmprise').prop("checked", enlarged_emprise).change();
    $('#checkboxFusion').prop("checked", fusion).change();

    $("input:checkbox[name=stream]").each(function() {
        if(!stream_array.includes(index)) {
            $(this).prop('checked',false);
        }
        index++;
    });
    $("input:checkbox[name=stream]").trigger('change');

    $('#ratio').slider('setValue', ratio, true).change();
    $('#emprise').slider('setValue', emprise, true).change();
    $('#empriseY').slider('setValue', empriseY, true).change();
    $('#orientation').slider('setValue', orientation, true).change();
    $('#altitudeRatio').slider('setValue', altitude_ratio, true).change();
    $('#snowMin').slider('setValue', snow_height_min, true).change();
    $('#snowMax').slider('setValue', snow_height_max, true).change();

    if(datatype_relief=='ign')
        $('#checkboxReliefIGN').prop('checked',true).change();
    else if(datatype_relief=='srtm')
        $('#checkboxReliefSRTM').prop('checked',true).change();
    else
        $('#checkboxReliefNONE').prop('checked',true).change();
    $('#checkboxTopoIGN').prop('checked',(datatype_topo=='ign' ? 1 : 0)).trigger('change');
    $('#checkboxOSMfixed').prop('checked',(data_osm_height>0 ? 1 : 0)).trigger('change');
}

function changeGeopos() {
    if($("#country").val() == 'fr') {
        datatype_geopos = 'ign';
    } else if($("#country").val() == 'be_wa') {
        datatype_geopos = 'spw';
    } else {
        datatype_geopos = 'osm';
    }
    /*if(datatype_geopos == 'ign') datatype_geopos = 'osm';
    else if(datatype_geopos == 'osm') datatype_geopos = 'ign';*/

    $('#checkboxTopoIGN').prop('checked',(datatype_geopos!='osm' ? 1 : 0)).change();
    if(datatype_geopos == 'osm') { datatype_relief = 'srtm'; datatype_topo = 'osm'; data_osm_height = 10; $('#checkboxReliefSRTM').prop('checked',1).change(); }
    else if(datatype_geopos != 'osm') { datatype_relief = 'ign'; datatype_topo = 'ign'; $('#checkboxReliefIGN').prop('checked',1).change(); }
    
    reinitMap();
}

// When we load the page at first
$(document).ready(function() {    
    // (not important) Get viewport width and height to check if there are elements which aren't shown
    $.fn.isInViewport = function() {
        var win = $(window);
        
        var viewport = {
            top : win.scrollTop(),
            left : win.scrollLeft()
        };
        viewport.right = viewport.left + win.width();
        viewport.bottom = viewport.top + win.height();
        
        var elemtHeight = this.height();// Get the full height of current element
        elemtHeight = Math.round(elemtHeight);// Round it to whole humber
        
        var bounds = this.offset();// Coordinates of current element
        bounds.top = bounds.top + elemtHeight;
        bounds.right = bounds.left + this.outerWidth();
        bounds.bottom = bounds.top + this.outerHeight();
        
        return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));        
    };

    var viewport_width = $(window).width();
    var viewport_height = $(window).height();

    //checkCompetitionInViewport();

    // Responsive stuff (hide left UI panel when having mobile viewport)
    $(window).resize(function() {
        viewport_width = $(this).width();
        viewport_height = $(this).height();
        $('#curtains').css('width', viewport_width);
        if(viewport_width>767 && !$('#map_container').hasClass("active"))
            $('#ui_container').css("display","block");
        else if(viewport_width<767 && !$('#map_container').hasClass("active"))
            $('#ui_container').css("display","none");
        //checkCompetitionInViewport();
    });

    // Again responsive stuff for OpenLayers map container (resize)
    $(window).scroll(function(){
        if($(window).scrollTop() < 40) {
            $("#map_container").css({
                top: 40 - $(window).scrollTop()
            });
            map.updateSize(); // Prevent stretching of OpenLayers map
        } else if ($(window).scrollTop() > 40) {
            $("#map_container").css({
                top: '0px'
            });
            map.updateSize(); // Prevent stretching of OpenLayers map
        }
        //checkCompetitionInViewport();
    });

    // Manually add some projections which aren't included in proj4js
    proj4.defs("EPSG:4471","+proj=utm +zone=38 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"); // Mayotte
    proj4.defs("EPSG:2975","+proj=utm +zone=40 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"); // Reunion
    proj4.defs("EPSG:32620","+proj=utm +zone=20 +datum=WGS84 +units=m +no_defs"); // Martinique & Guadeloupe
    proj4.defs("EPSG:2972","+proj=utm +zone=22 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"); // Guyane FR
    proj4.defs("EPSG:4467","+proj=utm +zone=21 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"); // SPM
    proj4.defs("EPSG:31370","+proj=lcc +lat_1=51.16666723333333 +lat_2=49.8333339 +lat_0=90 +lon_0=4.367486666666666 +x_0=150000.013 +y_0=5400088.438 +ellps=intl +towgs84=-106.868628,52.297783,-103.723893,0.336570,-0.456955,1.842183,-1.2747 +units=m +no_defs"); // BELGIQUE WALLONIE
    proj4.defs("EPSG:102016","+proj=aeqd +lat_0=90 +lon_0=0 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs");    

    $('input, textarea').placeholder();
        // Tous les sites IGN part
    $('.dropdown').mouseenter(function() {
        $('#chevron').removeClass('glyphicon-menu-down').addClass('glyphicon-menu-up');
    });
    $('.dropdown').mouseleave(function() {
        $('#chevron').removeClass('glyphicon-menu-up').addClass('glyphicon-menu-down');
    });
    // Reset fields
    $('#address_field').val('');
    $('#email_field').val('');
    $('#game_platform').val('');
    // Force user to reconfirm CGU, consentment etc.
    $("input:checkbox").prop('checked', "");
    $("input:radio").prop('checked', "");
    $('input[name="underground[]"][value="no"]').prop('checked',true);
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });

    // Prevent copy/paste in email confirmation field
    $('#email_field_confirm').bind('paste', function (e) {
       e.preventDefault();
       return false;
    });

    $(document).on("cut copy paste","#email_field_confirm",function(e) {
        e.preventDefault();
        return false;
    });

    // Advanced options modal
    $(".input-group-addon.input-show-options").click(function(){
        jsPanel.create({
            id: 'advanced-options',
            headerTitle: 'Options avancées',
            position:    'left-top 0 ' + ($(".input-show-options").offset().top - 240),
            contentSize: { width:$("#ui_container").width(), height: 'auto' },
            headerControls: {
                maximize: 'remove' 
            },
            content:     '<!-- début modal -->\
            <ul class="nav nav-tabs">\
                <li class="active"><a data-toggle="tab" href="#data">Sources</a></li>\
                <li><a data-toggle="tab" href="#them">Thématiques</a></li>\
                <li><a data-toggle="tab" href="#geo">Géographiques</a></li>\
            </ul>\
            <div class="tab-content">\
                <div class="tab-pane fade in active" id="data">\
                    <h4>Données du relief</h4>\
                    <div class="pretty p-icon p-smooth green_white_checkbox">\
                        <input type="checkbox" name="checkboxReliefIGN" id="checkboxReliefIGN" checked>\
                        <div class="state p-success">\
                            <label class="label_relief_ign" for="checkboxReliefIGN"><i class="icon mdi mdi-check"></i> Pas de 1m sur France ou Wallonie uniquement</label>\
                        </div>\
                    </div><br/>\
                    <div class="pretty p-icon p-smooth green_white_checkbox">\
                        <input type="checkbox" name="checkboxReliefSRTM" id="checkboxReliefSRTM">\
                        <div class="state p-success">\
                            <label class="label_relief_srtm" for="checkboxReliefSRTM"><i class="icon mdi mdi-check"></i> SRTM3 (pas de 90m sur le monde entier)</label>\
                        </div>\
                    </div><br/>\
                    <div class="pretty p-icon p-smooth green_white_checkbox">\
                        <input type="checkbox" name="checkboxReliefNONE" id="checkboxReliefNONE">\
                        <div class="state p-success">\
                            <label class="label_relief_none" for="checkboxReliefNONE"><i class="icon mdi mdi-check"></i> Pas de données relief</label>\
                        </div>\
                    </div>\
                    <br/><br/>\
                    <h4>Données topographiques</h4>\
                    <div class="pretty p-icon p-smooth green_white_checkbox">\
                        <input type="checkbox" name="checkboxTopoIGN" id="checkboxTopoIGN" checked>\
                        <div class="state p-success">\
                            <label class="label_topo_ign" for="checkboxTopoIGN"><i class="icon mdi mdi-check"></i> IGN ou SPW (sur la France ou la Wallonie uniquement)</label>\
                        </div>\
                    </div><br/>\
                    <div class="pretty p-icon p-smooth green_white_checkbox" data-toggle="tooltip" title="La très grande majorité des bâtiments OSM ne disposant pas de hauteur enregistrée, une valeur par défaut doit être proposée">\
                        <input type="checkbox" name="checkboxTopoOSM" id="checkboxTopoOSM">\
                        <div class="state p-success">\
                            <label class="label_topo_osm" for="checkboxTopoOSM"><i class="icon mdi mdi-check"></i> OSM (sur le monde entier)</label>\
                        </div>\
                    </div><br/>\
                    <div class="pretty p-icon p-smooth green_white_checkbox osmCheckboxes hidden" style="margin-left: 42px;">\
                        <input type="checkbox" name="checkboxOSMfixed" id="checkboxOSMfixed">\
                        <div class="state p-success">\
                            <label class="label_fixed_osm" for="checkboxOSMfixed"><i class="icon mdi mdi-check"></i> Fixe</label>\
                        </div>\
                    </div><br/>\
                    <div class="pretty p-icon p-smooth green_white_checkbox osmCheckboxes hidden" style="margin-left: 42px;">\
                        <input type="checkbox" name="checkboxOSMrandom" id="checkboxOSMrandom">\
                        <div class="state p-success">\
                            <label class="label_random_osm" for="checkboxOSMrandom"><i class="icon mdi mdi-check"></i> Aléatoire</label>\
                        </div>\
                    </div><br/>\
                    <div class="input-group osmInputGroupFixed hidden">\
                        <span class="input-group-addon">Hauteur</span>\
                        <input id="osmHeight" data-slider-id="osmHeightSlider" type="text" data-slider-min="2" data-slider-max="100" data-slider-step="1" data-slider-value="10"/>\
                    </div>\
                    <div class="input-group osmInputGroupRandom hidden">\
                        <span class="input-group-addon">Hauteur min</span>\
                        <input id="minOsmHeight" data-slider-id="minOsmHeightSlider" type="text" data-slider-min="2" data-slider-max="100" data-slider-step="1" data-slider-value="10"/>\
                    </div>\
                    <div class="input-group osmInputGroupRandom hidden">\
                        <span class="input-group-addon">Hauteur max</span>\
                        <input id="maxOsmHeight" data-slider-id="maxOsmHeightSlider" type="text" data-slider-min="2" data-slider-max="100" data-slider-step="1" data-slider-value="10"/>\
                    </div>\
                </div>\
                <div class="tab-pane fade" id="geo">\
                    <div class="input-group echelle">\
                        <span class="input-group-addon">Échelle</span>\
                        <input id="ratio" data-slider-id="ratioSlider" type="text" data-slider-min="1" data-slider-max="2" data-slider-step="0.1" data-slider-value="1"/>\
                    </div>\
                    <div class="input-group">\
                        <span class="input-group-addon empriseX">Emprise</span>\
                        <input id="emprise" data-slider-id="empriseSlider" type="text" data-slider-min="0.5" data-slider-max="5" data-slider-step="0.1" data-slider-value="5"/>\
                    </div>\
                    <div class="input-group empriseYinputgroup hidden">\
                        <span class="input-group-addon">Emprise en Y</span>\
                        <input id="empriseY" data-slider-id="empriseYSlider" type="text" data-slider-min="6" data-slider-max="25" data-slider-step="1" data-slider-value="6"/>\
                    </div>\
                    <div class="input-group orientation">\
                        <span class="input-group-addon input-group-addon-smallest">Orientation</span>\
                        <input id="orientation" data-slider-id="orientationSlider" type="text" data-slider-min="-90" data-slider-max="90" data-slider-step="1" data-slider-value="0"/>\
                    </div><br/><br/>\
                    <h4>Cartes particulières</h4>\
                    <div class="pretty p-icon p-smooth green_white_checkbox" data-toggle="tooltip" title="Ces cartes volumineuses et longues à calculer (jusqu\'à plusieurs jours) sont livrées avec parcimonie : A n\'utiliser que pour un besoin avéré." data-placement="right">\
                        <input type="checkbox" id="checkboxFusion">\
                        <div class="state p-success">\
                            <label class="label_fusion" for="checkboxFusion"><i class="icon mdi mdi-check"></i> Emprise exceptionnelle</label>\
                        </div>\
                    </div><br/>\
                    <div class="pretty p-icon p-smooth green_white_checkbox" data-toggle="tooltip" title="Uniquement utilisable sur Minetest" data-placement="right">\
                        <input type="checkbox" id="checkboxEmprise" disabled>\
                        <div class="state p-success">\
                            <label class="label_emprise" for="checkboxEmprise"><i class="icon mdi mdi-check"></i> Grand relief</label>\
                        </div>\
                    </div>\
                    <div class="pretty p-icon p-smooth green_white_checkbox relief-group relief-hypso">\
                        <input type="checkbox" id="checkboxNoHypso" checked>\
                        <div class="state p-success">\
                            <label class="label_nohypso" for="checkboxNoHypso"><i class="icon mdi mdi-check"></i> Pas de teintes</label>\
                        </div>\
                    </div>\
                    <div class="pretty p-icon p-smooth green_white_checkbox relief-group relief-hypso">\
                        <input type="checkbox" id="checkboxHypso">\
                        <div class="state p-success">\
                            <label class="label_hypso" for="checkboxHypso"><i class="icon mdi mdi-check"></i> Teintes hypsométriques</label>\
                        </div>\
                    </div><br/>\
                    <div class="input-group relief-group relief-altitude-ratio">\
                        <span class="input-group-addon">Exagération relief</span>\
                        <input id="altitudeRatio" data-slider-id="altitudeRatioSlider" type="text" data-slider-min="1" data-slider-max="5" data-slider-step="0.1" data-slider-value="1"/>\
                    </div><br/>\
                </div>\
                <div class="tab-pane fade" id="them">\
                    <h4>Ajouts spécifiques</h4>\
                    <div class="pretty p-icon p-smooth green_white_checkbox">\
                        <input type="checkbox" id="checkboxSnow">\
                        <div class="state p-success">\
                            <label class="label_snow" for="checkboxSnow"><i class="icon mdi mdi-check"></i> Neige</label>\
                        </div>\
                    </div>\
                    <div class="pretty p-icon p-smooth green_white_checkbox borderfilling">\
                        <input type="checkbox" id="checkboxBorderfilling">\
                        <div class="state p-success">\
                            <label class="label_borderfilling" for="checkboxBorderfilling"><i class="icon mdi mdi-check"></i> Bords de carte</label>\
                        </div>\
                    </div>\
                    <div class="pretty p-icon p-smooth green_white_checkbox" data-toggle="tooltip" data-placement="bottom" title="Temps de génération additionnel et carte plus volumineuse.">\
                        <input type="checkbox" id="checkboxUnderground">\
                        <div class="state p-success">\
                            <label class="label_underground" for="checkboxUnderground"><i class="icon mdi mdi-check"></i> Sous-sols</label>\
                        </div>\
                    </div>\
                    <div class="pretty p-icon p-smooth green_white_checkbox">\
                        <input type="checkbox" id="checkboxEggs">\
                        <div class="state p-success">\
                            <label class="label_eggs" for="checkboxEggs"><i class="icon mdi mdi-check"></i> Option "Chasse aux œufs"</label>\
                        </div>\
                    </div><img src="img/easter.svg" width="20px" style="margin-left: -13px;">\
                    <div class="input-group snow-group">\
                        <span class="input-group-addon">Épaisseur min</span>\
                        <input id="snowMin" data-slider-id="snowMinSlider" type="text" data-slider-min="0" data-slider-max="5" data-slider-step="1" data-slider-value="0"/>\
                    </div>\
                    <div class="input-group snow-group">\
                        <span class="input-group-addon">Épaisseur max</span>\
                        <input id="snowMax" data-slider-id="snowMaxSlider" type="text" data-slider-min="1" data-slider-max="5" data-slider-step="1" data-slider-value="5"/>\
                    </div>\
                    <br/><br/>\
                    <h4>Sélection thématique</h4>\
                    <div class="pretty p-icon p-smooth green_white_checkbox">\
                        <input type="checkbox" name="stream" id="checkboxAlti" disabled checked>\
                        <div class="state p-success">\
                            <label class="label_alti" for="checkboxAlti"><i class="icon mdi mdi-check"></i> Relief</label>\
                        </div>\
                    </div><br/>\
                    <div class="pretty p-icon p-smooth green_white_checkbox">\
                        <input type="checkbox" name="stream" id="checkboxHydro" checked>\
                        <div class="state p-success">\
                            <label class="label_hydro" for="checkboxHydro"><i class="icon mdi mdi-check"></i> Hydrographie</label>\
                        </div>\
                    </div><br/>\
                    <div class="pretty p-icon p-smooth green_white_checkbox">\
                        <input type="checkbox" name="stream" id="checkboxLand" checked>\
                        <div class="state p-success">\
                            <label class="label_land" for="checkboxLand"><i class="icon mdi mdi-check"></i> Occupation du sol</label>\
                        </div>\
                    </div><br/>\
                    <div class="pretty p-icon p-smooth green_white_checkbox">\
                        <input type="checkbox" name="stream" id="checkboxRoads" checked>\
                        <div class="state p-success">\
                            <label class="label_roads" for="checkboxRoads"><i class="icon mdi mdi-check"></i> Routes</label>\
                        </div>\
                    </div><br/>\
                    <div class="pretty p-icon p-smooth green_white_checkbox">\
                        <input type="checkbox" name="stream" id="checkboxBuildings" checked>\
                        <div class="state p-success">\
                            <label class="label_buildings" for="checkboxBuildings"><i class="icon mdi mdi-check"></i> Bâtiments</label>\
                        </div>\
                    </div>\
                    <div class="pretty p-icon p-smooth green_white_checkbox">\
                        <input type="checkbox" name="stream" id="checkboxBuildingsTrace">\
                        <div class="state p-success">\
                            <label class="label_buildingsTrace" for="checkboxBuildingsTrace"><i class="icon mdi mdi-check"></i> Traces bâtiments</label>\
                        </div>\
                    </div>\
                    <div class="pretty p-icon p-smooth green_white_checkbox relief-group relief-hypso hidden">\
                        <input type="checkbox" name="stream" id="checkboxHypsometric">\
                        <div class="state p-success">\
                            <label class="label_hypsometric" for="checkboxHypsometric"><i class="icon mdi mdi-check"></i> Teintes hypsométriques</label>\
                        </div>\
                    </div>\
                    <br/><br/>\
                    <!--<div class="input-group">\
                        <span class="input-group-addon input-group-addon-small">Sous-sols</span>\
                        <div class="pretty p-default p-round p-smooth"><input type="radio" name="underground[]" value="no"><div class="state p-default"><label>Non</label></div></input></div>\
                        <div class="pretty p-default p-round p-smooth" data-toggle="tooltip" data-placement="bottom" title="Temps de génération additionnel et carte plus volumineuse."><input type="radio" name="underground[]" value="yes"><div class="state p-default"><label>Oui</label></div></input></div>\
                    </div>-->\
                </div>\
            </div>\
            <!-- fin modal -->',
            // This callback is launched at the end of modal init,
            // so that we can attach events to checkboxes inside the modal, after it has been init (otherwise it won't count)
            callback: function () {
                this.content.style.padding = '20px';
                loadingOptionsModal = 1;

                // Checkbox onChange events
                $('#checkboxEggs').on('change', function() {
                    eggs = $('#checkboxEggs:checked').val() == "on" ? 1 : 0;
                    if(eggs && emprise == 2.5) {
                        emprise = 1;
                        $('#emprise').slider('setValue', emprise, true).change();
                        redrawAndCenterPolygon();
                    }
                });

                $('#checkboxUnderground').on('change', function() {
                    include_underground = $('#checkboxUnderground:checked').val() == "on" ? 1 : 0;
                });

                $('#checkboxSnow').on('change', function() {
                    $('.snow-group').toggleClass('snow-group-show');
                    snow_checked = $('#checkboxSnow')[0].checked ? 1 : 0;
                });

                $('#checkboxBorderfilling').on('change', function() {
                    border_filling = $('#checkboxBorderfilling:checked').val() == "on" ? 1 : 0;
                });

                $('#checkboxHypsometric').on('change', function() {
                    hypso = $('#checkboxHypsometric:checked').val() == "on" ? 1 : 0;
                    if(hypso) {
                        $('#checkboxNoHypso').prop('checked',false);
                        $('#checkboxHypso').prop('checked',true);
                    } else {
                        $('#checkboxNoHypso').prop('checked',true);
                        $('#checkboxHypso').prop('checked',false);
                    }
                });

                $('#checkboxNoHypso').on('change', function() {
                    if($('#checkboxNoHypso:checked').val() != "on")
                        $('#checkboxHypsometric').prop('checked',true).change();
                    else
                        $('#checkboxHypsometric').prop('checked',false).change();
                });

                $('#checkboxHypso').on('change', function() {
                    if($('#checkboxHypso:checked').val() == "on")
                        $('#checkboxHypsometric').prop('checked',true).change();
                    else
                        $('#checkboxHypsometric').prop('checked',false).change();
                });

                $('#checkboxBuildingsTrace').on('change', function() {
                    if($('#checkboxBuildingsTrace:checked').val() == "on") {
                        $('#checkboxBuildings').prop('checked',false).change();
                    }
                });

                $('#checkboxBuildings').on('change', function() {
                    if($('#checkboxBuildings:checked').val() == "on") {
                        $('#checkboxBuildingsTrace').prop('checked',false).change();
                    }
                });

                // Grand relief mode (SRTM data)
                $('#checkboxEmprise').on('change', function() {
                    enlarged_emprise = $('#checkboxEmprise:checked').val() == "on" ? 1 : 0;
                    if(enlarged_emprise) {
                        if(!loadingOptionsModal)
                            stream_array_buffer = stream_array;
                        $('#checkboxFusion').prop('checked',false).change();
                        $('#altitudeRatio').slider('setValue', altitude_ratio, true);
                        $('.relief-hypso').addClass('relief-group-show');
                        $('.relief-altitude-ratio').addClass('relief-group-show');
                        $('#altitudeRatio').slider('setValue', altitude_ratio, true);
                        if($("#game_format").val() == "minetest") {
                            $('.relief-altitude-ratio').removeClass('relief-group-show');
                            $('.relief-altitude-ratio').addClass('relief-group-show');
                        }
                        $('input:checkbox[name=stream]:not(#checkboxHypsometric)').prop("checked",false).change();
                        $('#checkboxAlti').prop("checked",true).change();
                        $('input:checkbox[name=stream]').prop("disabled",true);
                        $('#checkboxHypsometric').prop("disabled",false);
                        $('#checkboxNoHypso').prop("disabled",false);
                        $('#checkboxHypsometric').prop("checked",hypso).change();
                        $("#ratio").slider('setAttribute', 'reversed', true);
                        $('#ratio').slider('setAttribute', 'min', 0.001);
                        $('#ratio').slider('setAttribute', 'max', 0.1);
                        $('#ratio').slider('setAttribute', 'step', 0.001);
                        $('#ratio').slider('setValue',$('#ratio').slider('getValue'),true).trigger('change');
                    } else {
                        stream_array = stream_array_buffer;
                        altitude_ratio = 1;
                        $('.relief-group').removeClass('relief-group-show'); // alti-ratio and hypso
                        $('.relief-altitude-ratio').removeClass('relief-group-show');
                        altitude_ratio = 1;
                        $('input:checkbox[name=stream]:not(#checkboxHypsometric)').prop("checked",true);
                        var index = 1;
                        $("input:checkbox[name=stream]").each(function() {
                            if(!stream_array.includes(index)) {
                                $(this).prop('checked',false);
                            }
                            index++;
                        });
                        $('input:checkbox[name=stream]').prop("disabled",false);
                        $('#checkboxAlti').prop("disabled",true);
                        hypsoTemp = hypso;
                        $('#checkboxHypsometric').prop("checked",false).change();//.change();
                        hypso = hypsoTemp;
                        $("#ratio").slider('setAttribute', 'reversed', false);
                        $('#ratio').slider('setAttribute', 'min', 1.0);
                        $('#ratio').slider('setAttribute', 'max', 2.0);
                        $('#ratio').slider('setAttribute', 'step', 0.1);
                        $('#ratio').slider('setValue',$('#ratio').slider('getValue'),true).trigger('change');
                    }
                });

                if($("#game_format").val() == "minetest") $('#checkboxEmprise').prop('disabled',false);

                $('#checkboxFusion').on('change', function() {
                    orientation = 0;
                    ratio = 1;
                    fusion = $('#checkboxFusion:checked').val() == "on" ? 1 : 0;
                    if(fusion) {
                        $('#checkboxEmprise').prop('checked',false).change();
                        $('#emprise').slider('setAttribute', 'step', 1);
                        $('#emprise').slider('setAttribute', 'min', 6);
                        $('#emprise').slider('setAttribute', 'max', 25);
                        $('#emprise').slider('setValue', 6, true).change();
                        $('#empriseY').slider('setValue', 6, true).change();
                        $('.orientation').addClass('hidden');
                        $('.echelle').addClass('hidden');
                        $(".empriseX").text("Emprise en X");
                        $('.empriseYinputgroup').removeClass('hidden');
                        $('.borderfilling').addClass('hidden');
                        $('#checkboxBorderfilling').prop('checked',false).change();
                    } else {
                        $('#emprise').slider('setAttribute', 'step', 0.1);
                        $('#emprise').slider('setAttribute', 'min', 0.5);
                        $('#emprise').slider('setAttribute', 'max', 5);
                        empriseY = 0;
                        $('#emprise').slider('setValue', 2.5, true).change();
                        $('.orientation').removeClass('hidden');
                        $('.echelle').removeClass('hidden');
                        $(".empriseX").text("Emprise");
                        $('.empriseYinputgroup').addClass('hidden');
                        $('.borderfilling').removeClass('hidden');
                    }
                });

                // "Sources" part of advanced options modal
                $('#checkboxReliefSRTM').on('change', function() {
                    /*if($('#checkboxReliefSRTM:checked').val() == "on") {
                        $('#checkboxReliefIGN').prop('checked',false);
                        $('#checkboxReliefNONE').prop('checked',false);
                        datatype_relief = 'srtm';
                    } else {
                        $('#checkboxReliefSRTM').prop('checked',true);
                    }*/
                    $('#checkboxReliefIGN').prop('checked',false);
                    $('#checkboxReliefNONE').prop('checked',false);
                    $('#checkboxReliefSRTM').prop('checked',true);
                    datatype_relief = 'srtm';
                });

                $('#checkboxReliefIGN').on('change', function() {
                    $('#checkboxReliefIGN').prop('checked',true);
                    $('#checkboxReliefNONE').prop('checked',false);
                    $('#checkboxReliefSRTM').prop('checked',false);
                    datatype_relief = 'ign';
                });

                $('#checkboxReliefNONE').on('change', function() {
                    $('#checkboxReliefIGN').prop('checked',false);
                    $('#checkboxReliefNONE').prop('checked',true);
                    $('#checkboxReliefSRTM').prop('checked',false);
                    datatype_relief = 'none';
                });

                $('#checkboxTopoOSM').on('change', function() {
                    if($('#checkboxTopoOSM:checked').val() == "on") {
                        $("#checkboxTopoOSM ~ .state > label").html("<i class=\"icon mdi mdi-check\"></i> OSM (sur le monde entier). Bâtiment à hauteur:");
                        $('#checkboxReliefSRTM').prop('checked',true).change();
                        $('#checkboxTopoIGN').prop('checked',false);
                        datatype_topo = 'osm';
                        $('.osmCheckboxes').removeClass('hidden');
                        if(data_osm_height == 0 && data_osm_min_height == 0 && data_osm_max_height == 0)
                            $('#checkboxOSMfixed').prop('checked',true).change();
                    } else {
                        $("#checkboxTopoOSM ~ .state > label").html("<i class=\"icon mdi mdi-check\"></i> OSM (sur le monde entier)");
                        $('#checkboxTopoIGN').prop('checked',true);
                        datatype_topo = 'ign';
                        $('.osmCheckboxes').addClass('hidden');
                        $('.osmInputGroupFixed').addClass('hidden');
                        $('.osmInputGroupRandom').addClass('hidden');
                        data_osm_height = 0;
                        data_osm_min_height = 0;
                        data_osm_max_height = 0;
                    }
                });

                $('#checkboxTopoIGN').on('change', function() {
                    if($('#checkboxTopoIGN:checked').val() == "on") {
                        $("#checkboxTopoOSM ~ .state > label").html("<i class=\"icon mdi mdi-check\"></i> OSM (sur le monde entier)");
                        $('#checkboxTopoOSM').prop('checked',false);
                        datatype_topo = 'ign';
                        $('.osmCheckboxes').addClass('hidden');
                        $('.osmInputGroupFixed').addClass('hidden');
                        $('.osmInputGroupRandom').addClass('hidden');
                        data_osm_height = 0;
                        data_osm_min_height = 0;
                        data_osm_max_height = 0;
                    } else {
                        $("#checkboxTopoOSM ~ .state > label").html("<i class=\"icon mdi mdi-check\"></i> OSM (sur le monde entier). Bâtiment à hauteur:");
                        $('#checkboxTopoOSM').prop('checked',true);
                        datatype_topo = 'osm';
                        $('.osmCheckboxes').removeClass('hidden');
                        if(data_osm_height == 0 && data_osm_min_height == 0 && data_osm_max_height == 0)
                            $('#checkboxOSMfixed').prop('checked',true).change();
                    }
                });

                $('#checkboxOSMrandom').on('change', function() {
                    if(datatype_topo == 'ign')
                        return;
                    $('#minOsmHeight').slider('setValue', 10, true).change();
                    $('#maxOsmHeight').slider('setValue', 20, true).change();
                    $('#osmHeight').slider('setValue', 10, true).change();

                    if($('#checkboxOSMrandom:checked').val() == "on") {
                        $('#checkboxOSMfixed').prop('checked',false);
                        data_osm_height = 0;
                        $('.osmInputGroupRandom').removeClass('hidden');
                        $('.osmInputGroupFixed').addClass('hidden');
                    } else {
                        $('#checkboxOSMfixed').prop('checked',true);
                        data_osm_min_height = 0;
                        data_osm_max_height = 0;
                        $('.osmInputGroupFixed').removeClass('hidden');
                        $('.osmInputGroupRandom').addClass('hidden');
                    }
                });

                $('#checkboxOSMfixed').on('change', function() {
                    if(datatype_topo == 'ign')
                        return;
                    $('#minOsmHeight').slider('setValue', 10, true).change();
                    $('#maxOsmHeight').slider('setValue', 20, true).change();
                    $('#osmHeight').slider('setValue', 10, true).change();

                    if($('#checkboxOSMfixed:checked').val() == "on") {
                        $('#checkboxOSMrandom').prop('checked',false);
                        data_osm_min_height = 0;
                        data_osm_max_height = 0;
                        $('.osmInputGroupFixed').removeClass('hidden');
                        $('.osmInputGroupRandom').addClass('hidden');
                    } else {
                        $('#checkboxOSMrandom').prop('checked',true);
                        data_osm_height = 0;
                        $('.osmInputGroupRandom').removeClass('hidden');
                        $('.osmInputGroupFixed').addClass('hidden');
                    }
                });

                // Stream array (input checkbox)
                var index = 1;
                $("input:checkbox[name=stream]").each(function() {
                    if(!stream_array.includes(index)) {
                        $(this).prop('checked',false);
                    }
                    index++;
                });
                $("input:checkbox[name=stream]").on('change', function() {
                    stream_array = []
                    var index = 1;
                    $("input:checkbox[name=stream]").each(function() {
                        if($(this)[0].checked) {
                            stream_array.push(index);
                        }
                        index++;
                    });
                });

                // Slider init
                $('#ratio').slider({
                    formatter: function(value) {
                        meters = 1;
                        if(enlarged_emprise) {
                            if(value <= 0.01) {
                                $('#ratio').slider('setAttribute', 'step', 0.0001);
                                $('#ratio').trigger('change');
                                var properties = map.getView().getProperties();
                                properties["minZoom"] = 3;
                                map.setView(new ol.View(properties));
                            } else {
                                $('#ratio').slider('setAttribute', 'step', 0.001);
                                $('#ratio').trigger('change');
                                var properties = map.getView().getProperties();
                                properties["minZoom"] = 6;
                                map.setView(new ol.View(properties));
                            }
                            meters = 1/value;
                            value = 1;
                            meters = +meters.toFixed(2);
                        }
                        return value + ((value==1) ? ' cube' : ' cubes') + ' pour ' + meters + ((meters==1) ? ' mètre' : ' mètres') ;
                    },
                    tooltip_position:'bottom'
                });
                $('#altitudeRatio').slider({
                    formatter: function(value) {
                        return 'Facteur ' + value;
                    },
                    tooltip_position:'bottom'
                });
                $('#emprise').slider({
                    formatter: function(value) {
                        var emprKm = (value/ratio);
                        emprKm = +emprKm.toFixed(2);
                        return emprKm + ' km' + ' par ' + emprKm + ' km';
                    },
                    tooltip_position:'bottom'
                });
                $('#empriseY').slider({
                    formatter: function(value) {
                        var emprKm = (value/ratio);
                        emprKm = +emprKm.toFixed(2);
                        return emprKm + ' km' + ' par ' + emprKm + ' km';
                    },
                    tooltip_position:'bottom'
                });
                $('#orientation').slider({
                    formatter: function(value) {
                        return value + '°';
                    },
                    tooltip_position:'bottom'
                });
                $('#snowMin').slider({
                    formatter: function(value) {
                        return value + ((value==1) ? ' mètre' : ' mètres') + ' de neige';
                    },
                    tooltip_position:'bottom'
                });
                $('#snowMax').slider({
                    formatter: function(value) {
                        return value + ((value==1) ? ' mètre' : ' mètres') + ' de neige';
                    },
                    tooltip_position:'bottom'
                });

                $('#osmHeight').slider({
                    formatter: function(value) {
                        return value + ((value==1) ? ' mètre' : ' mètres');
                    },
                    tooltip_position:'bottom'
                });

                $('#minOsmHeight').slider({
                    formatter: function(value) {
                        return value + ((value==1) ? ' mètre' : ' mètres');
                    },
                    tooltip_position:'bottom'
                });
                $('#maxOsmHeight').slider({
                    formatter: function(value) {
                        return value + ((value==1) ? ' mètre' : ' mètres');
                    },
                    tooltip_position:'bottom'
                });

                // Checkbox set value
                $('#checkboxUnderground').prop('checked',include_underground);
                $('#checkboxEggs').prop('checked',eggs);
                $('#checkboxSnow').prop('checked',snow_checked);
                $('#checkboxBorderfilling').prop('checked',border_filling);
                $('#checkboxEmprise').prop('checked',enlarged_emprise).trigger('change');
                $('#checkboxFusion').prop('checked',fusion).change();
                if(datatype_relief=='ign')
                    $('#checkboxReliefIGN').prop('checked',true).change();
                else if(datatype_relief=='srtm')
                    $('#checkboxReliefSRTM').prop('checked',true).change();
                else
                    $('#checkboxReliefNONE').prop('checked',true).change();
                $('#checkboxTopoIGN').prop('checked',(datatype_topo=='ign' ? 1 : 0)).trigger('change');
                $('#checkboxOSMfixed').prop('checked',(data_osm_height>0 ? 1 : 0)).trigger('change');

                // Slider set value and onChange events
                $('#ratio').slider('setValue', ratio, true);
                $('#ratio').slider().on('change', function(ev){
                    ratio = $('#ratio').val();
                    $("#emprise").slider('setValue', $("#emprise").val(), true);
                    redrawAndCenterPolygon();
                });

                $('#emprise').slider('setValue', emprise, true);
                $('#emprise').slider().on('change', function(ev){
                    /*if(fusion && $('#emprise').slider('getValue') > $('#empriseY').slider('getValue') && emprise==$('#empriseY').slider('getValue')) {
                        $('#empriseY').slider('setValue',$('#emprise').slider('getValue'),true);
                    }*/ // SYNCHRONISATION OF X Y FOR ERGONOMY
                    emprise = $('#emprise').val();
                    redrawAndCenterPolygon();
                });

                $('#empriseY').slider('setValue', empriseY, true);
                $('#empriseY').slider().on('change', function(ev){
                    empriseY = $('#empriseY').val();
                    redrawAndCenterPolygon();
                });

                $('#orientation').slider('setValue', orientation, true);
                $('#orientation').slider().on('change', function(ev){
                    orientation = $('#orientation').val();
                    redrawAndCenterPolygon();
                });

                $('#altitudeRatio').slider('setValue', altitude_ratio, true);
                $('#altitudeRatio').slider().on('change', function(ev){
                    altitude_ratio = $('#altitudeRatio').val();
                });

                $('#snowMin').slider('setValue', snow_height_min, true);
                $('#snowMin').slider().on('change', function(ev){
                    if($('#snowMax').val() < $('#snowMin').slider('getValue')) {
                        $('#snowMax').slider('setValue',$('#snowMin').slider('getValue'),true);
                    }
                    snow_height_min = $('#snowMin').val();
                    $("#snowMax").slider('setValue', $("#snowMax").val(), true);
                    snow_height_max = $("#snowMax").val();
                });

                $('#snowMax').slider('setValue', snow_height_max, true);
                $('#snowMax').slider().on('change', function(ev){
                    if($('#snowMax').val() < $('#snowMin').slider('getValue')) {
                        $('#snowMax').slider('setValue',$('#snowMin').slider('getValue'),true);
                    }
                    snow_height_max = $('#snowMax').val();
                    $("#snowMin").slider('setValue', $("#snowMin").val(), true);
                    snow_height_min = $("#snowMin").val();
                });

                $('#osmHeight').slider('setValue', data_osm_height, true);
                $('#osmHeight').slider().on('change', function(ev){
                    data_osm_height = $('#osmHeight').val(); 
                });

                $('#minOsmHeight').slider('setValue', data_osm_min_height, true);
                $('#minOsmHeight').slider().on('change', function(ev){
                    if($('#maxOsmHeight').val() < $('#minOsmHeight').slider('getValue')) {
                        $('#maxOsmHeight').slider('setValue',$('#minOsmHeight').slider('getValue'),true);
                    }
                    data_osm_min_height = $('#minOsmHeight').val(); 
                    $("#maxOsmHeight").slider('setValue', $("#maxOsmHeight").val(), true);
                    data_osm_max_height = $("#maxOsmHeight").val();
                });

                $('#maxOsmHeight').slider('setValue', data_osm_max_height, true);
                $('#maxOsmHeight').slider().on('change', function(ev){
                    if($('#maxOsmHeight').val() < $('#minOsmHeight').slider('getValue')) {
                        $('#maxOsmHeight').slider('setValue',$('#minOsmHeight').slider('getValue'),true);
                    }
                    data_osm_max_height = $('#maxOsmHeight').val(); 
                    $("#minOsmHeight").slider('setValue', $("#minOsmHeight").val(), true);
                    data_osm_min_height = $("#minOsmHeight").val();
                });

                if(snow_checked == 1) {
                    $('.snow-group').addClass('snow-group-show');
                }
                if(enlarged_emprise == 1) {
                    $('.relief-group').addClass('relief-group-show');
                }

                loadingOptionsModal = 0;
            }
        });
    });

    // Set default values for advanced options
    $("#country").val("fr");
    $("#country").selectpicker('refresh');

    setDefaultValues();


    $(document).keyup(function(e) {
        if (e.keyCode === 27) {
            if (($('#about_container').css('display') == 'block')
                || ($('#pregen_container').css('display') == 'block')
                || ($('#order_validation').css('display') == 'block')
                || ($('#notification').css('display') == 'block')) { closePopup(); }
        }
    });

    fetchCaptcha();

    $("#game_format").on('change', function(){
        $('.relief-altitude-ratio').removeClass('relief-group-show');
        if($("#game_format").val() != "minetest") {
            altitude_ratio = 1;
            $('#checkboxEmprise').prop('disabled',true);
            $('#checkboxEmprise').prop('checked',false).change();
        } else if($("#game_format").val() == "minetest") {
            $('#checkboxEmprise').prop('disabled',false);
        }
        /* else if(enlarged_emprise && $("#game_format").val() == "minetest") {
            $('.relief-altitude-ratio').addClass('relief-group-show');
            $('#altitudeRatio').slider('setValue', altitude_ratio, true);
        }*/
    });

    /*$("input[name='geosource'][value='ign']").prop('checked',1);

	$("input[name='geosource']").on('change',function(){
    datatype_geopos = $("input[name='geosource']:checked").val();
    $('#checkboxTopoIGN').prop('checked',(datatype_geopos=='ign' ? 1 : 0)).trigger('change');
    reinitMap();
    });*/

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
                    minZoom: 6,
                    maxZoom: 18
            }),
            interactions: ol.interaction.defaults().extend([new app.Drag()])
        });
        initMap();
        
        // Set-up coherence controls for fields (mail, captcha etc) + reverse geocoding event for address field (findPlace function)
        $('#address_field').keyup(function() {
            findPlace($('#address_field').val());
        });
        $('#email_field').keyup(function() {
            var pattern = new RegExp(/^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i); // http://stackoverflow.com/a/2855946
            if (pattern.test($('#email_field').val()) == false) {
                $('#email_field').css('color', '#cc4b4b');
            }
            else {
                $('#email_field').css('color', '#6ca66c');
            }
        });
        $('#email_field_confirm').keyup(function() {
            if ($('#email_field_confirm').val() != $('#email_field').val()) {
                $('#email_field_confirm').css('color', '#cc4b4b');   
            } else {
                $('#email_field_confirm').css('color', '#6ca66c');
            }
        });
        $('#email_field').focusout(function() {
            setTimeout(function() {
                if ($('#email_field').val().length > 0) {
                    $('#email_field').css('color', '#555');
                } else {
                    $('#email_field').css('color', '#999');
                }
            }, 1000);
        });
        $('#email_field_confirm').focusout(function() {
            setTimeout(function() {
                if ($('#email_field_confirm').val().length > 0) {
                    $('#email_field_confirm').css('color', '#555');
                } else {
                    $('#email_field_confirm').css('color', '#999');
                }
            }, 1000);
        });
        $('#captcha_response').keyup(function() {
            checkCaptchaAndConsent();
        });
        $('input[name="age[]"],input[name="consentment[]"]').click(function() {
            checkCaptchaAndConsent();
        });
        // Remove splashscreen / loading screen since we loaded everything
        setTimeout(function() {
            $('#splashscreen').fadeOut('slow');
            if(window.location.hash=="#about") {  
                $("#about-modal").modal();
                popAboutSection();
            }
        }, 2000);
    });
});
