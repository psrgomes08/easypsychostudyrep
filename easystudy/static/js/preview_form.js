var participantDataCollection = {};
var idParticipante;
var date;
var stepOrderForProgress = 0;

toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": false,
    "progressBar": true,
    "positionClass": "toast-top-left",
    "preventDuplicates": true,
    "onclick": null,
    "showDuration": "0",
    "hideDuration": "0",
    "timeOut": "10000",
    "extendedTimeOut": "5000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
};

/**
 * Updates the progress bar.
 * @param currentStep number of th current step
 */
function updateProgress(currentStep) {
    var percentage = ((currentStep * 100) / sizeOfForm);
    var result = Math.floor(percentage);
    $('.progress-bar').css('width', result + '%').attr('aria-valuenow', result);
    document.getElementById("progress-number").innerHTML = result + "%";
    //console.log("Passo " + currentStep + ": " + result);
}

/**
 * Displays stimulus inside of it's div.
 * @param step Step of the stimulus
 */
function displayStimulus(step) {
    $("#div-progress").hide();

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

        case 3: // for description
            nextToDo("description-btn");
            break;

        case 4: // for Likert scale
            nextToDo("likert-btn");
            break;
    }
}

/**
 * Displays SAM scale inside of it's div.
 * @param step Step of the stimulus
 */
