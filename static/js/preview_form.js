var participantDataCollection = {};
var idParticipante;
var date;

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

    document.querySelector('#div-stimulus').innerHTML = '<p align="center"><img src="' + src + '" class="img-responsive"></p><button class="btn btn-md btn-danger" title="Fechar pré-visualização" onclick="closeVisualization()"><span class="glyphicon glyphicon-remove-circle"></span> Fechar</button>'; // responsive image
}

/**
 * Displays video stimulus inside of it's div.
 * @param step Step of the stimulus
 */
function displayStimulusVideo(step) {
    var buttonNext = '<button id="video-stimulus-btn" class="btn btn-md btn-success" onclick="checkInfoInField(2)">' +
        '<span class="glyphicon glyphicon-ok-circle"></span> Seguinte</button>' +
        ' <button class="btn btn-md btn-danger" title="Fechar pré-visualização" onclick="closeVisualization()"><span class="glyphicon glyphicon-remove-circle"></span> Fechar</button>';

    var src = formConfiguration.passos[step - 1].fonteEstimuloVideo;

    document.querySelector('#div-stimulus-video').innerHTML = '<div class="sizer">' +
        '<div align="center" class="embed-responsive embed-responsive-16by9">' +
        '<video controls="controls" class="embed-responsive-item">' +
        '<source src="' + src + '?raw=1" type="video/mp4">' +
        'O seu browser não suporta vídeo HTML5.' +
        '</video>' +
        '</div>' +
        '</div><br/><br/>';

    document.querySelector('#div-stimulus-video').innerHTML += buttonNext;
}

/**
 * Checks if a field in the form was filled by the participant.
 * @param id id of the field
 */
