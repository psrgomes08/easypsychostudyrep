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
var formIDForSpecialConfigs = "";

/**
 * Uploads the uploaded form configuration to the database.
 * @param uploadedFormConfig the form configuration file to the uploaded
 */
function uploadFormConfig(uploadedFormConfig) {
    document.getElementById("alert-messages-form-config-upload").innerHTML = ''; // cleans the div if there is a previous message

    $('#form-config').hide();
    $("#alert-messages-form-config-upload").append('<p align="center"><strong>Aguarde...</strong></p>' +
        '<p align="center">O seu questionário está a ser importado.</p>');

    $.ajax({
        url: urlToUploadJSON,
        type: 'POST',
        data: {
            uploadedFormConfig: JSON.stringify(uploadedFormConfig),
            csrfmiddlewaretoken: csrfToken
        },
        success: function () {
            location.href = onSuccess;
        },
        error: function () {
            $("#form-config").show();
            document.getElementById("alert-messages-form-config-upload").innerHTML = '';
            document.getElementById("alert-messages-form-config-upload").innerHTML = '<div class="alert alert-danger">' +
                '<strong>Erro</strong> no carregamento da configuração do questionário.' +
                '</div>';
        }
    });
}

/**
 * Gets the content of the imported form configuration.
 */
function getFileContent() {
    document.getElementById("alert-messages-form-config-upload").innerHTML = ''; // cleans the div if there is a previous message

    var file = document.querySelector('#form-config input[type=file]').files[0];

    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");

        reader.onload = function (evt) {
            var aux = JSON.parse(evt.target.result);

            if (aux.length < 3) {
                uploadFormConfig(aux);
            }
            else {
                $("#alert-messages-form-config-upload").append('<p align="center">' +
                    'Foram detetadas configurações de participantes para além da configuração do questionário.' +
                    '<br/><strong>Deseja carregá-las também?</strong>' +
                    '</p>' +
                    '<p align="center">' +
                    '<button id="ok-load" type="button" class="btn btn-success"><span class="glyphicon glyphicon-ok"></span> Sim</button>' +
                    ' <button id="no-load" type="button" class="btn btn-danger"><span class="glyphicon glyphicon-remove"></span> Não</button>' +
                    '</p>');

                var okLoadBtn = document.getElementById('ok-load');
                okLoadFunct = function () {
                    uploadFormConfig(aux);
                };
                okLoadBtn.addEventListener('click', okLoadFunct);

                var noLoadBtn = document.getElementById('no-load');
                noLoadFunct = function () {
                    uploadFormConfig(aux.slice(0, 2));
                };
                noLoadBtn.addEventListener('click', noLoadFunct);
            }

        };
        reader.onerror = function (evt) {
            document.getElementById("alert-messages-form-config-upload").innerHTML = '<div class="alert alert-danger">' +
                '<strong>Erro</strong> na leitura do ficheiro. Por favor carregue novamente ou escolha outro ficheiro.' +
                '</div>';
        }
    }
}

/**
 * Gets the imported form configuration name.
 */
function getFileName() {
    document.getElementById("alert-messages-form-config-upload").innerHTML = ''; // cleans the div if there is a previous message

    var fileTextInput = $('#form-config').find('#form-config-selected');
    var text = "";

    var fileName = document.querySelector('#form-config input[type=file]').files[0].name;
    text = fileName;

    fileTextInput.val(text);

    // Checks if the file extension is valid
    var fileExtension = fileName.substr(fileName.lastIndexOf('.') + 1);
    if (fileExtension != "psyconfig") {
        document.getElementById("alert-messages-form-config-upload").innerHTML = '<div class="alert alert-danger alert-dismissable">' +
            '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
            '<strong>Erro na leitura do ficheiro.</strong> Por favor carregue um ficheiro com extensão <i>.psyconfig</i>.' +
            '</div>';
    }
}

/**
 * Gets the number of notifications of the user.
 */
function numberOfNotifications() {
    //console.log("notifications before ajax: " + nNotifications);
    $.ajax({
        url: urlForNNotifications,
        type: 'GET',

        success: function (data) {
            if (nNotifications != data && data != 0) {
                var audio = new Audio(dingSound);
                audio.play();
            }
            $(document).find('#notifications-badge').text(data);
            nNotifications = data;
            //console.log("notifications after ajax: " + nNotifications);
        },
        error: function (data) {
            console.log(data.responseText);
        }
    });
}

setInterval(numberOfNotifications, 60000); // keeps the number of notifications updated every 1 minute

/**
 * Retrieves all the notifications from the user.
 */
