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

/**
 * Retrieves the data from participant.
 * @param idParticipant Participant ID
 * @param idForm Form ID
 */
function getDataFromParticipant(idParticipant, idForm) {
    $.ajax({
        url: urlToGetParticipantData,
        type: 'GET',
        data: {
            idParticipant: idParticipant,
            idForm: idForm,
            csrfmiddlewaretoken: csrfToken
        },
        success: function (data) {
            console.log(data);

            $("#participantData").show();
            $("#idParticipante").html(idParticipant);
            $("#timestampRecolha").html(data['timestampCollection']);
        },
        error: function (data) {
            toastr.error('Não é possível apresentar a informação relacionada com o participante ' + idParticipant);
            console.log(data.responseText);
        }
    });
}
