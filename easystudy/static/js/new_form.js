var divWhereToAdd = ""; // used in addQuestion(n)
var breakNumber = 0; // used in addQuestion(n)
//var images = []; // used in sendToJson()
var typeOfStep = [];
var x = 0; // used in addQuestion(n)

//var formID = Math.random().toString(36).substring(2);
var formID = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'); // used in sendToJson()
// console.log("Este é o ID do Form: " + formID);

var formName;
var multipleImages = [];
var multipleVideos = [];
var imgThumbnail;

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
 * Makes the panels of content added by user draggable.
 */
jQuery(function ($) {
    var panelList = $('#content-added-by-user');

    panelList.sortable({
        // Only make the .panel-heading child elements support dragging.
        // Omit this to make then entire <li>...</li> draggable.
        handle: '.panel-heading',
        update: function () {
            $('.panel', panelList).each(function (index, elem) {
                var $listItem = $(elem),
                    newIndex = $listItem.index();

                // Persist the new indices.
            });
        }
    });
});

/**
 * Generates a random string to be used in formID.
 * @param length size of the string
 * @param chars list of allowed characters
 * @returns {string} random string
 */
function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}

/**
 * Adds a textbox field in the form
 * @param n number of the step
 */
function addQuestion(n) {
    divWhereToAdd = "#break-" + n;

    if ($(divWhereToAdd).find('#fixed-description').length == 1) { // if there is a description
        toastr.error('Não pode adicionar elementos extra numa tarefa que contenha instruções.');
    } else {
        $(divWhereToAdd).append("<br/>" +
            "<label>Questão proposta</label><input id='question-" + x + "' type='text' class='form-control'>" +
            "<br/>");
        x++;
    }
}

/**
 * NOT BEING USED
 * Adds an open file option field to select a stimulus
 * @param n number of the step
 */
/*
 function addStimulus(n) {
 divWhereToAdd = "#break-" + n;

 if ($(divWhereToAdd).find("#form-stimulus").length) {
 toastr.error('Já adicionou um estímulo nesta tarefa.');
 } else if ($(divWhereToAdd).find("#video-stimulus-" + n).length) { // if there is a video stimulus
 toastr.error('Não pode adicionar um estímulo de vídeo numa tarefa com estímulo de imagem.');
 } else if ($(divWhereToAdd).find('#fixed-description').length == 1) { // if there is a description
 toastr.error('Não pode adicionar elementos extra numa tarefa que contenha instruções.');
 }
 else {
 $(divWhereToAdd).append('<br/><p><b>Selecionar estímulo a carregar</b></p>' +
 '<div id="form-stimulus" class="input-group">' +
 '<label class="input-group-btn">' +
 '<span class="btn btn-default"><span class="glyphicon glyphicon-folder-open"></span> Pesquisar' +
 '<input style="display: none;" type="file" multiple id="input-stimulus-multiple" onchange="getFileNames(' + n + ')"></span>' +
 '<button class="btn btn-primary" type="button" onclick="getBase64(' + n + ')"><span class="glyphicon glyphicon-import"></span> Carregar</button>' +
 '</label>' +
 '<input id="files-selected" type="text" class="form-control" readonly>' +
 '</div>' +
 '<br/><br/><div class="form-group"><label for="form-stimulus-time">Tempo de apresentação definido</label><input type="text" class="form-control" id="form-stimulus-time"></div>');
 }
 }
 */

/**
 * Adds a stimulus of the video type
 * @param n number of the step
 */
