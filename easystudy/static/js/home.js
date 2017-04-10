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

// Invites an user to access a form
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

// Gets the correct form ID for URL generation
var formURL = "";
var formIDURLGeneration = "";
$('#modal-for-link-share').on('show.bs.modal', function (e) {
    // http://127.0.0.1:8000/recolha/solkhs6bu9400qfuzyn8f47vi/p002
    formIDURLGeneration = $(e.relatedTarget).data('form-id');
    formURL = "http://127.0.0.1:8000/recolhaparticipante/" + formIDURLGeneration;
    $(e.currentTarget).find('#form-url').html("");
    $(e.currentTarget).find('#form-token').html("");
});

$('#generate-link').on("click", function () {
    participantIDInLink = $('#participant-in-link').val();
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
            $('#form-url').html('<br/><label>Link para partilha:</label><br/><p>' + formURL + "/" + participantIDInLink + '</p>');
            $('#form-token').html('<br/><label>Senha de acesso:</label><br/><p>' + tokenForParticipant + '</p>');
        },
        error: function (data) {
            if(data.responseText == "ERROR_1") {
                $('#form-url').html('<br/><p><b>Este ID já foi atribuído a um participante.</b></p>');
                $('#form-token').html('');
            } else if(data.responseText == "ERROR_2") {
                $('#form-url').html('<br/><p><b>Não foi possível gerar um link de partilha para este formulário.</b></p>');
                $('#form-token').html('');
            } else {
                $('#form-url').html('<br/><label>Link para partilha:</label><br/><p>' + formURL + "/" + participantIDInLink + '</p>');
                $('#form-token').html('<br/><label>Senha de acesso:</label><br/><p>' + data.responseText + '</p>');
            }
        }
    });

});




// Gets the correct form ID for Inviting Users
$('#modal-for-access-granting').on('show.bs.modal', function (e) {
    formID = $(e.relatedTarget).data('form-id');
    var formName = $(e.relatedTarget).data('form-name');

    $(e.currentTarget).find('#invite-title').text('Convidar utilizador para acesso a "' + formName + '"');
});

// Gets the correct form ID for URL generation
$('#modal-for-delete').on('show.bs.modal', function (e) {
    var formName = $(e.relatedTarget).data('form-name');
    url = $(e.relatedTarget).data('form-url');

    $(e.currentTarget).find('#form-message').text('Tem certeza que deseja apagar o questionário "' + formName + '"?'); // populate the paragpraph
});

// Deletes an archived form
$('#delete-form').click(function () {
    location.href = url;
});

// Logouts of the system
$('#system-logout').click(function () {
    location.href = urlLogout;
});