var breakDiv = "";
var lastStepTitle = "";
var currentStepTitle = "";
var stepNumber = 0;

$(document).ready(function () {
    var qN = 0;

    for (var i = 0; i < sizeOfForm; i++) {

        currentStepTitle = formConfiguration.passos[i].nomePasso;

        // Multiple step
        if (currentStepTitle == lastStepTitle) {

            if (document.getElementById(breakDiv) !== null) {

                // Adds Image
                if ((formConfiguration.passos[i].hasOwnProperty("fonteEstimulo")) && (formConfiguration.passos[i].fonteEstimulo.length > 0)) {

                    document.querySelector('#ul-step-' + stepNumber).innerHTML += "<li class='list-group-item'>" +
                        "<a class='thumb'>" + formConfiguration.passos[i].nomeDoEstimulo + "<span><img src='" + formConfiguration.passos[i].fonteEstimulo + "'>" +
                        "</span></a></li>";

                    multipleImages.push([stepNumber, formConfiguration.passos[i].fonteEstimulo, formConfiguration.passos[i].nomeDoEstimulo]);
                }

                // Adds Video
                if ((formConfiguration.passos[i].hasOwnProperty("fonteEstimuloVideo")) && (formConfiguration.passos[i].fonteEstimuloVideo.length > 0)) {

                    document.querySelector('#ul-video-step-' + stepNumber).innerHTML += "<li class='list-group-item'>" + formConfiguration.passos[i].nomeDoEstimuloVideo + "</li>";

                    multipleVideos.push([stepNumber, formConfiguration.passos[i].fonteEstimuloVideo, formConfiguration.passos[i].nomeDoEstimuloVideo]);

                }

            }

        }
        // New step
        else {

            stepNumber++;

            breakDiv = "break-" + stepNumber;

            $("#add-break").trigger("click");   // adds a step panel

            // Retrieves title of step
            document.getElementById(breakDiv + "-name").value = document.getElementById(breakDiv + "-name").defaultValue = formConfiguration.passos[i].nomePasso;

            // Retrieves step checked
            if (formConfiguration.passos[i].hasOwnProperty("fixo")) {
                $("#" + breakDiv + "-panel").find('#fixed-break input[type="checkbox"]').prop("checked", true);
            }

            // Adds description
            if ((formConfiguration.passos[i].hasOwnProperty("descricaoPasso")) && (formConfiguration.passos[i].descricaoPasso.length > 0)) {
                addDescriptionField(stepNumber);
                if ($('#' + breakDiv).find('#fixed-description').length == 1) {
                    $('#' + breakDiv).find('#fixed-description').text(formConfiguration.passos[i].descricaoPasso);
                }
            }

            // Adds Image
            if ((formConfiguration.passos[i].hasOwnProperty("fonteEstimulo")) && (formConfiguration.passos[i].fonteEstimulo.length > 0)) {

                addStimulusMultipleCloneForm(stepNumber);
                $('#' + breakDiv).find('#form-stimulus-time-' + stepNumber).val(formConfiguration.passos[i].tempoEstimulo);

                multipleImages.push([stepNumber, formConfiguration.passos[i].fonteEstimulo, formConfiguration.passos[i].nomeDoEstimulo]);
                typeOfStep[stepNumber] = "image";

                document.querySelector('#previously-added-images-' + stepNumber).innerHTML += "<br/><div id='previous-images-" + stepNumber + "'><p><b>Imagens previamente carregadas:</b></p>" +
                    "<ul class='list-group' id='ul-step-" + stepNumber + "'>" +
                    "<li class='list-group-item'><a class='thumb'>" + formConfiguration.passos[i].nomeDoEstimulo + "" +
                    "<span><img src='" + formConfiguration.passos[i].fonteEstimulo + "'>" +
                    "</span></a></li>" +
                    "</ul></div>";
            }

            // Adds Video
            if ((formConfiguration.passos[i].hasOwnProperty("fonteEstimuloVideo")) && (formConfiguration.passos[i].fonteEstimuloVideo.length > 0)) {

                addStimulusVideoCloneForm(stepNumber);
                multipleVideos.push([stepNumber, formConfiguration.passos[i].fonteEstimuloVideo, formConfiguration.passos[i].nomeDoEstimuloVideo]);
                typeOfStep[stepNumber] = "video";

                document.querySelector('#previously-added-videos-' + stepNumber).innerHTML += "<br/><div id='previous-videos-" + stepNumber + "'><p><b>Vídeos previamente carregados:</b></p>" +
                    "<ul class='list-group' id='ul-video-step-" + stepNumber + "'>" +
                    "<li class='list-group-item'>" + formConfiguration.passos[i].nomeDoEstimuloVideo + "</li>" +
                    "</ul></div>";

                console.log("Os já carregados:\n" + multipleVideos);
            }

            // Adds SAM scale
            if ((formConfiguration.passos[i].hasOwnProperty("escalasSAM")) && (formConfiguration.passos[i].escalasSAM.length > 0)) {
                addSAMScale(stepNumber);

                for (var k = 0; k < formConfiguration.passos[i].escalasSAM.length; k++) {
                    var scale = formConfiguration.passos[i].escalasSAM[k];
                    switch (scale) {
                        case "Valência":
                            $("#" + breakDiv).find('#sam-scale-val').prop("checked", true);
                            break;

                        case "Alerta":
                            $("#" + breakDiv).find('#sam-scale-awe').prop("checked", true);
                            break;

                        case "Dominância":
                            $("#" + breakDiv).find('#sam-scale-dom').prop("checked", true);
                            break;
                    }
                }
            }

            // Adds Likert scale
            if ((formConfiguration.passos[i].hasOwnProperty("nPontosLikert")) && (formConfiguration.passos[i].questoesLikert.length > 0)) {
                addLikertScale(stepNumber);

                switch (formConfiguration.passos[i].nPontosLikert) {
                    case "5Pontos":
                        $("#" + breakDiv).find("#likert-scale-5").prop("checked", true);
                        break;
                    case "7Pontos":
                        $("#" + breakDiv).find("#likert-scale-7").prop("checked", true);
                        break;
                }

                if ((formConfiguration.passos[i].hasOwnProperty("questoesLikert")) && (formConfiguration.passos[i].questoesLikert.length > 0)) {
                    for (var ql = 0; ql < formConfiguration.passos[i].questoesLikert.length; ql++) {
                        addQuestionInLikertCloneForm(formConfiguration.passos[i].questoesLikert[ql], stepNumber);
                    }
                }

            }

            // Adds questions
            if ((formConfiguration.passos[i].hasOwnProperty("questoes")) && (formConfiguration.passos[i].questoes.length > 0)) {
                for (var k = 0; k < formConfiguration.passos[i].questoes.length; k++) {
                    addQuestion(stepNumber);
                    document.getElementById("question-" + stepNumber + "-" + qN).value = document.getElementById("question-" + stepNumber + "-" + qN).defaultValue = formConfiguration.passos[i].questoes[k];
                    qN++;
                }
            }

        }

        lastStepTitle = formConfiguration.passos[i].nomePasso;

    }

});