function addStimulusVideo(n) {
    divWhereToAdd = "#break-" + n;

    options = {

        // Required. Called when a user selects an item in the Chooser.
        success: function (files) {
            for (var i = 0, len = multipleVideos.length; i < len; i++) {
                if (multipleVideos[i] !== undefined && multipleVideos[i][0] === n) {
                    delete multipleVideos[i];
                    typeOfStep[n] = "";
                    $("#loaded-videos-" + n).empty();
                }
            }

            // If only one video was uploaded, let's the step be fixed. Else, does not.
            /*
            if (files.length > 1) {
                $(divWhereToAdd + "-panel").find('#fixed-break input[type="checkbox"]').prop("checked", false);
                $(divWhereToAdd + "-panel").find('#fixed-break input[type="checkbox"]').prop("disabled", true);
            } else {
                $(divWhereToAdd + "-panel").find('#fixed-break input[type="checkbox"]').prop("checked", false);
                $(divWhereToAdd + "-panel").find('#fixed-break input[type="checkbox"]').prop("disabled", false);
            }
            */

            typeOfStep[n] = "video";

            $("#loaded-videos-" + n).append("<br/><label>Vídeos carregados</label>" +
                "<ul class='list-group'");
            for (var i = 0; i < files.length; i++) {
                multipleVideos.push([n, files[i].link, files[i].name]);
                $("#loaded-videos-" + n).append("<li class='list-group-item'>" + files[i].name + "</li>");
            }
            $("#loaded-videos-" + n).append("</ul>");
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
        $(divWhereToAdd).append("<br/><p><b>Selecionar vídeos a carregar</b></p>" +
            "<div class='input-group'>" +
            "<span class='input-group-addon'>Selecionar vídeos</span>" +
            "<button class='form-control btn btn-primary' id='video-stimulus-" + n + "' type='button' onclick='Dropbox.choose(options);'><span class='glyphicon glyphicon-folder-open'></span> <span class='button-text'>Pesquisar na Dropbox</span></button>" +
            "</div>" +
            "<div id='loaded-videos-" + n + "'></div>");
    }
}

/**
 * Adds an open multiple files option field to select multiple stimuluses
 * @param n number of the step
 */
function addStimulusMultiple(n) {
    divWhereToAdd = "#break-" + n;

    if ($(divWhereToAdd).find("#form-stimulus").length) {
        toastr.error('Já adicionou um estímulo nesta tarefa.', '');
    } else if ($(divWhereToAdd).find('#fixed-description').length == 1) { // if there is a description
        toastr.error('Não pode adicionar elementos extra numa tarefa que contenha instruções.');
    } else if ($(divWhereToAdd).find("#video-stimulus-" + n).length == 1) { // if there is a video stimulus
        toastr.error('Não pode adicionar um estímulo de vídeo numa tarefa com estímulos de imagens.');
    }
    else {
        $(divWhereToAdd).append('<br/><p><b>Selecionar imagens a carregar</b></p>' +
            '<div id="form-stimulus" class="input-group">' +
            '<label class="input-group-btn">' +
            '<span class="btn btn-default"><span class="glyphicon glyphicon-folder-open"></span> Pesquisar' +
            '<input style="display: none;" type="file" accept="image/gif, image/jpeg, image/png, image/jpg" multiple id="input-stimulus-multiple" onchange="getFileNames(' + n + ')"></span>' +
            '<button id="btn-load-' + n + '"  class="btn btn-primary" type="button" onclick="getBase64Multiple(' + n + ')"><span class="glyphicon glyphicon-import"></span> Carregar</button>' +
            '</label>' +
            '<input id="files-selected" type="text" class="form-control" readonly>' +
            '</div>' +
            '<br/><br/><div class="form-group"><label for="form-stimulus-time">Tempo de apresentação definido</label><input type="text" class="form-control" id="form-stimulus-time"></div>');
    }
}

/**
 * Adds a description field in the form. It must be fixed, otherwise error.
 * @param n number of the step
 */
function addDescriptionField(n) {
    divWhereToAdd = "#break-" + n;

    if ($(divWhereToAdd).children().length > 1) {
        toastr.error('Só é possível adicionar instruções a uma tarefa que esteja vazia.');
    } else {
        $(divWhereToAdd).append('<br/><label>Instruções</label><textarea class="form-control" rows="3" id="fixed-description"></textarea><br/>');
        $(divWhereToAdd + "-panel").find('#fixed-break input[type="checkbox"]').prop("checked", true); // a description field has to be fixed
        $(divWhereToAdd + "-panel").find('#fixed-break input[type="checkbox"]').prop("disabled", true); // blocks the fixed attribute
    }
}

/**
 * Adds a SAM scale option selector in the form.
 * @param n number of the step
 */
function addSAMScale(n) {
    divWhereToAdd = "#break-" + n;

    if ($(divWhereToAdd).find("#form-sam-scales").length) { // if there is already a scale -> error
        toastr.error('Já adicionou uma escala a esta tarefa.');
    } else if (($(divWhereToAdd).find("#form-stimulus").length == 0) && ($(divWhereToAdd).find("#video-stimulus-" + n).length == 0)) { // if there is no stimulus -> error
        toastr.error('Só pode adicionar escalas a uma tarefa que contenha um estímulo.');
    } else {
        $(divWhereToAdd).append("" +
            "<br/><div id='form-sam-scales'><p><b>Escalas a apresentar</b></p>" +
            "<label class='checkbox-inline'><input type='checkbox' value='Valência' id='sam-scale-val'>Valência</label>" +
            "<label class='checkbox-inline'><input type='checkbox' value='Alerta' id='sam-scale-awe'>Alerta</label>" +
            "<label class='checkbox-inline'><input type='checkbox' value='Dominância' id='sam-scale-dom'>Dominância</label>" +
            "</div><br/>");
    }
}

/**
 * Deletes an entire step and it's contents
 * @param n number of step
 */
function deleteBreak(n) {
    //var stepToDelete = "#break-" + n;
    var stepToDelete = "#break-" + n + "-panel";
    $(stepToDelete).remove();

    // If the step is a multiple one, delete containing images:
    for (var i = 0, len = multipleImages.length; i < len; i++) {
        if (multipleImages[i] !== undefined && multipleImages[i][0] === n) {
            delete multipleImages[i];
            //images[n] = "";
            typeOfStep[n] = "";
        }
    }

    for (var i = 0, len = multipleVideos.length; i < len; i++) {
        if (multipleVideos[i] !== undefined && multipleVideos[i][0] === n) {
            delete multipleVideos[i];
            typeOfStep[n] = "";
        }
    }

    toastr.success('<b>Tarefa ' + n + '</b> apagada.');
}

$(document).ready(function () {

    /**
     * Adds a new step.
     */
    $("#add-break").on("click", function () {
        //<li><button class='btn btn-block btn-transparent' type='button' onclick='addStimulus(" + breakNumber + ")'><span class='glyphicon glyphicon-picture'></span> Imagem Individual</button></li>"

        breakNumber = breakNumber + 1;
        $("#content-added-by-user").append("" +
            "<div class='panel panel-default' id='break-" + breakNumber + "-panel'>" +
            "<div class='panel-heading' style='background-color: #222;'>" +
            "<div class='container-fluid panel-container'>" +
            "<div class='input-group' id='fixed-break'>" +
            "<span class='input-group-addon'><label class='checkbox-inline'><input type='checkbox' value='sim'>Fixo</label></span>" +
            "<input placeholder='Tarefa " + breakNumber + "' type='text' id='break-" + breakNumber + "-name' class='form-control'>" +
            "<div class='input-group-btn'>" +
            "<button class='btn btn-primary dropdown-toggle' type='button' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'><span class='glyphicon glyphicon-plus-sign'></span> <span class='button-text'>Elementos</span> <span class='caret'></span></button>" +
            "<ul class='dropdown-menu'>" +
            "<li><button id='break-" + breakNumber + "-question-btn' class='btn btn-block btn-transparent' type='button' onclick='addQuestion(" + breakNumber + ")'><span class='glyphicon glyphicon-pencil'></span> Questão</button></li>" +
            "<li><button id='break-" + breakNumber + "-scale-btn' class='btn btn-block btn-transparent' type='button' onclick='addSAMScale(" + breakNumber + ")'><span class='glyphicon glyphicon-record'></span> Escalas</button></li>" +
            "<li><button id='break-" + breakNumber + "-image-btn' class='btn btn-block btn-transparent' type='button' onclick='addStimulusMultiple(" + breakNumber + ")'><span class='glyphicon glyphicon-picture'></span> Imagens</button></li>" +
            "<li><button id='break-" + breakNumber + "-video-btn' class='btn btn-block btn-transparent' type='button' onclick='addStimulusVideo(" + breakNumber + ")'><span class='glyphicon glyphicon-film'></span> Vídeos</button></li>" +
            "<li class='divider'></li>" +
            "<li><button id='break-" + breakNumber + "-description-btn' class='btn btn-block btn-transparent' type='button' onclick='addDescriptionField(" + breakNumber + ")'><span class='glyphicon glyphicon-font'></span> Instruções</button></li>" +
            "<li><button id='break-" + breakNumber + "-delete-btn' class='btn btn-block btn-transparent' type='button' onclick='deleteBreak(" + breakNumber + ")'><span class='glyphicon glyphicon-remove'></span> Apagar</button></li>" +
            "</ul>" +
            "</div>" + // <!-- ./input-group-btn -->
            "</div>" + // <!-- ./fixed-break -->
            "</div>" + // <!-- ./container-fluid panel-container -->
            "</div>" + // <!-- ./panel-heading -->
            "<div class='panel-body' id='break-" + breakNumber + "'>" +
            "</div>" +
            "</div>"); // <!-- ./break-n-panel -->
    });

});

/**
 * Verifies if the form is correctly filled.
 */
function verifyStringFields() {
    var errors = [];

    // Verify if the form has elements
    if ($('#content-added-by-user').children().length < 1) {
        errors.push("Tem de incluir elementos no seu questionário.");
    }

    // Verify title of form
    var fName = $('#form-name').val();

    if (fName.search('\"') > -1 || fName.search('\'') > -1 || fName.search(new RegExp("\\\\", 'g')) > -1) {
        errors.push("Foram detetados caracteres inválidos (aspas, pelicas ou barras) no campo <b>Nome do questionário</b>");
    }

    if (fName == "") {
        errors.push("Preencha o campo <b>Nome do questionário</b>.");
    }

    if (fName.length > 100) {
        errors.push("O campo <b>Nome do questionário</b> não pode ter mais de 100 caracteres.");
    }

    // Verify description of form
    var fDescription = $('#form-description').val();

    if (fDescription.search('\"') > -1 || fDescription.search('\'') > -1 || fDescription.search(new RegExp("\\\\", 'g')) > -1) {
        errors.push("Foram detetados caracteres inválidos (aspas, pelicas ou barras) no campo <b>Descrição do questionário</b>");
    }

    if (fDescription == "") {
        errors.push("Preencha o campo <b>Descrição do questionário</b>.");
    }

    // Verify style of form
    var formColor = $('input[name=optradio]:checked', '#form-questionnaire').val();

    if (formColor == undefined) {
        errors.push("Escolha a cor do fundo no campo <b>Estilo do questionário</b>.");
    }

    for (i = 1; i <= breakNumber; i++) {
        var breakDiv = "break-" + i;

        if (document.getElementById(breakDiv) != null) {
            // Verify if step has elements
            if ($('#' + breakDiv).children().length == 0) {
                errors.push("Insira elementos na <b>Tarefa " + i + "</b>, ou então apague-a.");
            }

            // Verify name of step
            var nPasso = $('#' + breakDiv + '-name').val();

            if (nPasso.search('\"') > -1 || nPasso.search('\'') > -1 || nPasso.search(new RegExp("\\\\", 'g')) > -1) {
                errors.push("Foram detetados caracteres inválidos (aspas, pelicas ou barras) na <b>Tarefa " + i + "</b> no nome da Tarefa.");
            }
            if (nPasso.search('Dados demográficos') > -1 && i > 1) {
                errors.push("Não pode dar o nome \"Dados demográficos\" à <b>Tarefa " + i + "</b>.");
            }

            // Verify description of step
            if ($('#' + breakDiv).find('#fixed-description').length == 1) {
                var dPasso = $('#' + breakDiv).find('#fixed-description').val();

                if (dPasso.search('\"') > -1 || dPasso.search('\'') > -1 || dPasso.search(new RegExp("\\\\", 'g')) > -1) {
                    errors.push("Foram detetados caracteres inválidos (aspas, pelicas ou barras) na <b>Tarefa " + i + "</b> no campo <b>Instruções</b>.");
                }
                if (dPasso == "") {
                    errors.push("Preencha o campo <b>Instruções</b> na <b>Tarefa " + i + "</b>.");
                }
            }

            // Verify question fields
            if (document.getElementById(breakDiv) != null) {
                var breakChildren = document.getElementById(breakDiv).children;
                for (var j = 0; j < breakChildren.length; j++) {
                    if (breakChildren[j].getAttribute('id') != null) {
                        if (breakChildren[j].getAttribute('id').includes("question")) {
                            var elem = "#" + breakChildren[j].getAttribute('id');
                            var fQuestion = $("#" + breakDiv).find(elem).val();

                            if (fQuestion.search('\"') > -1 || fQuestion.search('\'') > -1 || fQuestion.search(new RegExp("\\\\", 'g')) > -1) {
                                errors.push("Foram detetados caracteres inválidos (aspas, pelicas ou barras) na <b>Tarefa " + i + "</b> no campo <b>Questão proposta</b>")
                            }

                            if (fQuestion == "") {
                                errors.push("Preencha o campo <b>Questão proposta</b> na <b>Tarefa " + i + "</b>.");
                            }
                        }
                    }
                }
            }
        }
    }


    var stringErrors = "Por favor corrija os seguintes erros:<br/><ul>";
    if (errors.length == 0) { // if there are no errors
        return true;
    } else { // display all the errors
        for (var i = 0; i < errors.length; i++) {
            stringErrors += ("<li>" + errors[i] + "</li>");

            //toastr.warning(errors[i]);
        }
        stringErrors += "</ul>";
        toastr.warning(stringErrors);
        return false;
    }
}


/**
 * Collects the information and converts it to a JSON string.
 */
function sendToJSON() {
    var studyConfig = {};

    formName = $('#form-name').val();
    //console.log("FormName: " + formName);

    var formDescription = $('#form-description').val();
    //console.log("formDescription: " + formDescription);

    var formColor = $('input[name=optradio]:checked', '#form-questionnaire').val();
    //console.log("formColor: " + formColor);

    // Adds basic information to JSON
    studyConfig.id = formID;
    //console.log("formID: " + formID);

    studyConfig.nome = formName;
    studyConfig.descricao = formDescription;
    studyConfig.corFundo = formColor;

    auxPassos = [];

    var nStep = 0;

    var orderedList = getOrderedDivs();

    for (var d = 0; d < orderedList.length; d++) {

        var i = orderedList[d];
        var breakDiv = "break-" + i;

        if (document.getElementById(breakDiv) !== null) {

            if (typeOfStep[i] == "video") {
                for (var o = 0, len = multipleVideos.length; o < len; o++) {
                    if (multipleVideos[o] !== undefined && multipleVideos[o][0] === i) {
                        nStep = nStep + 1;

                        // Adds step to JSON
                        var configPasso = {};

                        configPasso.nPasso = nStep;

                        // Checks if the step is fixed or not
                        $('#' + breakDiv + "-panel").find('#fixed-break input[type="checkbox"]').each(function () {
                            if ($(this).is(":checked")) {
                                configPasso.fixo = $(this).prop("value");
                                //console.log("fixo: " + $(this).prop("value"));
                            }
                        });

                        // Adds name of step to JSON
                        if ($('#' + breakDiv + "-panel").find('#' + breakDiv + '-name').length == 1) {

                            if ($('#' + breakDiv + "-panel").find('#' + breakDiv + '-name').val() == "") {
                                configPasso.nomePasso = "Tarefa " + i;
                            } else {
                                configPasso.nomePasso = $('#' + breakDiv + "-panel").find('#' + breakDiv + '-name').val();
                            }
                            //console.log("nomePasso: " + configPasso.nomePasso);

                        }

                        // Adds questions to JSON
                        var breakChildren = document.getElementById(breakDiv).children;
                        var questionsInBreak = [];

                        for (j = 0; j < breakChildren.length; j++) {
                            if (breakChildren[j].getAttribute('id') != null) {
                                if (breakChildren[j].getAttribute('id').includes("question")) {
                                    var elem = "#" + breakChildren[j].getAttribute('id');
                                    var formQuestion = $("#" + breakDiv).find(elem).val();
                                    questionsInBreak.push(formQuestion);
                                }
                            }
                        }

                        if (questionsInBreak.length > 0) {
                            configPasso.questoes = questionsInBreak;
                            //console.log("questoes: " + configPasso.questoes);
                        }

                        // Adds selected SAM scales to JSON
                        var selectedSAMScales = [];
                        $('#' + breakDiv).find('#form-sam-scales input[type="checkbox"]').each(function () {
                            if ($(this).is(":checked")) {
                                selectedSAMScales.push($(this).prop("value"));
                            }
                        });
                        configPasso.escalasSAM = selectedSAMScales;
                        //console.log("escalasSAM: " + configPasso.escalasSAM);

                        // Adds video stimulus to JSON
                        // Video stimulus name
                        configPasso.nomeDoEstimuloVideo = multipleVideos[o][2];
                        //console.log("nomeDoEstimuloVideo: " + configPasso.nomeDoEstimuloVideo);

                        // Video stimulus source
                        if (multipleVideos[o][1] != undefined) {
                            var res = multipleVideos[o][1].split("?");
                            configPasso.fonteEstimuloVideo = res[0];
                            //console.log("fonteEstimuloVideo: " + configPasso.fonteEstimuloVideo);
                        }

                        auxPassos.push(configPasso);
                    }

                } // end -- for

            } // end -- if (typeOfStep[i] == "video")
            else if (typeOfStep[i] == "image") {
                //console.log("Image Step Detected");
                //console.log(multipleImages);
                for (var o = 0, len = multipleImages.length; o < len; o++) {
                    if (multipleImages[o] !== undefined && multipleImages[o][0] === i) {
                        nStep = nStep + 1;

                        // Adds step to JSON
                        var configPasso = {};

                        configPasso.nPasso = nStep;

                        // Checks if the step is fixed or not
                        $('#' + breakDiv + "-panel").find('#fixed-break input[type="checkbox"]').each(function () {
                            if ($(this).is(":checked")) {
                                configPasso.fixo = $(this).prop("value");
                                //console.log("fixo: " + $(this).prop("value"));
                            }
                        });

                        // Adds name of step to JSON
                        if ($('#' + breakDiv + "-panel").find('#' + breakDiv + '-name').length == 1) {

                            if ($('#' + breakDiv + "-panel").find('#' + breakDiv + '-name').val() == "") {
                                configPasso.nomePasso = "Tarefa " + i;
                            } else {
                                configPasso.nomePasso = $('#' + breakDiv + "-panel").find('#' + breakDiv + '-name').val();
                            }
                            //console.log("nomePasso: " + configPasso.nomePasso);

                        }

                        // Adds questions to JSON
                        var breakChildren = document.getElementById(breakDiv).children;
                        var questionsInBreak = [];

                        for (j = 0; j < breakChildren.length; j++) {
                            if (breakChildren[j].getAttribute('id') != null) {
                                if (breakChildren[j].getAttribute('id').includes("question")) {
                                    var elem = "#" + breakChildren[j].getAttribute('id');
                                    var formQuestion = $("#" + breakDiv).find(elem).val();
                                    questionsInBreak.push(formQuestion);
                                }
                            }
                        }

                        if (questionsInBreak.length > 0) {
                            configPasso.questoes = questionsInBreak;
                            //console.log("questoes: " + configPasso.questoes);
                        }

                        // Adds selected SAM scales to JSON
                        var selectedSAMScales = [];
                        $('#' + breakDiv).find('#form-sam-scales input[type="checkbox"]').each(function () {
                            if ($(this).is(":checked")) {
                                selectedSAMScales.push($(this).prop("value"));
                            }
                        });
                        configPasso.escalasSAM = selectedSAMScales;
                        //console.log("escalasSAM: " + configPasso.escalasSAM);

                        // Image stimulus name and extension
                        configPasso.nomeDoEstimulo = multipleImages[o][2];
                        //console.log("nomeDoEstimulo: " + configPasso.nomeDoEstimulo);

                        // Image stimulus source in Base 64
                        configPasso.fonteEstimulo = multipleImages[o][1];

                        // Image stimulus time
                        configPasso.tempoEstimulo = $('#' + breakDiv).find('#form-stimulus-time').val();
                        //console.log("tempoEstimulo: " + configPasso.tempoEstimulo);

                        auxPassos.push(configPasso);
                    }

                } // end -- for
            } // end -- else if(typeOfStep[i] == "image")

            // For a step without images or videos
            else {
                nStep = nStep + 1; // number of step in order

                // Adds step to JSON
                var configPasso = {};

                configPasso.nPasso = nStep;
                //console.log("nPasso: " + nStep);

                // Checks if the step is fixed or not
                $('#' + breakDiv + "-panel").find('#fixed-break input[type="checkbox"]').each(function () {
                    if ($(this).is(":checked")) {
                        configPasso.fixo = $(this).prop("value");
                        //console.log("fixo: " + $(this).prop("value"));
                    }
                });

                // Adds description of step to JSON
                if ($('#' + breakDiv).find('#fixed-description').length == 1) {
                    configPasso.descricaoPasso = $('#' + breakDiv).find('#fixed-description').val();
                    //console.log("descricaoPasso: " + configPasso.descricaoPasso);
                }

                // Adds name of step to JSON
                if ($('#' + breakDiv + "-panel").find('#' + breakDiv + '-name').length == 1) {

                    if ($('#' + breakDiv + "-panel").find('#' + breakDiv + '-name').val() == "") {
                        configPasso.nomePasso = "Tarefa " + i;
                    } else {
                        configPasso.nomePasso = $('#' + breakDiv + "-panel").find('#' + breakDiv + '-name').val();
                    }
                    //console.log("nomePasso: " + configPasso.nomePasso);

                }

                // Adds questions to JSON
                var breakChildren = document.getElementById(breakDiv).children;
                var questionsInBreak = [];

                for (j = 0; j < breakChildren.length; j++) {
                    if (breakChildren[j].getAttribute('id') != null) {
                        if (breakChildren[j].getAttribute('id').includes("question")) {
                            var elem = "#" + breakChildren[j].getAttribute('id');
                            var formQuestion = $("#" + breakDiv).find(elem).val();
                            questionsInBreak.push(formQuestion);
                        }
                    }
                }

                if (questionsInBreak.length > 0) {
                    configPasso.questoes = questionsInBreak;
                    //console.log("questoes: " + configPasso.questoes);
                }

                auxPassos.push(configPasso);
            } // end -- else

        } // end -- if (document.getElementById(breakDiv) !== null)

    } // end -- for

    // only adds "passos" json field if they exist.
    if (auxPassos.length > 0) {
        studyConfig.passos = auxPassos;
    }

    // gets the form thumbnail
    if (imgThumbnail == "" || imgThumbnail == undefined) {
        imgThumbnail = defaultThumbnail;
    }

    console.log(JSON.stringify(studyConfig));
    return JSON.stringify(studyConfig);
}

/**
 * Converts the thumbnail image to base 64 format.
 */
function saveThumbnail() {
    var file = document.querySelector('#form-thumbnail input[type=file').files[0];

    if (file != null) {
        var reader = new FileReader();
        reader.onload = function (e) {
            imgThumbnail = reader.result;
        }
    }
    reader.readAsDataURL(file);
    toastr.success('A miniatura do questionário foi carregada.');

    if (document.querySelector('#previous-thumbnail') != null) {
        document.querySelector('#previous-thumbnail').innerHTML = "";
    }
}

/**
 * NOT BEING USED
 * Converts a file to base 64 format.
 * @param n number of the step
 */
/*
 function getBase64(n) {
 var file = document.querySelector('#break-' + n + ' input[type=file]').files[0];

 if (file != null) {
 var reader = new FileReader();
 reader.onload = function (e) {
 images[n] = reader.result;
 }
 }
 reader.readAsDataURL(file);
 toastr.success('O estímulo selecionado foi carregado.');
 }
 */

/**
 * Gets file names when files are selected to upload.
 * @param n number of the step
 */
function getFileNames(n) {
    if (n == 0) {   // for the thumbnail
        var thumbTextInput = $('#form-thumbnail').find('#files-selected');
        var file = document.querySelector('#form-thumbnail input[type=file').files[0].name;
        thumbTextInput.val(file);

        // Checks if the file extension is valid
        var fileExtension = file.substr(file.lastIndexOf('.') + 1);
        if (fileExtension != "gif" && fileExtension != "jpeg" && fileExtension != "png" && fileExtension != "jpg") {
            $('#btn-load-thumbnail').attr("disabled", true);
            toastr.error('<strong>Erro na leitura do ficheiro ' + file + '.</strong> Por favor carregue um ficheiro com extensão <i>.gif</i>, <i>.jpeg</i>, <i>.jpg</i> ou <i>.png</i>.');
        } else {
            $('#btn-load-thumbnail').attr("disabled", false);
        }

    } else {
        var breakDiv = "break-" + n;
        var filesTextInput = $('#' + breakDiv).find('#files-selected');
        var text = "";

        for (var x = 0; x < document.querySelector('#break-' + n + ' input[type=file]').files.length; x++) {
            file = document.querySelector('#break-' + n + ' input[type=file]').files[x].name;

            // Checks if the file extension is valid
            var fileExtension = file.substr(file.lastIndexOf('.') + 1);
            if (fileExtension != "gif" && fileExtension != "jpeg" && fileExtension != "png" && fileExtension != "jpg") {
                $('#btn-load-' + n).attr("disabled", true);
                toastr.error('<strong>Erro na leitura do ficheiro ' + file + '.</strong> Por favor carregue um ficheiro com extensão <i>.gif</i>, <i>.jpeg</i>, <i>.jpg</i> ou <i>.png</i>.');
                text += file + " ";
                break;
            }

            text += file + " ";
            $('#btn-load-' + n).attr("disabled", false);
        }

        filesTextInput.val(text);
    }
}

/**
 * Converts multiple files to base 64 format.
 * @param n number of the step
 */
function getBase64Multiple(n) {
    var breakDiv = "break-" + n;
    var result = 0;

    for (var i = 0, len = multipleImages.length; i < len; i++) {
        if (multipleImages[i] !== undefined && multipleImages[i][0] === n) {
            delete multipleImages[i];
            //images[n] = "";
            typeOfStep[n] = "";

            if (document.querySelector('#previous-images-' + n) != null) {
                document.querySelector('#previous-images-' + n).innerHTML = "";
            }
        }
    }

    for (var x = 0; x < document.querySelector('#break-' + n + ' input[type=file]').files.length; x++) {

        // If only one file was uploaded, let's the step be fixed. Else, does not.
        /*
        if (document.querySelector('#break-' + n + ' input[type=file]').files.length > 1) {
            $("#" + breakDiv + "-panel").find('#fixed-break input[type="checkbox"]').prop("checked", false);
            $("#" + breakDiv + "-panel").find('#fixed-break input[type="checkbox"]').prop("disabled", true);
        } else {
            $("#" + breakDiv + "-panel").find('#fixed-break input[type="checkbox"]').prop("checked", false);
            $("#" + breakDiv + "-panel").find('#fixed-break input[type="checkbox"]').prop("disabled", false);
        }
        */

        file = document.querySelector('#break-' + n + ' input[type=file]').files[x];

        loadImage(file, n);
        //images[n] = "multiple";
        typeOfStep[n] = "image";
    }

    toastr.success('As imagens selecionadas foram carregadas.');
}

/**
 * Converts a file to base64 and stores it in a bidimensional array.
 * @param file file to convert to base64
 * @param n number of the step
 */
function loadImage(file, n) {
    if (file != null) {
        var reader = new FileReader();
        reader.onload = function (e) {
            multipleImages.push([n, reader.result, file.name]);
        }
    }
    reader.readAsDataURL(file);
}

/**
 * Gets ordered list of Divs as they are in the page.
 * @returns {Array} list with divs by order
 */
function getOrderedDivs() {
    var divsArray = [];


    $('*[id*=break-]:visible').each(function () {
        divsArray.push($(this));
    });

    var orderedListOfDivs = [];

    var lastRead = 0;
    for (var i = 0; i < divsArray.length; i++) {
        var current = divsArray[i][0].id;
        var aux = current.split('-');
        var numberOfDiv = parseInt(aux[1]);
        if (numberOfDiv != lastRead) {
            orderedListOfDivs.push(numberOfDiv);
            lastRead = numberOfDiv;
        }
    }

    return orderedListOfDivs;
}

/**
 * Submits the created form in the database.
 */
function submitForm() {
    var res = verifyStringFields();

    if (res == true) {
        /*
         }
         $('#modal-for-saves').modal({
         backdrop: 'static',
         keyboard: false
         });
         $('#modal-for-saves').modal('show');
         */
        var configuration = sendToJSON();

        /*
         $.ajax({
         url: urlToPost,
         type: 'POST',
         data: {
         idForm: formID,
         formName: formName,
         formConfig: configuration,
         formThumbnail: imgThumbnail,
         csrfmiddlewaretoken: csrfToken
         },
         success: function () {
         window.location.href = onSuccess;   // redirects to home
         },
         error: function () {
         toastr.error('Ocorreu um erro na gravação do questionário.');
         $('#modal-for-saves').modal('hide');
         }
         });
         */
    }

}

/**
 * Makes a pre-visualization of the form.
 */
function visualization() {
    var res = verifyStringFields();

    if (res == true) {
        $('#modal-for-visualization').modal({
            backdrop: 'static',
            keyboard: false
        });
        $('#modal-for-visualization').modal('show');

        var configuration = sendToJSON();

        $.ajax({
            url: urlToVisualization,
            type: 'POST',
            data: {
                formConfig: configuration,
                csrfmiddlewaretoken: csrfToken
            },
            success: function () {
                window.open(urlToVisualization); // opens pre-visualization
                $('#modal-for-visualization').modal('hide');
            },
            error: function () {
                $('#modal-for-visualization').modal('hide');
                toastr.error('Não é possível gerar uma pré-visualização do questionário.');
            }
        });
    }
}

/**
 * Cancel button.
 */
$('#cancel-form').click(function () {
    location.href = onSuccess;
});