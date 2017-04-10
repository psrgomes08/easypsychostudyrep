var divWhereToAdd = ""; // used in addQuestion(n)
var breakNumber = 0; // used in addQuestion(n)
var images = []; // used in sendToJson()
var x = 0; // used in addQuestion(n)
var formName;
var imgThumbnail;
var multipleImages = [];

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
 * Adds an open file option field to select a stimulus
 * @param n number of the step
 */
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
            '<button class="btn btn-info" type="button" onclick="getBase64(' + n + ')"><span class="glyphicon glyphicon-import"></span> Carregar</button>' +
            '</label>' +
            '<input id="files-selected" type="text" class="form-control" readonly>' +
            '</div>' +
            '<br/><br/><div class="form-group"><label for="form-stimulus-time">Tempo de apresentação definido</label><input type="text" class="form-control" id="form-stimulus-time"></div>');
    }
}

/**
 * Adds a stimulus of the video type
 * @param n number of the step
 */
function addStimulusVideo(n) {
    divWhereToAdd = "#break-" + n;

    if ($(divWhereToAdd).find("#video-stimulus-" + n).length) {
        toastr.error('Já adicionou um estímulo de vídeo nesta tarefa.');
    } else if ($(divWhereToAdd).find("#fixed-description").length == 1) { // if there is a description
        toastr.error('Não pode adicionar elementos extra numa tarefa que contenha instruções.');
    } else if ($(divWhereToAdd).find("#form-stimulus").length) { // if there is an image stimulus
        toastr.error('Não pode adicionar um estímulo de vídeo numa tarefa com estímulo de imagem.');
    } else {
        $(divWhereToAdd).append($(divWhereToAdd).append("<br/>" +
            "<label>Título do vídeo</label><input id='video-stimulus-name-" + n + "' type='text' class='form-control'><br/>" +
            "<label>Link da Dropbox do vídeo a apresentar</label><input id='video-stimulus-" + n + "' type='text' class='form-control'>" +
            "<br/>"));
    }
}


/**
 * Adds an open multiple files option field to select multiple stimuluses
 * @param n number of the step
 */
