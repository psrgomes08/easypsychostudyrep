var divWhereToAdd = ""; // used in addQuestion(n)
var breakNumber = 0; // used in addQuestion(n)
var typeOfStep = [];
var x = 0; // used in addQuestion(n)
var nQuestionLikert = 0; // used in addLikertScale(n)

// Variables used for deleting fields
var qField = 0;
var samField = 0;
var instField = 0;
var likField = 0;
var imgField = 0;
var vidField = 0;

var qDivField = "qDivField";
var samDivField = "samDivField";
var instDivField = "instDivField";
var likDivField = "likDivField";
var imgDivField = "imgDivField";
var vidDivField = "vidDivField";

var formID = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'); // used in sendToJson()

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
 * Deletes element inside panel.
 * @param type type of the element
 * @param number special number of the element
 * @param breakN div of the panel
 */
function deleteElementInsidePanel(type, number, breakN) {

    switch (type) {
        case "imgDivField":
            $("#" + type + "-" + number).remove();
            $("#samDivField-" + breakN).remove();
            for (var i = 0, len = multipleImages.length; i < len; i++) {
                if (multipleImages[i] !== undefined && multipleImages[i][0] === breakN) {
                    delete multipleImages[i];
                    typeOfStep[breakN] = "";
                }
            }
            break;

        case "vidDivField":
            $("#" + type + "-" + breakN).remove();
            $("#samDivField-" + breakN).remove();
            for (var i = 0, len = multipleVideos.length; i < len; i++) {
                if (multipleVideos[i] !== undefined && multipleVideos[i][0] === breakN) {
                    delete multipleVideos[i];
                    typeOfStep[breakN] = "";
                }
            }
            break;

        case "samDivField":
        case "likDivField":
            $("#" + type + "-" + breakN).remove();
            break;

        case "qDivField":
        case "instDivField":
            $("#" + type + "-" + number).remove();
            break;
    }

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
        $(divWhereToAdd).append("<div class='well well-sm' id='qDivField-" + qField + "'>" +
            "<button type='button' class='btn btn-danger btn-xs btn-right' title='Apagar' onclick='deleteElementInsidePanel(" + qDivField + "," + qField + "," + n + ")'><span class='fa fa-trash-o'></span></button> " +
            "<i class='title-in-well'><span class='glyphicon glyphicon-pencil'></span> Campo de questão</i><br/>" +
            "<label>Questão a fazer:</label><input id='question-" + n + "-" + x + "' type='text' class='form-control'>" +
            "</div>");
        x++;
        qField++;
    }
}

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

            typeOfStep[n] = "video";

            $("#loaded-videos-" + n).append("<br/><label>Vídeos carregados:</label>" +
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
        extensions: ['video']
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
            "<label>Vídeos a carregar:</label>" +
            "<div class='input-group'>" +
            "<span class='input-group-addon'>Selecionar vídeos</span>" +
            "<button class='form-control btn btn-primary' id='video-stimulus-" + n + "' type='button' onclick='Dropbox.choose(options);'><span class='fa fa-dropbox'></span> <span class='button-text'>Pesquisar na Dropbox</span></button>" +
            "</div>" +
            "<div id='loaded-videos-" + n + "'></div></div>");

        vidField++;
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
        $(divWhereToAdd).append('<div class="well well-sm" id="imgDivField-' + imgField + '">' +
            '<button type="button" class="btn btn-danger btn-xs btn-right" title="Apagar" onclick="deleteElementInsidePanel(' + imgDivField + ',' + imgField + ',' + n + ')"><span class="fa fa-trash-o"></span></button> ' +
            '<i class="title-in-well"><span class="glyphicon glyphicon-picture"></span> Campo de imagem</i><br/>' +
            '<label>Selecionar imagens a carregar:</label>' +
            '<div id="form-stimulus" class="input-group">' +
            '<label class="input-group-btn">' +
            '<span class="btn btn-default"><span class="glyphicon glyphicon-folder-open"></span> Pesquisar' +
            '<input style="display: none;" type="file" accept="image/gif, image/jpeg, image/png, image/jpg" multiple id="input-stimulus-multiple" onchange="getFileNames(' + n + ')"></span>' +
            '<button id="btn-load-' + n + '"  class="btn btn-primary" type="button" onclick="getBase64Multiple(' + n + ')"><span class="fa fa-upload"></span> Carregar</button>' +
            '</label>' +
            '<input id="files-selected" type="text" class="form-control" readonly>' +
            '</div>' +
            '<br/><div class="form-group"><label>Tempo de apresentação por imagem (em seg.):</label><input type="text" class="form-control" id="form-stimulus-time-' + n + '"></div></div>');
    }
}