$('#modal-for-notifications').on('show.bs.modal', function (e) {

    $(e.currentTarget).find('#user-notifications').html("");

    $.ajax({
        url: urlForNotifications,
        type: 'GET',

        success: function (data) {

            if (data.length == 0) { // there are no notifications
                $(e.currentTarget).find('#user-notifications').append('' +
                    '<div class="alert alert-success" role="alert">' +
                    '<p align="center"><strong><span class="glyphicon glyphicon-ok-sign"></span> Não tem notificações novas. </strong></p>' +
                    '</div>');
            }
            else { // there are notifications

                for (var i = 0; i < data.length; i++) {
                    if (data[i][1] == 'I') {
                        $(e.currentTarget).find('#user-notifications').append('' +
                            '<div class="alert alert-info" role="alert">' +
                            '<p align="center"><strong><span class="glyphicon glyphicon-info-sign"></span> Informação: </strong>' + data[i][0] + '</p>' +
                            '</div>');
                    }
                    else if (data[i][1] == 'W') {
                        $(e.currentTarget).find('#user-notifications').append('' +
                            '<div class="alert alert-warning" role="alert">' +
                            '<p align="center"><strong><span class="glyphicon glyphicon-exclamation-sign"></span> Alerta: </strong>' + data[i][0] + '</p>' +
                            '</div>');
                    }
                    else if (data[i][1] == 'S') {
                        $(e.currentTarget).find('#user-notifications').append('' +
                            '<div class="alert alert-success" role="alert">' +
                            '<p align="center"><strong><span class="glyphicon glyphicon-ok-sign"></span> Sucesso: </strong>' + data[i][0] + '</p>' +
                            '</div>');
                    }
                    else { // 'D'
                        $(e.currentTarget).find('#user-notifications').append('' +
                            '<div class="alert alert-danger" role="alert">' +
                            '<p align="center"><strong><span class="glyphicon glyphicon-warning-sign"></span> Atenção: </strong>' + data[i][0] + '</p>' +
                            '</div>');
                    }
                }

                $(e.currentTarget).find('#user-notifications').append('' +
                    '<p align="center"><button class="btn btn-danger" type="button" onclick="deleteNotifications()">' +
                    '<span class="glyphicon glyphicon-trash"></span> Apagar Todas' +
                    '</button></p>');

            }

        },
        error: function (data) {
            console.log(data.responseText);
        }
    });

});

/**
 * Deletes all the notifications of the user.
 */
function deleteNotifications() {
    $.ajax({
        url: urlForDeleteNotifications,
        type: 'POST',
        data: {
            csrfmiddlewaretoken: csrfToken
        },
        success: function (data) {
            document.getElementById("user-notifications").innerHTML = '' +
                '<div class="alert alert-success" role="alert">' +
                '<p align="center"><strong><span class="glyphicon glyphicon-ok-sign"></span> Não tem notificações novas. </strong></p>' +
                '</div>';

            numberOfNotifications(); // update badge of notifications

            //console.log(data.responseText);
        },
        error: function (data) {
            console.log(data.responseText);
        }
    });
}

/**
 * Saves the special configurations of a form, used in data collection.
 */
$('#save-form-options').click(function () {
    var idForm = formIDForSpecialConfigs;
    var f = document.getElementById("trial-form");
    var idTrialForm = f.options[f.selectedIndex].value;

    var scaleExplained = 'N';
    if (document.getElementById('display-scale').checked) {
        scaleExplained = 'Y';
    }

    console.log(idTrialForm);

    $.ajax({
        url: urlToPostSpecialConfigs,
        type: 'POST',
        data: {
            idForm: idForm,
            idTrialForm: idTrialForm,
            scaleExplained: scaleExplained,
            csrfmiddlewaretoken: csrfToken
        },
        success: function (data) {
            $("#alert-messages-for-special-configs").html('<div class="alert alert-success">' +
                '<p align="center"><strong><span class="glyphicon glyphicon-ok-sign"></span> Sucesso!</strong> As configurações foram guardadas.</p>' +
                '</div>');
            console.log(data);
        },
        error: function (data) {
            $("#alert-messages-for-special-configs").html('<div class="alert alert-danger">' +
                '<p align="center"><strong><span class="glyphicon glyphicon-remove-sign"></span> Erro!</strong> As configurações não foram guardadas.</p>' +
                '</div>');
            console.log(data.responseText);
        }
    });

});

/**
 * Opens the modal for special form config.
 */
$('#modal-for-data-collected-management').on('show.bs.modal', function (e) {
    var formName = $(e.relatedTarget).data('form-name');
    $(e.currentTarget).find('#management-title').text('Configurar Recolhas de "' + formName + '"');

    formIDForSpecialConfigs = $(e.relatedTarget).data('form-id');

    $.ajax({
        url: urlToPostSpecialConfigs,
        type: 'GET',
        data: {
            idForm: formIDForSpecialConfigs,
            csrfmiddlewaretoken: csrfToken
        },
        success: function (data) {
            // position 0: idTrialForm
            // position 1: scaleExplained

            if (data[1] == 'Y') {
                document.getElementById('display-scale').checked = true;
            } else {
                document.getElementById('display-scale').checked = false;
            }

            document.getElementById('trial-form').value = data[0];
        },
        error: function (data) {
            console.log(data.responseText);
        }
    });
});

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
        success: function (data) {
            $('#modal-for-access-granting').modal('hide');

            var response = data;
            toastr.success(response);
        },
        error: function (data) {
            $('#modal-for-access-granting').modal('hide');

            var response = data.responseText;
            toastr.error(response);
        }
    });
});

/**
 * Gets the correct form ID for URL generation.
 */
$('#modal-for-link-share').on('show.bs.modal', function (e) {
    var location = window.location.href;
    location = location.split("painel");
    //console.log(location[0]);

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

        tokenForParticipant = Math.random().toString(32).substring(2); //10

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
        $('#form-url').html('<div class="alert alert-success alert-dismissible" role="alert">' +
            '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
            '<strong>O link foi copiado!</strong></div>');
    } catch (err) {
        $('#form-url').html('<div class="alert alert-danger alert-dismissible" role="alert">' +
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
    $(e.currentTarget).find('#users-with-access').html("");

    $.ajax({
        url: urlToGetListUsersForm,
        type: 'GET',
        data: {
            idForm: formID,
            csrfmiddlewaretoken: csrfToken
        },
        success: function (data) {
            console.log(data[0][0]);
            console.log(data[0][1]);
            for(var i = 0; i < data.length; i++) {
                $(e.currentTarget).find('#users-with-access').append('<li class="list-group-item">' + data[i][0] + ', <b>' + data[i][1] + '</b></li>');
            }
        },
        error: function (data) {
            $(e.currentTarget).find('#users-with-access').html("");
            console.log(data.responseText);
        }
    });

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