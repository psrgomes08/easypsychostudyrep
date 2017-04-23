/**
 * Edits the form in the database.
 */
function submitEditedForm() {
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