function displaySAMScale(step) {
    $("#div-progress").show();

    var buttonNext = '<button id="sam-scale-btn" class="btn btn-md btn-success" onclick="checkInfoInField(0)">' +
        '<span class="glyphicon glyphicon-ok-circle"></span> Seguinte</button>' +
        ' <button class="btn btn-md btn-danger" title="Fechar pré-visualização" onclick="closeVisualization()"><span class="glyphicon glyphicon-remove-circle"></span> Fechar</button>';

    var titleValence = '<p>Avalie o estímulo que acabou de visualizar quanto à dimensão de<br/><b>Valência Afetiva</b></p>';
    var titleArousal = '<p>Avalie o estímulo que acabou de visualizar quanto à dimensão de<br/><b>Ativação Fisiológica</b></p>';
    var titleDominance = '<p>Avalie o estímulo que acabou de visualizar quanto à dimensão de<br/><b>Dominância</b></p>';

    var scale;

    for (var i = 0; i < formConfiguration.passos[step - 1].escalasSAM.length; i++) {
        scale = formConfiguration.passos[step - 1].escalasSAM[i];

        var radioValence = '<div class="stop-wrap"><form id="valenceRadios"><div class="cc-selector">' +
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
            '</div></form></div><br/><br/>';

        var radioArousal = '<div class="stop-wrap"><form id="arousalRadios"><div class="cc-selector">' +
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
            '</div></form></div><br/><br/>';

        var radioDominance = '<div class="stop-wrap"><form id="dominanceRadios"><div class="cc-selector">' +
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
            '</div></form></div><br/><br/>';

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
    var buttonNext = '<button id="description-btn" class="btn btn-md btn-success" onclick="checkInfoInField(3)">' +
        '<span class="glyphicon glyphicon-ok-circle"></span> Seguinte</button>' +
        ' <button class="btn btn-md btn-danger" title="Fechar pré-visualização" onclick="closeVisualization()"><span class="glyphicon glyphicon-remove-circle"></span> Fechar</button>';

    var formatedStepDescription = formConfiguration.passos[step - 1].descricaoPasso;
    formatedStepDescription = formatedStepDescription.replace(/\n/g, "<br/>");

    var stepDescription = "<p>" + formatedStepDescription + "</p>";

    document.querySelector('#div-description').innerHTML += stepDescription + buttonNext;
}

/**
 * Displays a table with likert scale.
 * @param step Step of the likert scale
 */
function displayLikertScale(step) {
    $("#div-progress").show();

    var buttonNext = '<button id="description-btn" class="btn btn-md btn-success" onclick="checkInfoInField(4)">' +
        '<span class="glyphicon glyphicon-ok-circle"></span> Seguinte</button>' +
        ' <button class="btn btn-md btn-danger" title="Fechar pré-visualização" onclick="closeVisualization()"><span class="glyphicon glyphicon-remove-circle"></span> Fechar</button>';

    var nLikertPoints = formConfiguration.passos[step - 1].nPontosLikert;

    switch (nLikertPoints) {
        case "5Pontos":
            var likert5Points = ["Discordo<br/>Totalmente", "Discordo<br/>Parcialmente", "Indiferente", "Concordo<br/>Parcialmente", "Concordo<br/>Totalmente"];

            var likert5Table = '<div class="table-responsive"><table class="table table-striped table-condensed css-table">'; // opens the table

            // Appends the head of the table
            likert5Table += '<thead>' +
                '<tr>' +
                '<th></th>' + // the first is empty
                '<th>' + likert5Points[0] + '</th>' +
                '<th>' + likert5Points[1] + '</th>' +
                '<th>' + likert5Points[2] + '</th>' +
                '<th>' + likert5Points[3] + '</th>' +
                '<th>' + likert5Points[4] + '</th>' +
                '</tr>' +
                '</thead><tbody>';

            var likertQuestionsForTable = formConfiguration.passos[step - 1].questoesLikert;

            for (var l = 0; l < likertQuestionsForTable.length; l++) {
                likert5Table += '<tr>' +
                    '<td>' + likertQuestionsForTable[l] + '</td>' +
                    '<form id="likert-question-' + l + '">' +
                    '<td><input type="radio" name="optLikertradio-' + l + '" value="1" /></td>' +
                    '<td><input type="radio" name="optLikertradio-' + l + '" value="2" /></td>' +
                    '<td><input type="radio" name="optLikertradio-' + l + '" value="3" /></td>' +
                    '<td><input type="radio" name="optLikertradio-' + l + '" value="4" /></td>' +
                    '<td><input type="radio" name="optLikertradio-' + l + '" value="5" /></td>' +
                    '</form>' +
                    '</tr>';
            }

            likert5Table += '</tbody></table></div>';

            document.querySelector('#div-likert').innerHTML += likert5Table + buttonNext;

            break;
        case "7Pontos":
            var likert7Points = ["Discordo<br/>Totalmente", "Discordo<br/>Moderadamente", "Discordo<br/>Ligeiramente", "Indiferente", "Concordo<br/>Ligeiramente", "Concordo<br/>Moderadamente", "Concordo<br/>Totalmente"];

            var likert7Table = '<div class="table-responsive"><table class="table table-striped table-condensed css-table">'; // opens the table

            // Appends the head of the table
            likert7Table += '<thead>' +
                '<tr>' +
                '<th></th>' + // the first is empty
                '<th>' + likert7Points[0] + '</th>' +
                '<th>' + likert7Points[1] + '</th>' +
                '<th>' + likert7Points[2] + '</th>' +
                '<th>' + likert7Points[3] + '</th>' +
                '<th>' + likert7Points[4] + '</th>' +
                '<th>' + likert7Points[5] + '</th>' +
                '<th>' + likert7Points[6] + '</th>' +
                '</tr>' +
                '</thead><tbody>';

            var likertQuestionsForTable = formConfiguration.passos[step - 1].questoesLikert;

            for (var l = 0; l < likertQuestionsForTable.length; l++) {
                likert7Table += '<tr>' +
                    '<td>' + likertQuestionsForTable[l] + '</td>' +
                    '<form id="likert-question-' + l + '">' +
                    '<td><input type="radio" name="optLikertradio-' + l + '" value="1" /></td>' +
                    '<td><input type="radio" name="optLikertradio-' + l + '" value="2" /></td>' +
                    '<td><input type="radio" name="optLikertradio-' + l + '" value="3" /></td>' +
                    '<td><input type="radio" name="optLikertradio-' + l + '" value="4" /></td>' +
                    '<td><input type="radio" name="optLikertradio-' + l + '" value="5" /></td>' +
                    '<td><input type="radio" name="optLikertradio-' + l + '" value="6" /></td>' +
                    '<td><input type="radio" name="optLikertradio-' + l + '" value="7" /></td>' +
                    '</form>' +
                    '</tr>';
            }

            likert7Table += '</tbody></table></div>';

            document.querySelector('#div-likert').innerHTML += likert7Table + buttonNext;

            break;
    }
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

    idParticipante = "p000";
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

    nextDecider(); // starts to see if there is a stimulus in the first step

}

/**
 * Called by the elements to find out what to do next.
 */
function nextToDo(id) {
    //var id = event.target.id; // to see which button triggered the function

    switch (id) {
        case "likert-btn": // the trigget came from likert
            var likertQuestionsForTable = formConfiguration.passos[step - 1].questoesLikert;
            var likertRespostas = [];

            for (var ql = 0; ql < likertQuestionsForTable.length; ql++) {
                var qlValue = $("input[name=optLikertradio-" + ql + "]:checked").val();
                likertRespostas.push(qlValue);
            }

            passoColheita.colheitaLikert = likertRespostas;
            //console.log(passoColheita.colheitaLikert);

            date = new Date();
            passoColheita.timestampLikert = date.getDate() + "/"
                + (date.getMonth() + 1) + "/"
                + date.getFullYear() + " "
                + date.getHours() + ":"
                + date.getMinutes() + ":"
                + date.getSeconds() + ":"
                + date.getMilliseconds(); // collect the timestamp of the stimulus display

            $("#div-likert").empty();

            // Has questions next?
            if ((formConfiguration.passos[step - 1].hasOwnProperty("questoes")) && (formConfiguration.passos[step - 1].questoes.length > 0)) {
                displayQuestions(step);
            }
            // Likert is the last in step
            else {
                participantDataCollection.colheita.push(passoColheita); // when the likert is the last in the step

                passoColheita = {};

                currentIndex++;
                if (currentIndex == newForm.length) { // If there are no more steps
                    document.querySelector('#div-general-info').innerHTML = endMessage + endButton;
                    $("#div-progress").hide();
                } else {
                    step = newForm[currentIndex];

                    //passoColheita.nPasso = step;
                    passoColheita.nPasso = formConfiguration.passos[step - 1].nPasso; // test
                    passoColheita.nomePasso = formConfiguration.passos[step - 1].nomePasso;

                    stepOrderForProgress++;
                    updateProgress(stepOrderForProgress);

                    if (formConfiguration.passos[step - 1].hasOwnProperty("fixo")) {
                        passoColheita.fixo = "sim";
                    } else {
                        passoColheita.fixo = "não";
                    }

                    nextDecider();
                }
            }

            break;

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

            // Has Likert next?
            if ((formConfiguration.passos[step - 1].hasOwnProperty("nPontosLikert")) && (formConfiguration.passos[step - 1].questoesLikert.length > 0)) {
                displayLikertScale(step);
            }
            // Has questions next?
            else if ((formConfiguration.passos[step - 1].hasOwnProperty("questoes")) && (formConfiguration.passos[step - 1].questoes.length > 0)) {
                displayQuestions(step);
            }
            // SAM is the last in step
            else {
                participantDataCollection.colheita.push(passoColheita); // when the stimulus is the last in the step

                passoColheita = {};

                currentIndex++;
                if (currentIndex == newForm.length) { // If there are no more steps
                    document.querySelector('#div-general-info').innerHTML = endMessage + endButton;
                    $("#div-progress").hide();
                } else {
                    step = newForm[currentIndex];

                    //passoColheita.nPasso = step;
                    passoColheita.nPasso = formConfiguration.passos[step - 1].nPasso; // test
                    passoColheita.nomePasso = formConfiguration.passos[step - 1].nomePasso;

                    stepOrderForProgress++;
                    updateProgress(stepOrderForProgress);

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
                $("#div-progress").hide();
            } else {
                step = newForm[currentIndex];

                //passoColheita.nPasso = step;
                passoColheita.nPasso = formConfiguration.passos[step - 1].nPasso; // test
                passoColheita.nomePasso = formConfiguration.passos[step - 1].nomePasso;

                stepOrderForProgress++;
                updateProgress(stepOrderForProgress);

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
                $("#div-progress").hide();
            } else {
                step = newForm[currentIndex];

                //passoColheita.nPasso = step;
                passoColheita.nPasso = formConfiguration.passos[step - 1].nPasso; // test
                passoColheita.nomePasso = formConfiguration.passos[step - 1].nomePasso;

                stepOrderForProgress++;
                updateProgress(stepOrderForProgress);

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
            passoColheita.timestampEstimuloVideo = date.getDate() + "/"
                + (date.getMonth() + 1) + "/"
                + date.getFullYear() + " "
                + date.getHours() + ":"
                + date.getMinutes() + ":"
                + date.getSeconds() + ":"
                + date.getMilliseconds(); // collect the timestamp of the video stimulus display

            $("#div-stimulus-video").empty();

            // Has SAM scale?
            if ((formConfiguration.passos[step - 1].hasOwnProperty("escalasSAM")) && (formConfiguration.passos[step - 1].escalasSAM.length > 0)) {
                displaySAMScale(step);
            }
            // Has Likert scale?
            else if ((formConfiguration.passos[step - 1].hasOwnProperty("nPontosLikert")) && (formConfiguration.passos[step - 1].questoesLikert.length > 0)) {
                displayLikertScale(step);
            }
            // Has question?
            else if ((formConfiguration.passos[step - 1].hasOwnProperty("questoes")) && (formConfiguration.passos[step - 1].questoes.length > 0)) {
                displayQuestions(step);
            }
            // Video stimulus is the last in step
            else {
                participantDataCollection.colheita.push(passoColheita); // when the stimulus is the last in the step

                passoColheita = {};

                currentIndex++;
                if (currentIndex == newForm.length) { // If there are no more steps
                    document.querySelector('#div-general-info').innerHTML = endMessage + endButton;
                    $("#div-progress").hide();
                } else {
                    step = newForm[currentIndex];

                    //passoColheita.nPasso = step;
                    passoColheita.nPasso = formConfiguration.passos[step - 1].nPasso; // test
                    passoColheita.nomePasso = formConfiguration.passos[step - 1].nomePasso;

                    stepOrderForProgress++;
                    updateProgress(stepOrderForProgress);

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
    $("#div-progress").show();

    // Step begins with Image stimulus?
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

            // Has SAM scale?
            if ((formConfiguration.passos[step - 1].hasOwnProperty("escalasSAM")) && (formConfiguration.passos[step - 1].escalasSAM.length > 0)) {
                displaySAMScale(step);
            }
            // Has Likert scale?
            else if ((formConfiguration.passos[step - 1].hasOwnProperty("nPontosLikert")) && (formConfiguration.passos[step - 1].questoesLikert.length > 0)) {
                displayLikertScale(step);
            }
            // Has questions?
            else if ((formConfiguration.passos[step - 1].hasOwnProperty("questoes")) && (formConfiguration.passos[step - 1].questoes.length > 0)) {
                displayQuestions(step);
            }
            // Does not have anything
            else {
                passoColheita = {};
                currentIndex++;
                if (currentIndex == newForm.length) { // if there are no more steps
                    document.querySelector('#div-general-info').innerHTML = endMessage + endButton; // presents end message
                    $("#div-progress").hide();
                } else {
                    step = newForm[currentIndex];
                    //passoColheita.nPasso = step;
                    passoColheita.nPasso = formConfiguration.passos[step - 1].nPasso;
                    passoColheita.nomePasso = formConfiguration.passos[step - 1].nomePasso;

                    stepOrderForProgress++;
                    updateProgress(stepOrderForProgress);

                    if (formConfiguration.passos[step - 1].hasOwnProperty("fixo")) {
                        passoColheita.fixo = "sim";
                    } else {
                        passoColheita.fixo = "não";
                    }

                    nextDecider();
                }
            }
        }, time * 1000); // <-- time in milliseconds

    }
    // Step begins with Step Description?
    else if ((formConfiguration.passos[step - 1].hasOwnProperty("descricaoPasso")) && (formConfiguration.passos[step - 1].descricaoPasso.length > 0)) {
        displayDescription(step);
    }
    // Step begins with Video stimulus?
    else if ((formConfiguration.passos[step - 1].hasOwnProperty("fonteEstimuloVideo")) && (formConfiguration.passos[step - 1].fonteEstimuloVideo.length > 0)) {
        displayStimulusVideo(step);
    }
    // Step begins with Likert scale?
    else if ((formConfiguration.passos[step - 1].hasOwnProperty("nPontosLikert")) && (formConfiguration.passos[step - 1].questoesLikert.length > 0)) {
        displayLikertScale(step);
    }
    // Step begins with question?
    else {
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