/**
 * Adds a question associated to the Likert scale field in the clone form.
 * @param q question to add
 * @param n number of the step
 */
function addQuestionInLikertCloneForm(q, n) {
    $('#list-in-likert-' + n).show();
    var question = q;

    $("#list-in-likert-" + n).append("<li class='list-group-item' id='likert-" + n + "-" + nQuestionLikert + "'>" + question + "<button title='Apagar' onclick='deleteQuestionInLikert(" + nQuestionLikert + "," + n + ")' type='button' class='btn btn-xs btn-danger btn-right'><span class='fa fa-trash-o'></span></button></li>");
    nQuestionLikert++;
}

/**
 * Adds an open multiple files option field to select multiple stimuli.
 * @param n number of the step
 */
function addStimulusMultipleCloneForm(n) {
    divWhereToAdd = "#break-" + n;

    if ($(divWhereToAdd).find("#form-stimulus").length) {
        toastr.error('Já adicionou um estímulo nesta tarefa.');
    } else if ($(divWhereToAdd).find('#fixed-description').length == 1) { // if there is a description
        toastr.error('Não pode adicionar elementos extra numa tarefa que contenha instruções.');
    } else if ($(divWhereToAdd).find("#video-stimulus-" + n).length == 1) { // if there is a video stimulus
        toastr.error('Não pode adicionar um estímulo de vídeo numa tarefa com estímulos de imagens.');
    }
    else {
        $(divWhereToAdd).append('<div class="well well-sm" id="imgDivField-' + imgField + '">' +
            '<button type="button" class="btn btn-danger btn-xs btn-right" title="Apagar" onclick="deleteElementInsidePanel(' + imgDivField + ',' + imgField + ',' + n + ')"><span class="fa fa-trash-o"></span></button> ' +
            '<i class="title-in-well"><span class="glyphicon glyphicon-picture"></span> Campo de imagem</i><br/>' +
            '<label>Selecionar imagens a carregar (<b>Obs.:</b> Ao carregar imagens novas nesta tarefa, irá apagar as previamente carregadas):</label>' +
            '<div id="form-stimulus" class="input-group">' +
            '<label class="input-group-btn">' +
            '<span class="btn btn-default"><span class="glyphicon glyphicon-folder-open"></span> Pesquisar' +
            '<input style="display: none;" type="file" accept="image/gif, image/jpeg, image/png, image/jpg" multiple id="input-stimulus-multiple" onchange="getFileNames(' + n + ')"></span>' +
            '<button id="btn-load-' + n + '"  class="btn btn-primary" type="button" onclick="getBase64Multiple(' + n + ')"><span class="fa fa-upload"></span> Carregar</button>' +
            '</label>' +
            '<input id="files-selected" type="text" class="form-control" readonly>' +
            '</div>' +
            '<br/><div class="form-group"><label>Tempo de apresentação por imagem (em seg.):</label><input type="text" class="form-control" id="form-stimulus-time-' + n + '"></div>' +
            '<div id="previously-added-images-' + n + '"></div>' +
            '</div>');
    }
}