/**
 * Adds a description field in the form. It must be fixed, otherwise error.
 * @param n number of the step
 */
function addDescriptionField(n) {
    divWhereToAdd = "#break-" + n;

    if ($(divWhereToAdd).children().length >= 1) {
        toastr.error('Só é possível adicionar instruções a uma tarefa que esteja vazia.');
    } else {
        $(divWhereToAdd).append('<div class="well well-sm" id="instDivField-' + instField + '">' +
            '<button type="button" class="btn btn-danger btn-xs btn-right" title="Apagar" onclick="deleteElementInsidePanel(' + instDivField + ',' + instField + ',' + n + ')"><span class="fa fa-trash-o"></span></button> ' +
            '<i class="title-in-well"><span class="glyphicon glyphicon-font"></span> Campo de instrução</i><br/>' +
            '<label>Instruções a apresentar:</label><textarea class="form-control" rows="3" id="fixed-description"></textarea></div>');
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

    if ($(divWhereToAdd).find("#form-sam-scales").length) { // if there is already a sam scale -> error
        toastr.error('Já associou uma escala a esta tarefa.');
    } else if (($(divWhereToAdd).find("#form-stimulus").length == 0) && ($(divWhereToAdd).find("#video-stimulus-" + n).length == 0)) { // if there is no stimulus -> error
        toastr.error('Só pode associar escalas a uma tarefa que contenha estímulos.');
    } else {
        $(divWhereToAdd).append("<div class='well well-sm' id='samDivField-" + n + "'>" +
            "<button type='button' class='btn btn-danger btn-xs btn-right' title='Apagar' onclick='deleteElementInsidePanel(" + samDivField + "," + samField + "," + n + ")'><span class='fa fa-trash-o'></span></button> " +
            "<i class='title-in-well'><span class='glyphicon glyphicon-record'></span> Campo de escala SAM</i><br/>" +
            "<div id='form-sam-scales'><label>Dimensões a apresentar:</label><br/>" +
            "<label class='checkbox-inline'><input type='checkbox' value='Valência' id='sam-scale-val'>Valência</label>" +
            "<label class='checkbox-inline'><input type='checkbox' value='Alerta' id='sam-scale-awe'>Alerta</label>" +
            "<label class='checkbox-inline'><input type='checkbox' value='Dominância' id='sam-scale-dom'>Dominância</label>" +
            "</div></div>");
    }
}

/**
 * Adds a likert scale in the form.
 * @param n number of the step
 */
function addLikertScale(n) {
    divWhereToAdd = "#break-" + n;

    if ($(divWhereToAdd).find('#fixed-description').length) { // if there is a description
        toastr.error('Não pode adicionar elementos extra numa tarefa que contenha instruções.');
    }
    else if ($(divWhereToAdd).find("#form-likert-scale").length) {
        toastr.error('Só pode adicionar um grupo de questões com escala de <i>Likert</i> por tarefa.');
    }
    else {
        $(divWhereToAdd).append("<div class='well well-sm' id='likDivField-" + n + "'>" +
            "<button type='button' class='btn btn-danger btn-xs btn-right' title='Apagar' onclick='deleteElementInsidePanel(" + likDivField + "," + likField + "," + n + ")'><span class='fa fa-trash-o'></span></button> " +
            "<i class='title-in-well'><span class='glyphicon glyphicon-record'></span> Campo de escala Likert</i><br/>" +
            "<div id='form-likert-scale'><label>Tamanho da escala:</label><br/>" +
            "<form id='likertRadios-" + n + "'><label class='radio-inline'><input type='radio' name='optLikertradio' value='5Pontos' id='likert-scale-5'>5 Pontos</label>" +
            "<label class='radio-inline'><input type='radio' name='optLikertradio' value='7Pontos' id='likert-scale-7'>7 Pontos</label>" +
            "</form></div>" +
            "<br/><label>Questões a apresentar com a escala:</label><br/>" +
            "<div id='likert-questions-" + n + "'>" +
            "<ul style='display: none' class='list-group' id='list-in-likert-" + n + "'>" +
            "</ul>" +
            "</div>" +
            "<div class='input-group'><input type='text' class='form-control' id='question-in-likert-" + n + "'>" +
            "<div class='input-group-btn'><button class='btn btn-primary' type='button' onclick='addQuestionInLikert(" + n + ")'><span class='glyphicon glyphicon-plus-sign'></span> Adicionar</button></div></div>" +
            "</div>");
    }

}

/**
 * Adds a question associated to the Likert scale field.
 * @param n number of the step
 */
function addQuestionInLikert(n) {
    $('#list-in-likert-' + n).show();
    var question = $("#question-in-likert-" + n).val();

    $("#list-in-likert-" + n).append("<li class='list-group-item' id='likert-" + n + "-" + nQuestionLikert + "'>" + question + "<button title='Apagar' onclick='deleteQuestionInLikert(" + nQuestionLikert + "," + n + ")' type='button' class='btn btn-xs btn-danger btn-right'><span class='fa fa-trash-o'></span></button></li>");
    nQuestionLikert++;
}

/**
 * Deletes a question inside the a Likert scale field.
 * @param nQuestion identifier of the question
 * @param n number of the step
 */
function deleteQuestionInLikert(nQuestion, n) {
    $("#likert-" + n + "-" + nQuestion).remove();
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
            "<li><button id='break-" + breakNumber + "-scale-btn' class='btn btn-block btn-transparent' type='button' onclick='addSAMScale(" + breakNumber + ")'><span class='glyphicon glyphicon-record'></span> Escala SAM</button></li>" +
            "<li><button id='break-" + breakNumber + "-scale-likert-btn' class='btn btn-block btn-transparent' type='button' onclick='addLikertScale(" + breakNumber + ")'><span class='glyphicon glyphicon-record'></span> Escala Likert</button></li>" +
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
        errors.push("Questionário sem elementos.");
    }

    // Verify title of form
    var fName = $('#form-name').val();

    if (fName.search('\"') > -1 || fName.search('\'') > -1 || fName.search(new RegExp("\\\\", 'g')) > -1) {
        errors.push("Caracteres inválidos (aspas, pelicas ou barras) no campo <b>Nome do questionário</b>.");
    }

    if (fName == "") {
        errors.push("<b>Nome do questionário</b> sem preencher.");
    }

    if (fName.length > 100) {
        errors.push("<b>Nome do questionário</b> com mais de 100 caracteres.");
    }

    // Verify description of form
    var fDescription = $('#form-description').val();

    if (fDescription.search('\"') > -1 || fDescription.search('\'') > -1 || fDescription.search(new RegExp("\\\\", 'g')) > -1) {
        errors.push("Caracteres inválidos (aspas, pelicas ou barras) no campo <b>Descrição do questionário</b>.");
    }

    if (fDescription == "") {
        errors.push("<b>Descrição do questionário</b> sem preencher.");
    }

    // Verify style of form
    var formColor = $('input[name=optradio]:checked', '#form-questionnaire').val();

    if (formColor == undefined) {
        errors.push("Cor do fundo no campo <b>Estilo do questionário</b> por escolher.");
    }

    for (i = 1; i <= breakNumber; i++) {
        var breakDiv = "break-" + i;

        if (document.getElementById(breakDiv) != null) {
            // Verify if step has elements
            if ($('#' + breakDiv).children().length == 0) {
                errors.push("<b>Tarefa " + i + "</b> sem elementos.");
            }

            // Verify name of step
            var nPasso = $('#' + breakDiv + '-name').val();

            if (nPasso.search('\"') > -1 || nPasso.search('\'') > -1 || nPasso.search(new RegExp("\\\\", 'g')) > -1) {
                errors.push("Caracteres inválidos (aspas, pelicas ou barras) na <b>Tarefa " + i + "</b>, no nome da Tarefa.");
            }
            if (nPasso.search('Dados demográficos') > -1 && i > 1) {
                errors.push("Nome da <b>Tarefa " + i + "</b> inválido.");
            }

            // Verify description of step
            if ($('#' + breakDiv).find('#fixed-description').length == 1) {
                var dPasso = $('#' + breakDiv).find('#fixed-description').val();

                if (dPasso.search('\"') > -1 || dPasso.search('\'') > -1 || dPasso.search(new RegExp("\\\\", 'g')) > -1) {
                    errors.push("Caracteres inválidos (aspas, pelicas ou barras) na <b>Tarefa " + i + "</b>, no Campo de Instrução.");
                }
                if (dPasso == "") {
                    errors.push("Campo de instrução na <b>Tarefa " + i + "</b> por preencher.");
                }
            }

            // Verify question fields
            if (document.getElementById(breakDiv) != null) {
                for (var quest = 0; quest < x; quest++) {

                    if ($("#question-" + i + "-" + quest).length) {
                        var question = $("#question-" + i + "-" + quest).val();
                        if (question.search('\"') > -1 || question.search('\'') > -1 || question.search(new RegExp("\\\\", 'g')) > -1) {
                            errors.push("Caracteres inválidos (aspas, pelicas ou barras) na <b>Tarefa " + i + "</b> no Campo de questão.");
                        }
                        if (question == "") {
                            errors.push("Campo de questão na <b>Tarefa " + i + "</b> por preencher.");
                        }
                    }

                }
            }

            // Verify time set for images
            if (document.getElementById(breakDiv) != null) {

                if ($('#form-stimulus-time-' + i).length) {
                    var stimulusTime = $('#form-stimulus-time-' + i).val();

                    if (stimulusTime.match(/^\d+$/)) {
                        //valid integer)
                    }
                    else if (stimulusTime == "") {
                        errors.push("Tempo de apresentação das imagens na <b>Tarefa " + i + "</b> por preencher.");
                    }
                    else {
                        errors.push("Tempo de apresentação das imagens na <b>Tarefa " + i + "</b> incorreto.");
                    }
                }

            }

            // Verify if images were loaded
            if (document.getElementById(breakDiv) != null) {

                if ($('#form-stimulus-time-' + i).length) { // if it is an image field, it has to have a time field too
                    var imagesLoaded = false;

                    for (var mi = 0; mi < multipleImages.length; mi++) {
                        if (multipleImages[mi] != undefined && multipleImages[mi][0] == i) {
                            imagesLoaded = true;
                            break;
                        }
                    }

                    if (!imagesLoaded) {
                        errors.push("Não foram carregadas imagens na <b>Tarefa " + i + "</b>.");
                    }

                }

            }

            // Verify if videos were loaded
            if (document.getElementById(breakDiv) != null) {

                if ($('#vidDivField-' + i).length) {

                    var videosLoaded = false;

                    for (var mi = 0; mi < multipleVideos.length; mi++) {
                        if (multipleVideos[mi] != undefined && multipleVideos[mi][0] == i) {
                            videosLoaded = true;
                            break;
                        }
                    }

                    if (!videosLoaded) {
                        errors.push("Não foram carregados vídeos na <b>Tarefa " + i + "</b>.");
                    }

                }

            }

            // Verify likert question fields
            if (document.getElementById(breakDiv) != null) {

                if ($("#likDivField-" + i).length > 0) {
                    var nLikertQuestionsInDiv = 0;

                    for (var questLik = 0; questLik < nQuestionLikert; questLik++) {
                        if ($("#likert-" + i + "-" + questLik).length) {

                            var likQuestion = $("#likert-" + i + "-" + questLik).text();

                            if (likQuestion == "" || likQuestion == null) {
                                errors.push("Questões vazias com a Escala de <i>Likert</i> na <b>Tarefa " + i + "</b>.");
                            } else {
                                if (likQuestion.search('\"') > -1 || likQuestion.search('\'') > -1 || likQuestion.search(new RegExp("\\\\", 'g')) > -1) {
                                    errors.push("Caracteres inválidos (aspas, pelicas ou barras) na <b>Tarefa " + i + "</b> no campo de questões a apresentar com a Escala de <i>Likert</i> na <b>Tarefa " + i + "</b>..");
                                }
                            }

                            nLikertQuestionsInDiv++;

                        }
                    }

                    if (nLikertQuestionsInDiv == 0) {
                        errors.push("Nenhuma questão a apresentar com a Escala de <i>Likert</i> na <b>Tarefa " + i + "</b>.");
                    }

                    var likertPointValue = $('input[name=optLikertradio]:checked', '#likertRadios-' + i).val();
                    if (likertPointValue == undefined) {
                        errors.push("Nenhum tamanho de Escala de <i>Likert</i> selecionado na <b>Tarefa " + i + "</b>.");
                    }
                }

            }

            // Verify sam scale field
            if (document.getElementById(breakDiv) != null) {
                if ($('#' + breakDiv).find("#form-sam-scales").length > 0) {
                    var selectedSAMScales = [];

                    $('#' + breakDiv).find('#form-sam-scales input[type="checkbox"]').each(function () {
                        if ($(this).is(":checked")) {
                            selectedSAMScales.push($(this).prop("value"));
                        }
                    });

                    if (selectedSAMScales.length == 0) {
                        errors.push("Nenhuma dimensão da Escala SAM selecionado na <b>Tarefa " + i + "</b>.");
                    }
                }
            }

        }
    }


    var stringErrors = "Foram detetados os erros seguintes:<br/><ul>";
    if (errors.length == 0) { // if there are no errors
        return true;
    } else { // display all the errors
        for (var i = 0; i < errors.length; i++) {
            stringErrors += ("<li>" + errors[i] + "</li>");

            //toastr.warning(errors[i]);
        }
        stringErrors += "</ul>";
        toastr.error(stringErrors);
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
                        var listOfQuestions = [];

                        for (var quest = 0; quest < x; quest++) {
                            if ($("#question-" + i + "-" + quest).length) {
                                listOfQuestions.push($("#question-" + i + "-" + quest).val());
                            }
                        }

                        if (listOfQuestions.length > 0) {
                            configPasso.questoes = listOfQuestions;
                            //console.log("questoes: " + configPasso.questoes);
                        }

                        // Adds selected SAM scales to JSON
                        var selectedSAMScales = [];
                        if ($('#' + breakDiv).find("#form-sam-scales").length > 0) {


                            $('#' + breakDiv).find('#form-sam-scales input[type="checkbox"]').each(function () {
                                if ($(this).is(":checked")) {
                                    selectedSAMScales.push($(this).prop("value"));
                                }
                            });

                        }

                        if (selectedSAMScales.length > 0) {
                            configPasso.escalasSAM = selectedSAMScales;
                            //console.log("escalasSAM: " + configPasso.escalasSAM);
                        }

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

                        // Adds Likert Scale questions to JSON
                        var likertPointValue = $('input[name=optLikertradio]:checked', '#likertRadios-' + i).val();
                        configPasso.nPontosLikert = likertPointValue;

                        var listOfLikertQuestions = [];

                        for (var likQuest = 0; likQuest < nQuestionLikert; likQuest++) {
                            if ($("#likert-" + i + "-" + likQuest).length) {
                                listOfLikertQuestions.push($("#likert-" + i + "-" + likQuest).text());
                            }
                        }

                        if (listOfLikertQuestions.length > 0) {
                            configPasso.questoesLikert = listOfLikertQuestions;
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
                        var listOfQuestions = [];

                        for (var quest = 0; quest < x; quest++) {
                            if ($("#question-" + i + "-" + quest).length) {
                                listOfQuestions.push($("#question-" + i + "-" + quest).val());
                            }
                        }

                        if (listOfQuestions.length > 0) {
                            configPasso.questoes = listOfQuestions;
                            //console.log("questoes: " + configPasso.questoes);
                        }

                        // Adds selected SAM scales to JSON
                        var selectedSAMScales = [];
                        if ($('#' + breakDiv).find("#form-sam-scales").length > 0) {


                            $('#' + breakDiv).find('#form-sam-scales input[type="checkbox"]').each(function () {
                                if ($(this).is(":checked")) {
                                    selectedSAMScales.push($(this).prop("value"));
                                }
                            });

                        }

                        if (selectedSAMScales.length > 0) {
                            configPasso.escalasSAM = selectedSAMScales;
                            //console.log("escalasSAM: " + configPasso.escalasSAM);
                        }

                        // Image stimulus name and extension
                        configPasso.nomeDoEstimulo = multipleImages[o][2];
                        //console.log("nomeDoEstimulo: " + configPasso.nomeDoEstimulo);

                        // Image stimulus source in Base 64
                        configPasso.fonteEstimulo = multipleImages[o][1];

                        // Image stimulus time
                        configPasso.tempoEstimulo = $('#form-stimulus-time-' + i).val();
                        //console.log("tempoEstimulo: " + configPasso.tempoEstimulo);

                        // Adds Likert Scale questions to JSON
                        var likertPointValue = $('input[name=optLikertradio]:checked', '#likertRadios-' + i).val();
                        configPasso.nPontosLikert = likertPointValue;

                        var listOfLikertQuestions = [];

                        for (var likQuest = 0; likQuest < nQuestionLikert; likQuest++) {
                            if ($("#likert-" + i + "-" + likQuest).length) {
                                listOfLikertQuestions.push($("#likert-" + i + "-" + likQuest).text());
                            }
                        }

                        if (listOfLikertQuestions.length > 0) {
                            configPasso.questoesLikert = listOfLikertQuestions;
                        }

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
                var listOfQuestions = [];

                for (var quest = 0; quest < x; quest++) {
                    if ($("#question-" + i + "-" + quest).length) {
                        listOfQuestions.push($("#question-" + i + "-" + quest).val());
                    }
                }

                if (listOfQuestions.length > 0) {
                    configPasso.questoes = listOfQuestions;
                    //console.log("questoes: " + configPasso.questoes);
                }

                // Adds Likert Scale questions to JSON
                var likertPointValue = $('input[name=optLikertradio]:checked', '#likertRadios-' + i).val();
                configPasso.nPontosLikert = likertPointValue;

                var listOfLikertQuestions = [];

                for (var likQuest = 0; likQuest < nQuestionLikert; likQuest++) {
                    if ($("#likert-" + i + "-" + likQuest).length) {
                        listOfLikertQuestions.push($("#likert-" + i + "-" + likQuest).text());
                    }
                }

                if (listOfLikertQuestions.length > 0) {
                    configPasso.questoesLikert = listOfLikertQuestions;
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
        fileExtension = fileExtension.toLowerCase();
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
            fileExtension = fileExtension.toLowerCase();
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

        $('#modal-for-saves').modal({
            backdrop: 'static',
            keyboard: false
        });
        $('#modal-for-saves').modal('show');

        var configuration = sendToJSON();


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
                toastr.error('Não foi possível gerar uma pré-visualização do questionário.');
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