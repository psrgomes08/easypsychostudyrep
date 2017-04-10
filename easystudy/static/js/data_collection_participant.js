var participantDataCollection = {};
var date;
var token_inserted;

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
 * Displays stimulus inside of it's div.
 * @param step Step of the stimulus
 */
function displayStimulus(step) {
    var src = formConfiguration.passos[step - 1].fonteEstimulo;
    var newImage = document.createElement('img');
    newImage.src = src;
    newImage.width = 600;
    document.querySelector('#div-stimulus').innerHTML = newImage.outerHTML;
}

/**
 * Displays video stimulus inside of it's div.
 * @param step Step of the stimulus
 */
function displayStimulusVideo(step) {
    var buttonNext = '<button id="video-stimulus-btn" class="btn btn-md btn-success" onclick="checkInfoInField(2)">' +
        '<span class="glyphicon glyphicon-ok-circle"></span> Seguinte</button>';

    var src = formConfiguration.passos[step - 1].fonteEstimuloVideo;

    document.querySelector('#div-stimulus-video').innerHTML = '<video controls="controls" width="800">' +
        '<source src="' + src + '?raw=1" type="video/mp4">' +
        'O seu browser não suporta vídeo HTML5.' +
        '</video><br/><br/>';

    document.querySelector('#div-stimulus-video').innerHTML += buttonNext;
}

/**
 * Checks if a field in the form was filled by the participant.
 * @param id id of the field
 */
function checkInfoInField(id) {
    var errors = [];
    switch (id) {
        case 0: // for SAM scale
            if ($("#valenceRadios").length == 1) {
                if ($('input[name=optradio]:checked', '#valenceRadios').val() == null) {
                    errors.push("Por favor atribua uma classificação à Valência.");
                }
            }
            if ($("#arousalRadios").length == 1) {
                if ($('input[name=optradio]:checked', '#arousalRadios').val() == null) {
                    errors.push("Por favor atribua uma classificação ao Alerta.");
                }
            }
            if ($("#dominanceRadios").length == 1) {
                if ($('input[name=optradio]:checked', '#dominanceRadios').val() == null) {
                    errors.push("Por favor atribua uma classificação à Dominância.");
                }
            }
            if (errors.length != 0) {
                for (var i = 0; i < errors.length; i++) {
                    toastr.warning(errors[i], "");
                }
            } else {
                nextToDo("sam-scale-btn");
            }

            break;

        case 1: // for questions
            for (var i = 0; i < formConfiguration.passos[step - 1].questoes.length; i++) {
                if (document.getElementById("Q" + i).value == "") {
                    errors.push("Por favor responda à questão n.º " + (i + 1));
                }
            }

            if (errors.length != 0) {
                for (var i = 0; i < errors.length; i++) {
                    toastr.warning(errors[i], "");
                }
            } else {
                nextToDo("questions-btn");
            }

            break;

        case 2: // for video stimulus
            nextToDo("video-stimulus-btn");
            break;
    }
}

/**
 * Displays SAM scale inside of it's div.
 * @param step Step of the stimulus
 */