function checkInfoInField(id) {
    switch (id) {
        case 0: // for SAM scale
            nextToDo("sam-scale-btn");
            break;

        case 1: // for questions
            nextToDo("questions-btn");
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
        '<span class="glyphicon glyphicon-ok-circle"></span> Seguinte</button>' +
        ' <button class="btn btn-md btn-danger" title="Fechar pré-visualização" onclick="closeVisualization()"><span class="glyphicon glyphicon-remove-circle"></span> Fechar</button>';

    //var valence = '<img class="img-responsive"  src=' + valenceImage + ' ><br/>';
    //var arousal = '<img class="img-responsive" src=' + arousalImage + '><br/>';
    //var dominance = '<img class="img-responsive" src=' + dominanceImage + '><br/>';

    var titleValence = '<p><b>Valência Afetiva</b></p>';
    var titleArousal = '<p><b>Ativação Fisiológica</b></p>';
    var titleDominance = '<p><b>Dominância</b></p>';

    var scale;

    for (var i = 0; i < formConfiguration.passos[step - 1].escalasSAM.length; i++) {
        scale = formConfiguration.passos[step - 1].escalasSAM[i];

        var radioValence = '<form id="valenceRadios"><div class="cc-selector">' +
            '<input id="valence1" type="radio" name="optradio" value="1" />' +
            '<label class="drinkcard-cc valence1" for="valence1"></label>' +
            '<input id="valence2" type="radio" name="optradio" value="2" />' +
            '<label class="drinkcard-cc valence2" for="valence2"></label>' +
            '<input id="valence3" type="radio" name="optradio" value="3" />' +
            '<label class="drinkcard-cc valence3" for="valence3"></label>' +
            '<input id="valence4" type="radio" name="optradio" value="4" />' +
            '<label class="drinkcard-cc valence4" for="valence4"></label>' +
            '<input id="valence5" type="radio" name="optradio" value="5" />' +
            '<label class="drinkcard-cc valence5" for="valence5"></label>' +
            '<input id="valence6" type="radio" name="optradio" value="6" />' +
            '<label class="drinkcard-cc valence6" for="valence6"></label>' +
            '<input id="valence7" type="radio" name="optradio" value="7" />' +
            '<label class="drinkcard-cc valence7" for="valence7"></label>' +
            '<input id="valence8" type="radio" name="optradio" value="8" />' +
            '<label class="drinkcard-cc valence8" for="valence8"></label>' +
            '<input id="valence9" type="radio" name="optradio" value="9" />' +
            '<label class="drinkcard-cc valence9" for="valence9"></label>' +
            '</div></form>';

        var radioArousal = '<form id="arousalRadios"><div class="cc-selector">' +
            '<input id="arousal1" type="radio" name="optradio" value="1" />' +
            '<label class="drinkcard-cc arousal1" for="arousal1"></label>' +
            '<input id="arousal2" type="radio" name="optradio" value="2" />' +
            '<label class="drinkcard-cc arousal2" for="arousal2"></label>' +
            '<input id="arousal3" type="radio" name="optradio" value="3" />' +
            '<label class="drinkcard-cc arousal3" for="arousal3"></label>' +
            '<input id="arousal4" type="radio" name="optradio" value="4" />' +
            '<label class="drinkcard-cc arousal4" for="arousal4"></label>' +
            '<input id="arousal5" type="radio" name="optradio" value="5" />' +
            '<label class="drinkcard-cc arousal5" for="arousal5"></label>' +
            '<input id="arousal6" type="radio" name="optradio" value="6" />' +
            '<label class="drinkcard-cc arousal6" for="arousal6"></label>' +
            '<input id="arousal7" type="radio" name="optradio" value="7" />' +
            '<label class="drinkcard-cc arousal7" for="arousal7"></label>' +
            '<input id="arousal8" type="radio" name="optradio" value="8" />' +
            '<label class="drinkcard-cc arousal8" for="arousal8"></label>' +
            '<input id="arousal9" type="radio" name="optradio" value="9" />' +
            '<label class="drinkcard-cc arousal9" for="arousal9"></label>' +
            '</div></form>';

        var radioDominance = '<form id="dominanceRadios"><div class="cc-selector">' +
            '<input id="dominance1" type="radio" name="optradio" value="1" />' +
            '<label class="drinkcard-cc dominance1" for="dominance1"></label>' +
            '<input id="dominance2" type="radio" name="optradio" value="2" />' +
            '<label class="drinkcard-cc dominance2" for="dominance2"></label>' +
            '<input id="dominance3" type="radio" name="optradio" value="3" />' +
            '<label class="drinkcard-cc dominance3" for="dominance3"></label>' +
            '<input id="dominance4" type="radio" name="optradio" value="4" />' +
            '<label class="drinkcard-cc dominance4" for="dominance4"></label>' +
            '<input id="dominance5" type="radio" name="optradio" value="5" />' +
            '<label class="drinkcard-cc dominance5" for="dominance5"></label>' +
            '<input id="dominance6" type="radio" name="optradio" value="6" />' +
            '<label class="drinkcard-cc dominance6" for="dominance6"></label>' +
            '<input id="dominance7" type="radio" name="optradio" value="7" />' +
            '<label class="drinkcard-cc dominance7" for="dominance7"></label>' +
            '<input id="dominance8" type="radio" name="optradio" value="8" />' +
            '<label class="drinkcard-cc dominance8" for="dominance8"></label>' +
            '<input id="dominance9" type="radio" name="optradio" value="9" />' +
            '<label class="drinkcard-cc dominance9" for="dominance9"></label>' +
            '</div></form>';

        /*
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
         */

        if (scale == "Valência") {
            document.querySelector('#div-SAMScales').innerHTML += titleValence + radioValence;
        } else if (scale == "Alerta") {
            document.querySelector('#div-SAMScales').innerHTML += titleArousal + radioArousal;
        }
        else {
            document.querySelector('#div-SAMScales').innerHTML += titleDominance + radioDominance;
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
        '<span class="glyphicon glyphicon-ok-circle"></span> Seguinte</button>' +
        ' <button class="btn btn-md btn-danger" title="Fechar pré-visualização" onclick="closeVisualization()"><span class="glyphicon glyphicon-remove-circle"></span> Fechar</button>';

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
        '<span class="glyphicon glyphicon-ok-circle"></span> Seguinte</button>' +
        ' <button class="btn btn-md btn-danger" title="Fechar pré-visualização" onclick="closeVisualization()"><span class="glyphicon glyphicon-remove-circle"></span> Fechar</button>';

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
 * Displays an explaining example of the scales used in the form.
 */
function displayScaleExplaining() {
    var scalesPresent = [];
    var hasScales = false;

    for (var i = 0; i < sizeOfForm; i++) {
        if (formConfiguration.passos[i].hasOwnProperty("escalasSAM") && formConfiguration.passos[i].escalasSAM.length > 0) {
            hasScales = true;
            break;
        }
    }

    if (hasScales) {
        // Checks what scales are going to be presented in the form
        for (var i = 0; i < sizeOfForm; i++) {
            if (formConfiguration.passos[i].hasOwnProperty("escalasSAM")) {

                for (var j = 0; j < formConfiguration.passos[i].escalasSAM.length; j++) {
                    if (formConfiguration.passos[i].escalasSAM[j] == "Valência") {
                        if (scalesPresent.indexOf("Valência") <= -1) {
                            scalesPresent.push("Valência");
                        }

                    }
                    else if (formConfiguration.passos[i].escalasSAM[j] == "Alerta") {
                        if (scalesPresent.indexOf("Alerta") <= -1) {
                            scalesPresent.push("Alerta");
                        }
                    }
                    else {
                        if (scalesPresent.indexOf("Dominância") <= -1) {
                            scalesPresent.push("Dominância");
                        }
                    }
                }
            }
        }

        $("#div-instructions").append(
            "<h3>Neste questionário irá visualizar alguns estímulos.<br/>" +
            "Após cada um deles ser-lhe-ão apresentadas escalas que irão avaliar como se sentiu ao visualizá-los.</h3>"
        );

        for (var i = 0; i < scalesPresent.length; i++) {
            if (scalesPresent[i] == "Valência") {
                $("#div-instructions").append(
                    "<br/><p><b style='color: #428BCA'>Valência Afetiva</b><br/><b>Triste &#8212; Feliz</b></p>" +
                    "<p align='center'><img class='img-responsive'  src=" + valenceImage + " ></p>");
            }
            else if (scalesPresent[i] == "Alerta") {
                $("#div-instructions").append(
                    "<br/><p><b style='color: #428BCA'>Ativação Fisiológica</b><br/><b>Calmo &#8212; Muito Impactado</b></p>" +
                    "<p>Pode sentir-se tão impactado por um estímulo positivo quanto por um estímulo negativo.</p>" +
                    "<p align='center'><img class='img-responsive'  src=" + arousalImage + " ></p>");
            }
            else {
                $("#div-instructions").append(
                    "<br/><p><b style='color: #428BCA'>Dominância</b><br/><b>Dominante &#8212; Dominado</b></p>" +
                    "<p align='center'><img class='img-responsive'  src=" + dominanceImage + " ></p>");
            }
        }

        $("#div-instructions").append(
            "<br/><p><b>Por favor mantenha-se concentrado durante todo o questionário.</b>" +
            "<br/><br/><button type='button' class='btn btn-primary' onclick='nextDecider()'> <span class='glyphicon glyphicon-ok'></span> Compreendi</button>" +
            " <button class='btn btn-md btn-danger' onclick='closeVisualization()'><span class='glyphicon glyphicon-remove-circle'></span> Fechar</button>" +
            "</p>" +
            "<p></p>");
    } // <!-- ./if hasScales -->
    else {
        nextDecider();
    }

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

    idParticipante = document.getElementById("id-participante").value;
    participantDataCollection.idParticipante = idParticipante;
    participantDataCollection.colheita = [];
    passoColheita = {};

    $("#div-general-info").empty();
    $("#footer").remove();

    passoColheita.nPasso = step; // adds step to the JSON
    passoColheita.nomePasso = formConfiguration.passos[step - 1].nomePasso;

    if (formConfiguration.passos[step - 1].hasOwnProperty("fixo")) {
        passoColheita.fixo = "sim";
    } else {
        passoColheita.fixo = "não";
    }

    displayScaleExplaining(); // starts to see if there is a stimulus in the first step

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

                    passoColheita.nPasso = step;
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

                passoColheita.nPasso = step;
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

    $("#div-instructions").empty();

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
                    passoColheita.nPasso = step;
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
 * Closes the window were the visualization was displayed.
 */
function closeVisualization() {
    window.open('', '_self', '');
    window.close();
}