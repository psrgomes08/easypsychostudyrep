var divWhereToAdd = ""; // used in addQuestion(n)
var breakNumber = 0; // used in addQuestion(n)
var images = []; // used in sendToJson()
var x = 0; // used in addQuestion(n)
var formID = Math.random().toString(36).substring(2); // used in sendToJson()
var formName;
var imgThumbnail;

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
        toastr.error('Nao pode adicionar campos extra num passo de descrição.');
    } else {
        $(divWhereToAdd).append("" +
            "<br/>" +
            "<label for='question-area'>Questão proposta</label><input id='question-" + x + "' type='text' class='form-control'>" +
            "");
        x++;
    }
}

/**
 * Adds an open file option field to select a stimulus
 * @param n number of the step
 */
function addStimulus(n) {
    divWhereToAdd = "#break-" + n;
    formStimulus = "#form-stimulus";

    if ($(divWhereToAdd).find(formStimulus).length) {
        toastr.error('Já inseriu um estímulo neste passo.', '');
    } else if ($(divWhereToAdd).find('#fixed-description').length == 1) { // if there is a description
        toastr.error('Nao pode adicionar campos extra num passo de descrição.');
    }
    else {
        $(divWhereToAdd).append('<br/><p><b>Carregar estímulo</b></p><div id="form-stimulus" style="float:left" class="form-group"><input type="file" id="input-stimulus"></div>' +
            '<div><button type="button" style="float:right" id="button-convert-stimulus" onclick="getBase64(' + n + ')"><span class="glyphicon glyphicon-refresh"></span> Carregar</button></div>' +
            '<div class="form-group"><label for="form-stimulus-time">Tempo de apresentação do estímulo</label><input type="text" class="form-control" id="form-stimulus-time"></div>');

        //toastr.info('Não se esqueça de carregar o seu estímulo.');
    }
}

/**
 * Adds a description field in the form. It must be fixed, otherwise error.
 * @param n number of the step
 */
function addDescriptionField(n) {
    divWhereToAdd = "#break-" + n;

    if ($(divWhereToAdd).children().length > 1) {
        toastr.error('Só pode adicionar uma descrição a um passo vazio.', '');
    } else {
        $(divWhereToAdd).append('<br/><label>Descrição</label><textarea class="form-control" rows="3" id="fixed-description"></textarea>');
        $(divWhereToAdd).find('#fixed-break input[type="checkbox"]').prop("checked", true); // a description field has to be fixed
        $(divWhereToAdd).find('#fixed-break input[type="checkbox"]').prop("disabled", true); // blocks the fixed attribute
        //toastr.info('Não se esqueça que um campo de descrição irá iniciar uma nova fase do questionário.');
    }
}

/**
 * Adds a SAM scale option selector in the form
 * @param n number of the step
 */
function addSAMScale(n) {
    divWhereToAdd = "#break-" + n;
    formSAMScale = "#form-sam-scales";
    formStimulus = "#form-stimulus";

    if ($(divWhereToAdd).find(formSAMScale).length) { // if there is already a scale -> error
        toastr.error('Já inseriu uma escala SAM neste passo.');
    } else if ($(divWhereToAdd).find(formStimulus).length == 0) { // if there is no stimulus -> error
        toastr.error('Só pode adicionar escalas a um estímulo.');
    } else {
        $(divWhereToAdd).append("" +
            "<br/><div id='form-sam-scales'><p><b>Escalas a apresentar</b></p>" +
            "<label class='checkbox-inline'><input type='checkbox' value='valência' id='sam-scale-val'>Valência</label>" +
            "<label class='checkbox-inline'><input type='checkbox' value='alerta' id='sam-scale-awe'>Alerta</label>" +
            "<label class='checkbox-inline'><input type='checkbox' value='dominância' id='sam-scale-dom'>Dominância</label>" +
            "</div>");
    }
}

/**
 * Deletes an entire step and it's contents
 * @param n number of step
 */
function deleteBreak(n) {
    var stepToDelete = "#break-" + n;
    $(stepToDelete).remove();
    toastr.success('Passo ' + n + ' apagado.');
}

$(document).ready(function () {

    /**
     * Adds a new step.
     */
    $("#add-break").on("click", function () {
        breakNumber = breakNumber + 1;
        $("#content-added-by-user").append("" +
            "<br/><div id='break-" + breakNumber + "'>" +
            "<div style='background-color: #ABB2B9;'>" +
            "<div style='display: flex; justify-content: center; align-items: center; padding-top: 10px;'>" + // div for the step title
            "<input style='width: 200px; text-align: center;' placeholder='Título do Passo' type='text' id='break-" + breakNumber + "-name' class='form-control'>" +
            "</div>" +
            "<div id='fixed-break' style='display: flex; justify-content: center; align-items: center; padding-top: 5px; padding-left: 17px; padding-bottom: 3px;'>" + // div for buttons
            "<label class='checkbox-inline'><input type='checkbox' value='sim'>Fixo</label>" +
            "<button class='btn btn-lg btn-transparent' type='button' onclick='addQuestion(" + breakNumber + ")' title='Adicionar questão'><span class='glyphicon glyphicon-pencil'></span></button>" +
            "<button class='btn btn-lg btn-transparent' type='button' onclick='addStimulus(" + breakNumber + ")' title='Adicionar estímulo'><span class='glyphicon glyphicon-picture'></span></button>" +
            "<button class='btn btn-lg btn-transparent' type='button' onclick='addSAMScale(" + breakNumber + ")' title='Adicionar escala SAM'><span class='glyphicon glyphicon-record'></span></button>" +
            "<button class='btn btn-lg btn-transparent' type='button' onclick='addDescriptionField(" + breakNumber + ")' title='Adicionar secção'><span class='glyphicon glyphicon-option-horizontal'></span></button>" +
            "<button class='btn btn-lg btn-transparent' type='button' onclick='deleteBreak(" + breakNumber + ")' title='Apagar passo'><span class='glyphicon glyphicon-remove'></span></button>" +
            "</div>" +
            "</div></div>");
    });

});