function displaySAMScale(step) {
    var buttonNext = '<button id="sam-scale-btn" class="btn btn-md btn-success" onclick="checkInfoInField(0)">' +
        '<span class="glyphicon glyphicon-ok-circle"></span> Seguinte</button>';

    var valence = '<img  src=' + valenceImage + ' ><br/>';
    var arousal = '<img src=' + arousalImage + '><br/>';
    var dominance = '<img src=' + dominanceImage + '><br/>';

    var titleValence = '<p><b>Valência Afetiva</b></p>';
    var titleArousal = '<p><b>Ativação Fisiológica</b></p>';
    var titleDominance = '<p><b>Dominância</b></p>';

    var scale;

    for (var i = 0; i < formConfiguration.passos[step - 1].escalasSAM.length; i++) {
        scale = formConfiguration.passos[step - 1].escalasSAM[i];

        var radioValence = '<form id="valenceRadios">' +
            '<input type="radio" name="optradio" value="1">' +
            '<input type="radio" name="optradio" value="2">' +
            '<input type="radio" name="optradio" value="3">' +
            '<input type="radio" name="optradio" value="4">' +
            '<input type="radio" name="optradio" value="5">' +
            '<input type="radio" name="optradio" value="6">' +
            '<input type="radio" name="optradio" value="7">' +
            '<input type="radio" name="optradio" value="8">' +
            '<input type="radio" name="optradio" value="9">' +
            '</form>';

        var radioArousal = '<form id="arousalRadios">' +
            '<input type="radio" name="optradio" value="1">' +
            '<input type="radio" name="optradio" value="2">' +
            '<input type="radio" name="optradio" value="3">' +
            '<input type="radio" name="optradio" value="4">' +
            '<input type="radio" name="optradio" value="5">' +
            '<input type="radio" name="optradio" value="6">' +
            '<input type="radio" name="optradio" value="7">' +
            '<input type="radio" name="optradio" value="8">' +
            '<input type="radio" name="optradio" value="9">' +
            '</form>';

        var radioDominance = '<form id="dominanceRadios">' +
            '<input type="radio" name="optradio" value="1">' +
            '<input type="radio" name="optradio" value="2">' +
            '<input type="radio" name="optradio" value="3">' +
            '<input type="radio" name="optradio" value="4">' +
            '<input type="radio" name="optradio" value="5">' +
            '<input type="radio" name="optradio" value="6">' +
            '<input type="radio" name="optradio" value="7">' +
            '<input type="radio" name="optradio" value="8">' +
            '<input type="radio" name="optradio" value="9">' +
            '</form>';

        if (scale == "valência") {
            document.querySelector('#div-SAMScales').innerHTML += titleValence + valence + radioValence;
        } else if (scale == "alerta") {
            document.querySelector('#div-SAMScales').innerHTML += titleArousal + arousal + radioArousal;
        }
        else {
            document.querySelector('#div-SAMScales').innerHTML += titleDominance + dominance + radioDominance;
        }
    }

    document.querySelector('#div-SAMScales').innerHTML += buttonNext;
}

/**
 * Displays questions inside of it's div.
 * @param step Step of the stimulus
 */
function displayQuestions(step) {
    var buttonNext = '<button id="questions-btn" class="btn btn-md btn-success" onclick="checkInfoInField(1)">' +
        '<span class="glyphicon glyphicon-ok-circle"></span> Seguinte</button>';

    for (var i = 0; i < formConfiguration.passos[step - 1].questoes.length; i++) {

        var label = "<label>" + formConfiguration.passos[step - 1].questoes[i] + "</label><br/>";
        var input = "<p align='center'><input style='width: 70%;' id='Q" + i + "' type='text' class='form-control'></p><br/>";

        document.querySelector('#div-questions').innerHTML += (label + input);
    }

    document.querySelector('#div-questions').innerHTML += buttonNext;
}

/**
 * Displays description inside of it's div.
 * @param step Step of the stimulus
 */
function displayDescription(step) {
    var buttonNext = '<button id="description-btn" class="btn btn-md btn-success" onclick="nextToDo()">' +
        '<span class="glyphicon glyphicon-ok-circle"></span> Seguinte</button>';

    var formatedStepDescription = formConfiguration.passos[step - 1].descricaoPasso;
    formatedStepDescription = formatedStepDescription.replace(/\n/g, "<br/>");

    var stepDescription = "<p>" + formatedStepDescription + "</p>";

    document.querySelector('#div-description').innerHTML += stepDescription + buttonNext;
}

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 * @param array array to be randomized
 * @return randomized array
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

/**
 * Checks if the token inserted by the user is correct.
 */
function confirmPermission() {
    token_inserted = $("#token").val();

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
            //toastr.success('Válido.');
            cleanAndStart();
        },
        error: function () {
            toastr.error('A senha inserida não é válida. <b>Por favor entre em contacto com o responsável.</b>');
        }
    });

}

/**
 * Cleans the screen and starts the questionnaire.
 */
function cleanAndStart() {
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

    //passoColheita.nPasso = step; // adds step to the JSON
    passoColheita.nPasso = formConfiguration.passos[step - 1].nPasso; // test
    passoColheita.nomePasso = formConfiguration.passos[step - 1].nomePasso;

    if (formConfiguration.passos[step - 1].hasOwnProperty("fixo")) {
        passoColheita.fixo = "sim";
    } else {
        passoColheita.fixo = "não";
    }

    nextDecider(); // starts to see if there is a stimulus in the first step

    //passoColheita.nPasso = step; // adds step to the JSON

    //participantDataCollection.colheita.push(configPassoColheita);

}

/**
 * Called by the elements to find out what to do next.
 */
