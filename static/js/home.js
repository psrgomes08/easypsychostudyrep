toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": false,
    "progressBar": true,
    "positionClass": "toast-top-center",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
};

var url;
var formIDURLGeneration = "";
var formURL = "";

/**
 * Invites an user to access a form.
 */
$('#grant-access').click(function () {
    var u = document.getElementById("grant-user");
    var username = u.options[u.selectedIndex].text;

    var p = document.getElementById("grant-permission");
    var permissionType = p.options[p.selectedIndex].value;

    $.ajax({
        url: urlToPost,
        type: 'POST',
        data: {
            idForm: formID,
            username: username,
            permissionType: permissionType,
            csrfmiddlewaretoken: csrfToken
        },
        success: function () {
            $('#modal-for-access-granting').modal('hide');
            toastr.success('O utilizador "' + username + '" foi convidado!');
        },
        error: function () {
            $('#modal-for-access-granting').modal('hide');
            toastr.warning('O utilizador "' + username + '" já foi convidado.');
        }
    });
});

/**
 * Gets the correct form ID for URL generation.
 */
$('#modal-for-link-share').on('show.bs.modal', function (e) {
    var location = window.location.href;
    location = location.split("painel");
    console.log(location[0]);

    var serverURL = location[0];
    formIDURLGeneration = $(e.relatedTarget).data('form-id');
    formURL = serverURL + "recolhaparticipante/" + formIDURLGeneration;
    $(e.currentTarget).find('#form-url').html("");
    //$(e.currentTarget).find('#form-token').html("");
});

/**
 * Generates a link for long distance data collection.
 */
$('#generate-link').on("click", function () {
    participantIDInLink = $('#participant-in-link').val();

    if (participantIDInLink == "" || participantIDInLink == null) {
        $('#form-url').html('<div class="alert alert-danger alert-dismissible" role="alert">' +
            '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button> ' +
            '<strong>Por favor insira um ID do Participante.</strong></div>');
    } else {

        tokenForParticipant = Math.random().toString(10).substring(2);

        $.ajax({
            url: urlToCheckParticipants,
            type: 'POST',
            data: {
                idForm: formIDURLGeneration,
                participantID: participantIDInLink,
                token: tokenForParticipant,
                csrfmiddlewaretoken: csrfToken
            },
            success: function () {
                $('#form-url').html('<div class="alert alert-info alert-dismissible" role="alert">' +
                    '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                    '<label>Link para recolha remota:</label><br/>' +
                    '<p><textarea id="js-copytextarea" class="form-control">' + formURL + "/" + participantIDInLink + "?" + tokenForParticipant + '</textarea></p>' +
                    '<p><button id="js-textareacopybtn" onclick="copyToClipboard()" type="button" class="btn btn-primary"><span class="glyphicon glyphicon-copy"></span> Copiar</button></p>' +
                    '</div>');
            },
            error: function (data) {
                if (data.responseText == "ERROR_1") {
                    $('#form-url').html('<div class="alert alert-danger alert-dismissible" role="alert">' +
                        '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button> ' +
                        '<strong>Este ID já foi atribuído a um participante deste questionário.</strong></div>');
                } else if (data.responseText == "ERROR_2") {
                    $('#form-url').html('<div class="alert alert-danger alert-dismissible" role="alert">' +
                        '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button> ' +
                        '<strong>Não foi possível gerar um link de recolha remota para este questionário.</strong></div>');
                } else {
                    $('#form-url').html('<div class="alert alert-info" role="alert">' +
                        '<label>Link para recolha remota:</label><br/>' +
                        '<p><textarea id="js-copytextarea" class="form-control">' + formURL + "/" + participantIDInLink + "?" + data.responseText + '</textarea></p>' +
                        '<p><button id="js-textareacopybtn" onclick="copyToClipboard()" type="button" class="btn btn-primary"><span class="glyphicon glyphicon-copy"></span> Copiar</button></p>' +
                        '</div>');
                }
            }
        });
    }

});

/**
 * Copies a text to clipboard.
 */
function copyToClipboard() {

    var copyTextarea = document.getElementById('js-copytextarea');

    copyTextarea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        //console.log('Copying text command was ' + msg);
        $('#form-url').append('<div class="alert alert-success alert-dismissible" role="alert">' +
            '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
            '<strong>O link foi copiado!</strong></div>');
    } catch (err) {
        $('#form-url').append('<div class="alert alert-danger alert-dismissible" role="alert">' +
            '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
            '<strong>Não foi possível copiar o link.</strong></div>');
        //console.log('Oops, unable to copy');
    }
}


/**
 * Gets the correct form ID for Inviting Users.
 */
$('#modal-for-access-granting').on('show.bs.modal', function (e) {
    formID = $(e.relatedTarget).data('form-id');
    var formName = $(e.relatedTarget).data('form-name');

    $(e.currentTarget).find('#invite-title').text('Convidar utilizador para acesso a "' + formName + '"');
});

/**
 * Gets the correct form ID for URL generation
 */
$('#modal-for-delete').on('show.bs.modal', function (e) {
    var formName = $(e.relatedTarget).data('form-name');
    url = $(e.relatedTarget).data('form-url');

    $(e.currentTarget).find('#form-message').text('Tem certeza que deseja apagar o questionário "' + formName + '"?'); // populate the paragpraph
});

/**
 * Deletes an archived form.
 */
$('#delete-form').click(function () {
    location.href = url;
});

/**
 * Logouts of the system.
 */
$('#system-logout').click(function () {
    location.href = urlLogout;
});