/**
 * Gathers the information inserted by the user and transforms it into JSON format.
 */

function verifyStringFields() {
    var errors = [];

    // Verify title of form
    var fName = $('#form-name').val();
    if (fName.search('\"') > -1) {
        errors.push("Substitua \" \" por « » no nome do questionário.");
    }
    if (fName.search('\'') > -1) {
        errors.push("Remova o caracter inválido ( \' ) no nome do questionário.");
    }
    if (fName.search(new RegExp("\\\\", 'g')) > -1) {
        errors.push("Remova o caracter inválido ( \\ ) no nome do questionário.");
    }

    // Verify description of form
    var fDescription = $('#form-description').val();
    if (fDescription.search('\"') > -1) {
        errors.push("Substitua \" \" por « » na descrição do questionário.");
    }
    if (fDescription.search('\'') > -1) {
        errors.push("Remova o caracter inválido ( \' ) na descrição do questionário.");
    }
    if (fDescription.search(new RegExp("\\\\", 'g')) > -1) {
        errors.push("Remova o caracter inválido ( \\ ) na descrição do questionário.");
    }

    if (document.getElementById(breakDiv) !== null) {
        for (i = 1; i <= breakNumber; i++) {
            var breakDiv = "break-" + i;

            // Verify description of step
            if ($('#' + breakDiv).find('#fixed-description').length == 1) {
                var dPasso = $('#' + breakDiv).find('#fixed-description').val();

                if (dPasso.search('\"') > -1) {
                    errors.push("Substitua \"\" por « » na descrição do Passo " + i + ".");
                }
                if (dPasso.search('\'') > -1) {
                    errors.push("Remova o caracter inválido ( \' ) na descrição do Passo " + i + ".");
                }
                if (dPasso.search(new RegExp("\\\\", 'g')) > -1) {
                    errors.push("Remova o caracter inválido ( \\ ) na descrição do Passo " + i + ".");
                }
            }

            // Verify question fields
            var breakChildren = document.getElementById(breakDiv).children;
            for (var j = 0; j < breakChildren.length; j++) {
                if (breakChildren[j].getAttribute('id') != null) {
                    if (breakChildren[j].getAttribute('id').includes("question")) {
                        var elem = "#" + breakChildren[j].getAttribute('id');
                        var fQuestion = $("#" + breakDiv).find(elem).val();

                        if (fQuestion.search('\"') > -1) {
                            errors.push("Substitua \"\" por « » nas questões do Passo " + i);
                        }
                        if (dPasso.search('\'') > -1) {
                            errors.push("Remova o caracter inválido ( \' ) ns questões do Passo " + i + ".");
                        }
                        if (fQuestion.search(new RegExp("\\\\", 'g')) > -1) {
                            errors.push("Remova o caracter inválido ( \\ ) nas questões do Passo " + i + ".");
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

function sendToJSON() {
    var studyConfig = {};

    formName = $('#form-name').val();
    var formDescription = $('#form-description').val();

    //var formColor = $('#form-color').val();
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
                    configPasso.nomePasso = "Passo " + nStep;
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

            // Adds file to JSON
            // File name and extension
            $('#' + breakDiv).find('#form-stimulus input[type="file"]').each(function () {
                configPasso.nomeDoEstimulo = $(this).prop("value").split('/').pop().split('\\').pop();

            });

            // Stimulus source in Base 64
            configPasso.fonteEstimulo = images[i];

            // Stimulus time
            configPasso.tempoEstimulo = $('#' + breakDiv).find('#form-stimulus-time').val();


            auxPassos.push(configPasso);
        }

    }

    // only adds "passos" json field if they exist.
    if (auxPassos.length > 0) {
        studyConfig.passos = auxPassos;
    }

    // gets the form thumbnail
    if (images.length > 0) {
        for (var i = 0; i < images.length; i++) {
            if (images[i] != null) {
                imgThumbnail = images[i]; // stores a base64 string
                break;
            }
        }
    } else {
        imgThumbnail = defaultThumbnail; // stores static path
    }

    return JSON.stringify(studyConfig);
}

/**
 * Converts a file to it's base 64 format.
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
    toastr.success('O estímulo foi carregado.');
}

/**
 * Submits the created form in the database.
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
                toastr.error('Ocorreu um problema na gravação do formulário.');
            }
        });
    }
}

// Used in Cancel button.
$('#cancel-form').click(function () {
    location.href = onSuccess;
});