function nextToDo() {
    var id = event.target.id; // to see which button triggered the function

    switch (id) {
        case "sam-scale-btn": // the trigger came from SAM, check if has question
            //colect data from scales
            var valenceValue = $('input[name=optradio]:checked', '#valenceRadios').val();
            var arousalValue = $('input[name=optradio]:checked', '#arousalRadios').val();
            var dominanceValue = $('input[name=optradio]:checked', '#dominanceRadios').val();

            escalas = {};
            escalas.valencia = valenceValue;
            escalas.alerta = arousalValue;
            escalas.dominancia = dominanceValue;
            passoColheita.colheitaEscalas = escalas;

            date = new Date();
            passoColheita.timestampEscalas = date.getDate() + "/"
                + (date.getMonth() + 1) + "/"
                + date.getFullYear() + " "
                + date.getHours() + ":"
                + date.getMinutes() + ":"
                + date.getSeconds() + ":"
                + date.getMilliseconds(); // collect the timestamp of the stimulus display

            $("#div-SAMScales").empty();

            if ((formConfiguration.passos[step - 1].hasOwnProperty("questoes")) && (formConfiguration.passos[step - 1].questoes.length > 0)) {
                displayQuestions(step);
            }
            else {
                participantDataCollection.colheita.push(passoColheita); // when the stimulus is the last in the step

                passoColheita = {};

                currentIndex++;
                if (currentIndex == newForm.length) { // If there are no more steps
                    document.querySelector('#div-general-info').innerHTML = endMessage + endButton;
                } else {
                    step = newForm[currentIndex];

                    //passoColheita.nPasso = step;
                    passoColheita.nPasso = formConfiguration.passos[step - 1].nPasso; // test
                    passoColheita.nomePasso = formConfiguration.passos[step - 1].nomePasso;

                    if (formConfiguration.passos[step - 1].hasOwnProperty("fixo")) {
                        passoColheita.fixo = "sim";
                    } else {
                        passoColheita.fixo = "não";
                    }

                    nextDecider();
                }
            }
            break;

        case "questions-btn":
            // collect data from questions
            arrayQuestoes = [];

            for (var i = 0; i < formConfiguration.passos[step - 1].questoes.length; i++) {
                arrayQuestoes.push(document.getElementById("Q" + i).value);
            }
            passoColheita.colheitaQuestoes = arrayQuestoes;

            date = new Date();
            passoColheita.timestampQuestoes = date.getDate() + "/"
                + (date.getMonth() + 1) + "/"
                + date.getFullYear() + " "
                + date.getHours() + ":"
                + date.getMinutes() + ":"
                + date.getSeconds() + ":"
                + date.getMilliseconds(); // collect the timestamp of the stimulus display

            participantDataCollection.colheita.push(passoColheita); // question is always the last element in a step

            passoColheita = {}; // question is the last element in a step, so in the end clean

            $("#div-questions").empty();
            currentIndex++;
            if (currentIndex == newForm.length) { // if there are no more steps
                document.querySelector('#div-general-info').innerHTML = endMessage + endButton; // presents end message

            } else {
                step = newForm[currentIndex];

                //passoColheita.nPasso = step;
                passoColheita.nPasso = formConfiguration.passos[step - 1].nPasso; // test
                passoColheita.nomePasso = formConfiguration.passos[step - 1].nomePasso;

                if (formConfiguration.passos[step - 1].hasOwnProperty("fixo")) {
                    passoColheita.fixo = "sim";
                } else {
                    passoColheita.fixo = "não";
                }

                nextDecider();
            }
            break;

        case "description-btn":
            $("#div-description").empty();
            currentIndex++;
            if (currentIndex == newForm.length) { // if there are no more steps
                document.querySelector('#div-general-info').innerHTML = endMessage + endButton; // presents end message
            } else {
                step = newForm[currentIndex];

                //passoColheita.nPasso = step;
                passoColheita.nPasso = formConfiguration.passos[step - 1].nPasso; // test
                passoColheita.nomePasso = formConfiguration.passos[step - 1].nomePasso;

                if (formConfiguration.passos[step - 1].hasOwnProperty("fixo")) {
                    passoColheita.fixo = "sim";
                } else {
                    passoColheita.fixo = "não";
                }

                nextDecider();
            }
            break;

        case "video-stimulus-btn":
            passoColheita.nomeDoEstimuloVideo = formConfiguration.passos[step - 1].nomeDoEstimuloVideo;

            date = new Date();
            passoColheita.timeStampEstimuloVideo = date.getDate() + "/"
                + (date.getMonth() + 1) + "/"
                + date.getFullYear() + " "
                + date.getHours() + ":"
                + date.getMinutes() + ":"
                + date.getSeconds() + ":"
                + date.getMilliseconds(); // collect the timestamp of the video stimulus display

            $("#div-stimulus-video").empty();

            if ((formConfiguration.passos[step - 1].hasOwnProperty("escalasSAM")) && (formConfiguration.passos[step - 1].escalasSAM.length > 0)) {
                displaySAMScale(step);
            } else if ((formConfiguration.passos[step - 1].hasOwnProperty("questoes")) && (formConfiguration.passos[step - 1].questoes.length > 0)) {
                displayQuestions(step);
            } else {
                participantDataCollection.colheita.push(passoColheita); // when the stimulus is the last in the step

                passoColheita = {};

                currentIndex++;
                if (currentIndex == newForm.length) { // If there are no more steps
                    document.querySelector('#div-general-info').innerHTML = endMessage + endButton;
                } else {
                    step = newForm[currentIndex];

                    //passoColheita.nPasso = step;
                    passoColheita.nPasso = formConfiguration.passos[step - 1].nPasso; // test
                    passoColheita.nomePasso = formConfiguration.passos[step - 1].nomePasso;

                    if (formConfiguration.passos[step - 1].hasOwnProperty("fixo")) {
                        passoColheita.fixo = "sim";
                    } else {
                        passoColheita.fixo = "não";
                    }

                    nextDecider();
                }
            }

            break;
    }

}

