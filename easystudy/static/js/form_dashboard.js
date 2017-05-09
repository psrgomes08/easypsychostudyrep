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
            $('#' + idParticipant).addClass("active");

            $("#participantData").show();
            $("#idParticipante").html(idParticipant);
            $("#timestampRecolha").html(data['timestampCollection']);

            $("#graphs").show();

            if (data['valence'].length > 0) {
                $("#valenceDiv").show();

                var stimulusValence = [];
                var valuesValence = [];
                for (var i = 0; i < data['valence'].length; i++) {
                    stimulusValence.push(data['valence'][i][0]);
                    valuesValence.push(data['valence'][i][1]);
                }


                var valenceChartData = {
                    labels: stimulusValence,
                    datasets: [
                        {
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderColor: 'rgba(255,99,132,1)',
                            label: "Valência Afetiva",
                            borderWidth: 1,
                            data: valuesValence
                        }
                    ]
                };

                var ctxValence = document.getElementById("valenceChart").getContext("2d");
                var valenceChart = new Chart(ctxValence, {
                    type: 'horizontalBar',
                    data: valenceChartData,
                    options: {
                        responsive: true,
                        scales: {
                            xAxes: [{
                                ticks: {
                                    beginAtZero: true,
                                    max: 9
                                }
                            }]
                        }
                    }
                });

            } else {
                $("#valenceDiv").show();
                $("#valenceDiv").html('<p align="center">Não foram capturados valores de Valência Afetiva para este participante.</p>');
            }

            if (data['arousal'].length > 0) {
                $("#arousalDiv").show();

                var stimulusArousal = [];
                var valuesArousal = [];
                for (var i = 0; i < data['arousal'].length; i++) {
                    stimulusArousal.push(data['arousal'][i][0]);
                    valuesArousal.push(data['arousal'][i][1]);
                }


                var arousalChartData = {
                    labels: stimulusArousal,
                    datasets: [
                        {
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            label: "Ativação Fisiológica",
                            borderWidth: 1,
                            data: valuesArousal
                        }
                    ]
                };

                var ctxArousal = document.getElementById("arousalChart").getContext("2d");
                var arousalChart = new Chart(ctxArousal, {
                    type: 'horizontalBar',
                    data: arousalChartData,
                    options: {
                        responsive: true,
                        scales: {
                            xAxes: [{
                                ticks: {
                                    beginAtZero: true,
                                    max: 9
                                }
                            }]
                        }
                    }
                });

            } else {
                $("#arousalDiv").show();
                $("#arousalDiv").html('<p align="center">Não foram capturados valores de Ativação Fisiológica para este participante.</p>');
            }

            if (data['dominance'].length > 0) {
                $("#dominanceDiv").show();

                var stimulusDominance = [];
                var valuesDominance = [];
                for (var i = 0; i < data['dominance'].length; i++) {
                    stimulusDominance.push(data['dominance'][i][0]);
                    valuesDominance.push(data['dominance'][i][1]);
                }


                var dominanceChartData = {
                    labels: stimulusDominance,
                    datasets: [
                        {
                            backgroundColor: 'rgba(255, 206, 86, 0.2)',
                            borderColor: 'rgba(255, 206, 86, 1)',
                            label: "Dominância",
                            borderWidth: 1,
                            data: valuesDominance
                        }
                    ]
                };

                var ctxDominance = document.getElementById("dominanceChart").getContext("2d");
                var dominanceChart = new Chart(ctxDominance, {
                    type: 'horizontalBar',
                    data: dominanceChartData,
                    options: {
                        responsive: true,
                        scales: {
                            xAxes: [{
                                ticks: {
                                    beginAtZero: true,
                                    max: 9
                                }
                            }]
                        }
                    }
                });

            } else {
                $("#dominanceDiv").show();
                $("#dominanceDiv").html('<p align="center">Não foram capturados valores de Dominância para este participante.</p>');
            }

        },
        error: function (data) {
            toastr.error('Não é possível apresentar a informação relacionada com o participante ' + idParticipant);
            console.log(data.responseText);
        }
    });
}