/**
 * Adds a stimulus of the video type.
 * @param n number of the step
 */
function addStimulusVideoCloneForm(n) {
    divWhereToAdd = "#break-" + n;

    options = {

        // Required. Called when a user selects an item in the Chooser.
        success: function (files) {
            for (var i = 0, len = multipleVideos.length; i < len; i++) {
                if (multipleVideos[i] !== undefined && multipleVideos[i][0] === n) {
                    delete multipleVideos[i];
                    typeOfStep[n] = "";
                    $("#loaded-videos-" + n).empty();

                    if (document.querySelector('#previous-videos-' + n) != null) {
                        document.querySelector('#previous-videos-' + n).innerHTML = "";
                    }
                }
            }

            typeOfStep[n] = "video";

            $("#loaded-videos-" + n).append("<br/><label>Vídeos carregados</label>" +
                "<ul class='list-group'");
            for (var i = 0; i < files.length; i++) {
                multipleVideos.push([n, files[i].link, files[i].name]);
                $("#loaded-videos-" + n).append("<li class='list-group-item'>" + files[i].name + "</li>");
            }
            $("#loaded-videos-" + n).append("</ul>");

            console.log("Os carregados agora:\n" + multipleVideos);
        },

        // Optional. Called when the user closes the dialog without selecting a file
        // and does not include any parameters.
        cancel: function () {

        },

        // Optional. "preview" (default) is a preview link to the document for sharing,
        // "direct" is an expiring link to download the contents of the file. For more
        // information about link types, see Link types below.
        linkType: "preview", // or "direct"

        // Optional. A value of false (default) limits selection to a single file, while
        // true enables multiple file selection.
        multiselect: true, // or true

        // Optional. This is a list of file extensions. If specified, the user will
        // only be able to select files with these extensions. You may also specify
        // file types, such as "video" or "images" in the list. For more information,
        // see File types below. By default, all extensions are allowed.
        extensions: ['video'],
    };

    if ($(divWhereToAdd).find("#video-stimulus-" + n).length) {
        toastr.error('Já adicionou um estímulo de vídeo nesta tarefa.');
    } else if ($(divWhereToAdd).find("#fixed-description").length == 1) { // if there is a description
        toastr.error('Não pode adicionar elementos extra numa tarefa que contenha instruções.');
    } else if ($(divWhereToAdd).find("#form-stimulus").length == 1) { // if there is an image stimulus
        toastr.error('Não pode adicionar um estímulo de vídeo numa tarefa com estímulo de imagem.');
    } else {
        $(divWhereToAdd).append("<div class='well well-sm' id='vidDivField-" + n + "'>" +
            "<button type='button' class='btn btn-danger btn-xs btn-right' title='Apagar' onclick='deleteElementInsidePanel(" + vidDivField + "," + vidField + "," + n + ")'><span class='fa fa-trash-o'></span></button> " +
            "<i class='title-in-well'><span class='glyphicon glyphicon-film'></span> Campo de vídeo</i><br/>" +
            "<label>Vídeos a carregar (<b>Obs.:</b> Ao carregar vídeos novos, irá apagar os previamente carregados nesta tarefa):</label>" +
            "<div class='input-group'>" +
            "<span class='input-group-addon'>Selecionar vídeos</span>" +
            "<button class='form-control btn btn-primary' id='video-stimulus-" + n + "' type='button' onclick='Dropbox.choose(options);'><span class='fa fa-dropbox'></span> <span class='button-text'>Pesquisar na Dropbox</span></button>" +
            "</div>" +
            "<div id='loaded-videos-" + n + "'></div>" +
            "<div id='previously-added-videos-" + n + "'></div></div>");
    }
}