/**
 * To make the correct display of stimulus.
 */
function nextDecider() {

    if ((formConfiguration.passos[step - 1].hasOwnProperty("fonteEstimulo")) && (formConfiguration.passos[step - 1].fonteEstimulo.length > 0)) {
        var time = formConfiguration.passos[step - 1].tempoEstimulo;

        displayStimulus(step);

        setTimeout(function () {
            passoColheita.nomeDoEstimulo = formConfiguration.passos[step - 1].nomeDoEstimulo; // collect the name of the stimulus

            date = new Date();
            passoColheita.timestampEstimulo = date.getDate() + "/"
                + (date.getMonth() + 1) + "/"
                + date.getFullYear() + " "
                + date.getHours() + ":"
                + date.getMinutes() + ":"
                + date.getSeconds() + ":"
                + date.getMilliseconds(); // collect the timestamp of the stimulus display

            $('#div-stimulus').empty();

            if ((formConfiguration.passos[step - 1].hasOwnProperty("escalasSAM")) && (formConfiguration.passos[step - 1].escalasSAM.length > 0)) {
                displaySAMScale(step);
            }
            else if ((formConfiguration.passos[step - 1].hasOwnProperty("questoes")) && (formConfiguration.passos[step - 1].questoes.length > 0)) { // if the stimulus doesn't have a scale check for questions
                displayQuestions(step);
            }
            else {
                passoColheita = {};
                currentIndex++;
                if (currentIndex == newForm.length) { // if there are no more steps
                    document.querySelector('#div-general-info').innerHTML = endMessage + endButton; // presents end message

                } else {
                    step = newForm[currentIndex];
                    //passoColheita.nPasso = step;
                    passoColheita.nPasso = formConfiguration.passos[step - 1].nPasso; // test
                    passoColheita.nomePasso = formConfiguration.passos[step - 1].nomePasso;

                    if (formConfiguration.passos[step - 1].hasOwnProperty("fixo")) {
                        passoColheita.fixo = "sim";
                    } else {
                        passoColheita.fixo = "não";
                    }

                    nextDecider();
                }
            }
        }, time * 1000); // <-- time in milliseconds

    } else if ((formConfiguration.passos[step - 1].hasOwnProperty("descricaoPasso")) && (formConfiguration.passos[step - 1].descricaoPasso.length > 0)) { // if the step has no stimulus, it can have a description
        displayDescription(step);
    } else if ((formConfiguration.passos[step - 1].hasOwnProperty("fonteEstimuloVideo")) && (formConfiguration.passos[step - 1].fonteEstimuloVideo.length > 0)) {
        displayStimulusVideo(step);
    } else { // if the step has no stimulus and no description, it has to have questions
        if ((formConfiguration.passos[step - 1].hasOwnProperty("questoes")) && (formConfiguration.passos[step - 1].questoes.length > 0)) {
            displayQuestions(step);
        }
    }
}

/**
 * Posts the collected data to the Database
 */
function endDataCollection() {

    dataCollection = JSON.stringify(participantDataCollection);

    $.ajax({
        url: urlToPost,
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