/*$(window).unload(function(){
        signOut();
});*/

$(document).ready(function() {
    $(document).on("click", '[data-item="delete-order-custom-btn"]', function () {
        delete_order_custom($(this).data('id'),$('textarea[data-item="message"]').val());
    });

    $(document).on("click","#maintenanceTrigger", function(){
        if($(this).attr("aria-pressed") == "true"){
            $.ajax({
                type: 'POST',
                url: './inc/stats_action.php',
                data: {
                    maintenance_mode: 1,
                    action: 'maintenance'
                },
                success: function(data) {
                    response = jQuery.parseJSON(JSON.stringify(data));
                    alert(response.status + " " + response.content);
                },
                dataType: 'json',
                timeout: 2000
            });
        } else {
            $.ajax({
                type: 'POST',
                url: './inc/stats_action.php',
                data: {
                    maintenance_mode: 0,
                    action: 'maintenance'
                },
                success: function(data) {
                    response = jQuery.parseJSON(JSON.stringify(data));
                    alert(response.status + " " + response.content);
                },
                dataType: 'json',
                timeout: 2000
            });
        }
    });
});

function retry_order(order_id) {
    $.ajax({
        type: 'POST',
        url: './inc/stats_action.php',
        data: {
            order_id: order_id,
            action: 'retry'
        },
        success: function(data) {
            response = jQuery.parseJSON(JSON.stringify(data));
            alert(response.status + " " + response.content);
            location.reload();
        },
        dataType: 'json',
        timeout: 2000
    });
}

function retry_all_orders() {
    $.ajax({
        type: 'POST',
        url: './inc/stats_action.php',
        data: {
            action: 'retry_all'
        },
        success: function(data) {
            response = jQuery.parseJSON(JSON.stringify(data));
            alert(response.status + " " + response.content);
            location.reload();
        },
        dataType: 'json',
        timeout: 2000
    });
}
            
function delete_order(order_id) {
    $.ajax({
        type: 'POST',
        url: './inc/stats_action.php',
        data: {
            order_id: order_id,
            action: 'delete'
        },
        success: function(data) {
            response = jQuery.parseJSON(JSON.stringify(data));
            alert(response.status + " " + response.content);
            location.reload();
        },
        dataType: 'json',
        timeout: 2000
    });
}

function delete_order_mail(order_id) {
    $.ajax({
        type: 'POST',
        url: './inc/stats_action.php',
        data: {
            order_id: order_id,
            action: 'delete_mail'
        },
        success: function(data) {
            response = jQuery.parseJSON(JSON.stringify(data));
            alert(response.status + " " + response.content);
            location.reload();
        },
        dataType: 'json',
        timeout: 2000
    });
}

function delete_order_custom_modal(order_id) {
    $('[data-item="delete-order-custom-title"]').text(order_id);
    $('[data-item="delete-order-custom-btn"]').data('id', order_id);
}

function delete_order_custom(order_id,custom_message) {
    $.ajax({
        type: 'POST',
        url: './inc/stats_action.php',
        data: {
            order_id: order_id,
            custom_message: custom_message,
            action: 'delete_custom'
        },
        success: function(data) {
            response = jQuery.parseJSON(JSON.stringify(data));
            alert(response.status + " " + response.content);
            location.reload();
        },
        dataType: 'json',
        timeout: 2000
    });
}

function erase_logs() {
    if($("#erase-sendmail").is(":checked")==true) var sendMail="1"; else var sendMail="0";

    $.ajax({
        type: 'POST',
        url: './inc/stats_action.php',
        data: {
            mail_send: sendMail,
            mail_content: $('[data-item="message-erase"]').val(),
            action: 'erase_logs'
        },
        success: function(data) {
            response = jQuery.parseJSON(JSON.stringify(data));
            alert(response.status + " " + response.content);
            location.reload();
        },
        dataType: 'json',
        timeout: 2000
    });
}

function toggle_msgbox() {
    $(".erase-msgbox").toggle();
}