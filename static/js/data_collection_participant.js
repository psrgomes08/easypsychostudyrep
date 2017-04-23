var token_inserted;

/**
 * Cleans the screen and starts the questionnaire.
 */
function cleanAndStartCP() {
    participantDataCollection.id = formConfiguration.id;

    date = new Date();
    participantDataCollection.timestampRecolha = date.getDate() + "/"
        + (date.getMonth() + 1) + "/"
        + date.getFullYear() + " "
        + date.getHours() + ":"
        + date.getMinutes() + ":"
        + date.getSeconds() + ":"
        + date.getMilliseconds(); // timestamp of the beginning of the data collecting

    participantDataCollection.idParticipante = participantID;
    participantDataCollection.colheita = [];
    passoColheita = {};

    $("#div-general-info").empty();
    $("#footer").remove();

    passoColheita.nPasso = formConfiguration.passos[step - 1].nPasso; // test
    passoColheita.nomePasso = formConfiguration.passos[step - 1].nomePasso;

    if (formConfiguration.passos[step - 1].hasOwnProperty("fixo")) {
        passoColheita.fixo = "sim";
    } else {
        passoColheita.fixo = "não";
    }

    displayScaleExplaining();

}

/**
 * Checks if the token inserted by the user is correct.
 */
function confirmPermission() {
    var location = window.location.href;
    location = location.split('?');
    token_inserted = location[1];
    console.log(token_inserted);


    $.ajax({
        url: urlForPermission,
        type: 'POST',
        data: {
            idForm: idForm,
            idParticipant: participantID,
            token: token_inserted,
            csrfmiddlewaretoken: csrfToken
        },
        success: function () {
            cleanAndStartCP();
        },
        error: function () {
            toastr.error('A senha inserida não é válida. <b>Por favor entre em contacto com o responsável.</b>');
        }
    });

}

/**
 * Posts the collected data to the Database
 */
function endDataCollectionCP() {

    dataCollection = JSON.stringify(participantDataCollection);

    $.ajax({
        url: urlToPostCP,
        type: 'POST',
        data: {
            idParticipant: participantID,
            idForm: formConfiguration.id,
            dataCollection: dataCollection,
            token: token_inserted,
            csrfmiddlewaretoken: csrfToken
        },
        success: function () {
            toastr.success('As suas respostas foram submetidas com sucesso! <b>Pode fechar esta janela.</b>');
            $("#end-button").hide();
        },
        error: function () {
            toastr.error('Ocorreu um problema na submissão das suas respostas. <b>Por favor entre em contacto com o responsável.</b>');
            $("#end-button").hide();
        }
    });

}