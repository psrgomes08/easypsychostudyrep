/**
 * Edits the form in the database.
 */
function submitEditedForm() {
    var res = verifyStringFields();

    if (res == true) {
        $('#modal-for-edits').modal({
            backdrop: 'static',
            keyboard: false
        });
        $('#modal-for-edits').modal('show');

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
                $('#modal-for-edits').modal('hide');
            }
        });
    }
}