function addStimulusMultiple(n) {
    divWhereToAdd = "#break-" + n;
    formStimulus = "#form-stimulus";

    if ($(divWhereToAdd).find(formStimulus).length) {
        toastr.error('Já inseriu um estímulo nesta tarefa.', '');
    } else if ($(divWhereToAdd).find('#fixed-description').length == 1) { // if there is a description
        toastr.error('Não pode adicionar elementos extra numa tarefa que contém instruções.');
    }
    else {
        $(divWhereToAdd).append('<br/><p><b>Selecionar estímulos a carregar</b></p>' +
            '<div id="form-stimulus" class="input-group">' +
            '<label class="input-group-btn">' +
            '<span class="btn btn-default"><span class="glyphicon glyphicon-folder-open"></span> Pesquisar' +
            '<input style="display: none;" type="file" multiple id="input-stimulus-multiple" onchange="getFileNames(' + n + ')"></span>' +
            '<button class="btn btn-info" type="button" onclick="getBase64Multiple(' + n + ')"><span class="glyphicon glyphicon-import"></span> Carregar</button>' +
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
        $(divWhereToAdd).find('#fixed-break input[type="checkbox"]').prop("checked", true); // a description field has to be fixed
        $(divWhereToAdd).find('#fixed-break input[type="checkbox"]').prop("disabled", true); // blocks the fixed attribute
    }
}

/**
 * Adds a SAM scale option selector in the form
 * @param n number of the step
 */
function addSAMScale(n) {
    divWhereToAdd = "#break-" + n;

    if ($(divWhereToAdd).find("#form-sam-scales").length) { // if there is already a scale -> error
        toastr.error('Já adicionou uma escala a esta tarefa.');
    } else if (($(divWhereToAdd).find("#form-stimulus").length == 0) && ($(divWhereToAdd).find("#video-stimulus-" + n).length == 0)) { // if there is no stimulus -> error
        toastr.error('Só pode adicionar escalas a uma tarefa que contenha um estímulo.');
        console.log($(divWhereToAdd).find("#video-stimulus-" + n).length);
    } else {
        $(divWhereToAdd).append("" +
            "<br/><div id='form-sam-scales'><p><b>Escalas a apresentar</b></p>" +
            "<label class='checkbox-inline'><input type='checkbox' value='valência' id='sam-scale-val'>Valência</label>" +
            "<label class='checkbox-inline'><input type='checkbox' value='alerta' id='sam-scale-awe'>Alerta</label>" +
            "<label class='checkbox-inline'><input type='checkbox' value='dominância' id='sam-scale-dom'>Dominância</label>" +
            "</div><br/>");
    }
}

/**
 * Deletes an entire step and it's contents
 * @param n number of step
 */
function deleteBreak(n) {
    var stepToDelete = "#break-" + n;
    $(stepToDelete).remove();

    // If the step is a multiple one, delete containing images:
    for (var i = 0, len = multipleImages.length; i < len; i++) {
        if (multipleImages[i] !== undefined && multipleImages[i][0] === n) {
            delete multipleImages[i];
            images[n] = "";
        }
    }

    toastr.success('Tarefa ' + n + ' apagada.');
}

$(document).ready(function () {

    /**
     * Adds a new step.
     */
    $("#add-break").on("click", function () {
        breakNumber = breakNumber + 1;
        $("#content-added-by-user").append("" +
            "<div id='break-" + breakNumber + "'>" +
            "<div style='background-color: #222; color: #FFF;'>" +
            "<div style='display: flex; justify-content: center; align-items: center; padding-top: 10px;'>" + // div for the step title
            "<input style='width: 200px; text-align: center;' placeholder='Tarefa " + breakNumber + "' type='text' id='break-" + breakNumber + "-name' class='form-control'>" +
            "</div>" +
            "<div id='fixed-break' style='display: flex; justify-content: center; align-items: center; padding-top: 5px; padding-left: 17px; padding-bottom: 3px;'>" + // div for buttons
            "<label class='checkbox-inline'><input type='checkbox' value='sim'>Fixo</label>" +
            "<button class='btn btn-lg btn-transparent' type='button' onclick='addQuestion(" + breakNumber + ")' title='Adicionar questão'><span class='glyphicon glyphicon-pencil'></span></button>" +
            "<button class='btn btn-lg btn-transparent' type='button' onclick='addStimulus(" + breakNumber + ")' title='Adicionar estímulo (imagem)'><span class='glyphicon glyphicon-picture'></span></button>" +
            "<button class='btn btn-lg btn-transparent' type='button' onclick='addStimulusVideo(" + breakNumber + ")' title='Adicionar estímulo (vídeo)'><span class='glyphicon glyphicon-film'></span></button>" +
            "<button class='btn btn-lg btn-transparent' type='button' onclick='addSAMScale(" + breakNumber + ")' title='Adicionar escala SAM'><span class='glyphicon glyphicon-record'></span></button>" +
            "<button class='btn btn-lg btn-transparent' type='button' onclick='addDescriptionField(" + breakNumber + ")' title='Adicionar instruções'><span class='glyphicon glyphicon-font'></span></button>" +
            "<button class='btn btn-lg btn-transparent' type='button' onclick='deleteBreak(" + breakNumber + ")' title='Apagar tarefa'><span class='glyphicon glyphicon-remove'></span></button>" +
            "</div>" +
            "</div></div>");
    });

    /**
     * Adds a new step of multiple stimulus
     */
    $("#add-break-multiple").on("click", function () {
        breakNumber = breakNumber + 1;
        $("#content-added-by-user").append("" +
            "<div id='break-" + breakNumber + "'>" +
            "<div style='background-color: #222; color: #FFF;'>" +
            "<div style='display: flex; justify-content: center; align-items: center; padding-top: 10px;'>" + // div for the step title
            "<input style='width: 200px; text-align: center;' placeholder='Tarefa " + breakNumber + " (conjunto)' type='text' id='break-" + breakNumber + "-name' class='form-control'>" +
            "</div>" +
            "<div id='fixed-break' style='display: flex; justify-content: center; align-items: center; padding-top: 5px; padding-left: 17px; padding-bottom: 3px;'>" + // div for buttons
            "<label class='checkbox-inline'><input type='checkbox' value='sim' disabled>Fixo</label>" +
            "<button class='btn btn-lg btn-transparent' type='button' onclick='addQuestion(" + breakNumber + ")' title='Adicionar questão geral'><span class='glyphicon glyphicon-pencil'></span></button>" +
            "<button class='btn btn-lg btn-transparent' type='button' onclick='addStimulusMultiple(" + breakNumber + ")' title='Adicionar conjunto de estímulos'><span class='glyphicon glyphicon-picture'></span></button>" +
            "<button class='btn btn-lg btn-transparent' type='button' onclick='addSAMScale(" + breakNumber + ")' title='Adicionar escala SAM geral'><span class='glyphicon glyphicon-record'></span></button>" +
            "<button class='btn btn-lg btn-transparent disabled' type='button' title='Adicionar instruções'><span class='glyphicon glyphicon-font'></span></button>" +
            "<button class='btn btn-lg btn-transparent' type='button' onclick='deleteBreak(" + breakNumber + ")' title='Apagar tarefa'><span class='glyphicon glyphicon-remove'></span></button>" +
            "</div>" +
            "</div></div>");
    });

});

/**
 * Gathers the information inserted by the user and transforms it into JSON format.
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

        // Verify if step has elements
        if ($('#' + breakDiv).children().length == 1) {
            errors.push("Insira elementos dentro da Tarefa " + i + ", ou então apague-a.");
        }

        // Verify name of step
        if ($('#' + breakDiv).find('#' + breakDiv + '-name').length == 1) {
            var nPasso = $('#' + breakDiv).find('#' + breakDiv + '-name').val();

            if (nPasso.search('\"') > -1 || nPasso.search('\'') > -1 || nPasso.search(new RegExp("\\\\", 'g')) > -1) {
                errors.push("Foram detetados caracteres inválidos (aspas, pelicas ou barras) na <b>Tarefa " + i + "</b> no nome da Tarefa.");
            }
        }

        // Verify description of step
        if ($('#' + breakDiv).find('#fixed-description').length == 1) {
            var dPasso = $('#' + breakDiv).find('#fixed-description').val();

            if (dPasso.search('\"') > -1 || dPasso.search('\'') > -1 || dPasso.search(new RegExp("\\\\", 'g')) > -1) {
                errors.push("Foram detetados caracteres inválidos (aspas, pelicas ou barras) na <b>Tarefa " + i + "</b> no campo <b>Instruções</b>");
            }
            if (dPasso == "") {
                errors.push("Preencha o campo <b>Instruções</b> na <b>Tarefa " + i + "</b>.");
            }
        }

        // Verifiy video stimulus of step
        if ($('#' + breakDiv).find('#video-stimulus-' + i).length) {
            var vTitle = $('#' + breakDiv).find('#video-stimulus-name-' + i).val();
            var vLink = $('#' + breakDiv).find('#video-stimulus-' + i).val();

            if (vTitle.search('\"') > -1 || vTitle.search('\'') > -1 || vTitle.search(new RegExp("\\\\", 'g')) > -1) {
                errors.push("Foram detetados caracteres inválidos (aspas, pelicas ou barras) na <b>Tarefa " + i + "</b> no campo <b>Título do vídeo</b>");
            }
            if (vTitle == "") {
                errors.push("Preencha o campo <b>Título do vídeo</b> na <b>Tarefa " + i + "</b>.");
            }

            if (!vLink.includes("http")) {
                errors.push("Preencha o campo <b>Link da Dropbox do vídeo a apresentar</b> na <b>Tarefa " + i + "</b> com um link válido.");
            }
            if (vLink.search('\"') > -1 || vLink.search('\'') > -1 || vLink.search(new RegExp("\\\\", 'g')) > -1) {
                errors.push("Foram detetados caracteres inválidos (aspas, pelicas ou barras) na <b>Tarefa " + i + "</b> no campo <b>Link da Dropbox do vídeo a apresentar</b>");
            }
            if (vLink == "") {
                errors.push("Preencha o campo <b>Link da Dropbox do vídeo a apresentar</b> na <b>Tarefa " + i + "</b>.");
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


    if (errors.length == 0) { // if there are no errors
        return true;
    } else { // display all the errors
        for (var i = 0; i < errors.length; i++) {
            toastr.warning(errors[i]);
        }
        return false;
    }
}

/**
 * Collects the information and converts it to a JSON string.
 */
function sendToJSON() {
    var studyConfig = {};

    formName = $('#form-name').val();
    var formDescription = $('#form-description').val();

    var formColor = $('input[name=optradio]:checked', '#form-questionnaire').val();

    // Adds basic information to JSON
    studyConfig.id = formID;

    studyConfig.nome = formName;
    studyConfig.descricao = formDescription;
    studyConfig.corFundo = formColor;

    auxPassos = [];

    var nStep = 0;

    for (i = 1; i <= breakNumber; i++) {
        var breakDiv = "break-" + i;

        if (document.getElementById(breakDiv) !== null) {

            if (images[i] != "multiple") { // for a normal step
                nStep = nStep + 1; // number of step in order

                // Adds step to JSON
                var configPasso = {};

                configPasso.nPasso = nStep;

                // Checks if the step is fixed or not
                $('#' + breakDiv).find('#fixed-break input[type="checkbox"]').each(function () {
                    if ($(this).is(":checked")) {
                        configPasso.fixo = $(this).prop("value");
                    }
                });

                // Adds description of step to JSON
                if ($('#' + breakDiv).find('#fixed-description').length == 1) {
                    configPasso.descricaoPasso = $('#' + breakDiv).find('#fixed-description').val();
                }

                // Adds name of step to JSON
                if ($('#' + breakDiv).find('#' + breakDiv + '-name').length == 1) {

                    if ($('#' + breakDiv).find('#' + breakDiv + '-name').val() == "") {
                        configPasso.nomePasso = "Tarefa " + nStep;
                    } else {
                        configPasso.nomePasso = $('#' + breakDiv).find('#' + breakDiv + '-name').val();
                    }

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
                }

                // Adds selected SAM scales to JSON
                var selectedSAMScales = [];
                $('#' + breakDiv).find('#form-sam-scales input[type="checkbox"]').each(function () {
                    if ($(this).is(":checked")) {
                        selectedSAMScales.push($(this).prop("value"));
                    }
                });
                configPasso.escalasSAM = selectedSAMScales;

                // Adds image stimulus to JSON
                // Image stimulus name and extension
                $('#' + breakDiv).find('#form-stimulus input[type="file"]').each(function () {
                    configPasso.nomeDoEstimulo = $(this).prop("value").split('/').pop().split('\\').pop();

                });

                // Image stimulus source in Base 64
                configPasso.fonteEstimulo = images[i];

                // Image stimulus time
                configPasso.tempoEstimulo = $('#' + breakDiv).find('#form-stimulus-time').val();

                // Adds video stimulus to JSON
                // Video stimulus name
                configPasso.nomeDoEstimuloVideo = $('#' + breakDiv).find('#video-stimulus-name-' + i).val();

                // Video stimulus source
                var videoStimulus = $('#' + breakDiv).find('#video-stimulus-' + i).val();
                if (videoStimulus != undefined) {
                    var res = videoStimulus.split("?");
                    configPasso.fonteEstimuloVideo = res[0];
                }

                auxPassos.push(configPasso);

            } else { // for a multiple step
                for (var o = 0, len = multipleImages.length; o < len; o++) {
                    if (multipleImages[o] !== undefined && multipleImages[o][0] === i) {
                        console.log(multipleImages[o][0]);
                        nStep = nStep + 1;

                        // Adds step to JSON
                        var configPasso = {};

                        configPasso.nPasso = nStep;

                        // Adds name of step to JSON
                        if ($('#' + breakDiv).find('#' + breakDiv + '-name').length == 1) {

                            if ($('#' + breakDiv).find('#' + breakDiv + '-name').val() == "") {
                                configPasso.nomePasso = "Tarefa " + nStep;
                            } else {
                                configPasso.nomePasso = $('#' + breakDiv).find('#' + breakDiv + '-name').val();
                            }

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
                        }

                        // Adds selected SAM scales to JSON
                        var selectedSAMScales = [];
                        $('#' + breakDiv).find('#form-sam-scales input[type="checkbox"]').each(function () {
                            if ($(this).is(":checked")) {
                                selectedSAMScales.push($(this).prop("value"));
                            }
                        });
                        configPasso.escalasSAM = selectedSAMScales;

                        // Image stimulus name and extension
                        configPasso.nomeDoEstimulo = multipleImages[o][2];

                        // Image stimulus source in Base 64
                        configPasso.fonteEstimulo = multipleImages[o][1];

                        // Image stimulus time
                        configPasso.tempoEstimulo = $('#' + breakDiv).find('#form-stimulus-time').val();

                        auxPassos.push(configPasso);
                    }

                }
            }

        }

    }

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
}

/**
 * Converts a file to base 64 format.
 * @param n number of the step
 */
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

/**
 * Gets file names when files are selected to upload.
 * @param n number of the step
 */
function getFileNames(n) {
    if (n == 0) {   // for the thumbnail
        var thumbTextInput = $('#form-thumbnail').find('#files-selected');
        var file = document.querySelector('#form-thumbnail input[type=file').files[0].name;
        console.log("Thumbnail: " + file);
        thumbTextInput.val(file);
        toastr.info('Não se esqueça de <b>carregar</b> a miniatura selecionada.');

    } else {
        var breakDiv = "break-" + n;
        var filesTextInput = $('#' + breakDiv).find('#files-selected');
        var text = "";

        for (var x = 0; x < document.querySelector('#break-' + n + ' input[type=file]').files.length; x++) {
            file = document.querySelector('#break-' + n + ' input[type=file]').files[x].name;
            console.log(file);
            text += file + " ";
        }
        filesTextInput.val(text);
        toastr.info('Não se esqueça de <b>carregar</b> os estímulos selecionados.');
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
            images[n] = "";
        }
    }

    for (var x = 0; x < document.querySelector('#break-' + n + ' input[type=file]').files.length; x++) {
        file = document.querySelector('#break-' + n + ' input[type=file]').files[x];

        loadImage(file, n);
        images[n] = "multiple";
    }

    toastr.success('Os estímulos selecionados foram carregados.');
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
 * Edits the form in the database.
 */
function submitForm() {
    var res = verifyStringFields();

    if (res == true) {
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
                toastr.error('Ocorreu um problema na edição do questionário.');
            }
        });
    }
}

/**
 * Makes a pre-visualization of the form
 */
function visualization() {
    var res = verifyStringFields();

    if (res == true) {
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
            },
            error: function () {
                toastr.error('Não é possível gerar uma pré-visualização do questionário.');
            }
        });
    }
}

// Used in Cancel button.
$('#cancel-form').click(function () {
    location.href = onSuccess;
});