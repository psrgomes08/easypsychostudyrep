var breakDiv = 0;

$(document).ready(function () {
    var qN = 0;

    for (var i = 0; i < sizeOfForm; i++) {
        breakDiv = "break-" + (i + 1);

        $("#add-break").trigger("click");   // adds the steps

        if (document.getElementById(breakDiv) !== null) {

            // Retrieves title of step
            document.getElementById(breakDiv + "-name").value = document.getElementById(breakDiv + "-name").defaultValue = formConfiguration.passos[i].nomePasso;

            // Retrieves step checked
            if (formConfiguration.passos[i].hasOwnProperty("fixo")) {
                $("#" + breakDiv).find('#fixed-break input[type="checkbox"]').prop("checked", true);
            }

            // Adds Video
            if((formConfiguration.passos[i].hasOwnProperty("fonteEstimuloVideo")) && (formConfiguration.passos[i].fonteEstimuloVideo.length > 0)) {
                addStimulusVideo((i+1));
                $('#' + breakDiv).find('#video-stimulus-name-' + (i+1)).val(formConfiguration.passos[i].nomeDoEstimuloVideo);
                $('#' + breakDiv).find('#video-stimulus-' + (i+1)).val(formConfiguration.passos[i].fonteEstimuloVideo);
            }

            // Adds Image
            if ((formConfiguration.passos[i].hasOwnProperty("fonteEstimulo")) && (formConfiguration.passos[i].fonteEstimulo.length > 0)) {
                var imageName = formConfiguration.passos[i].nomeDoEstimulo;
                var src = formConfiguration.passos[i].fonteEstimulo;
                var newImage = document.createElement('img');
                newImage.src = src;
                newImage.width = 200;
                document.querySelector('#' + breakDiv).innerHTML += "<br/><p><b>Estímulo previamente carregado: </b>" + imageName + "</p><p>Pré-visualização:</p>" + newImage.outerHTML + "<br/>";
                addStimulus((i + 1));
                $('#' + breakDiv).find('#form-stimulus-time').val(formConfiguration.passos[i].tempoEstimulo);
                images[(i + 1)] = formConfiguration.passos[i].fonteEstimulo;
            }

            // Adds scale
            if ((formConfiguration.passos[i].hasOwnProperty("escalasSAM")) && (formConfiguration.passos[i].escalasSAM.length > 0)) {
                addSAMScale((i + 1));

                for (var k = 0; k < formConfiguration.passos[i].escalasSAM.length; k++) {
                    var scale = formConfiguration.passos[i].escalasSAM[k];
                    switch (scale) {
                        case "valência":
                            $("#" + breakDiv).find('#sam-scale-val').prop("checked", true);
                            break;

                        case "alerta":
                            $("#" + breakDiv).find('#sam-scale-awe').prop("checked", true);
                            break;

                        case "dominância":
                            $("#" + breakDiv).find('#sam-scale-dom').prop("checked", true);
                            break;
                    }
                }
            }

            // Adds questions
            if ((formConfiguration.passos[i].hasOwnProperty("questoes")) && (formConfiguration.passos[i].questoes.length > 0)) {
                for (var k = 0; k < formConfiguration.passos[i].questoes.length; k++) {
                    addQuestion((i + 1));
                    document.getElementById("question-" + qN).value = document.getElementById("question-" + qN).defaultValue = formConfiguration.passos[i].questoes[k];
                    qN++;
                }
            }

            // Adds description
            if ((formConfiguration.passos[i].hasOwnProperty("descricaoPasso")) && (formConfiguration.passos[i].descricaoPasso.length > 0)) {
                addDescriptionField((i + 1));
                if ($('#' + breakDiv).find('#fixed-description').length == 1) {
                    $('#' + breakDiv).find('#fixed-description').text(formConfiguration.passos[i].descricaoPasso);
                }
            }

        }
    }
});