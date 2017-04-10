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

var url;

// Invites an user to access a form
$('#grant-access').click(function () {
    var u = document.getElementById("grant-user");
    var username = u.options[u.selectedIndex].text;

    var p = document.getElementById("grant-permission");
    var permissionType = p.options[p.selectedIndex].value;

    $.ajax({
        url: urlToPost,
        type: 'POST',
        data: {
            idForm: formID,
            username: username,
            permissionType: permissionType,
            csrfmiddlewaretoken: csrfToken
        },
        success: function () {
            $('#modal-for-access-granting').modal('hide');
            toastr.success('O utilizador "' + username + '" foi convidado!');
        },
        error: function () {
            $('#modal-for-access-granting').modal('hide');
            toastr.warning('O utilizador "' + username + '" já foi convidado.');
        }
    });
});


// Gets the correct form ID for URL generation
$('#modal-for-link-share').on('show.bs.modal', function (e) {
    var formURL = $(e.relatedTarget).data('form-url'); // get form-url attribute of the clicked element

    $(e.currentTarget).find('#form-url').text(formURL); // populate the paragpraph
});

// Gets the correct form ID for Inviting Users
$('#modal-for-access-granting').on('show.bs.modal', function (e) {
    formID = $(e.relatedTarget).data('form-id');
    var formName = $(e.relatedTarget).data('form-name');

    $(e.currentTarget).find('#invite-title').text('Convidar utilizador para acesso a "' + formName + '"');
});

// Gets the correct form ID for URL generation
$('#modal-for-delete').on('show.bs.modal', function (e) {
    var formName = $(e.relatedTarget).data('form-name');
    url = $(e.relatedTarget).data('form-url');

    $(e.currentTarget).find('#form-message').text('Tem certeza que deseja apagar o questionário "' + formName + '"?'); // populate the paragpraph
});

// Deletes an archived form
$('#delete-form').click(function () {
    location.href = url;
});

// Logouts of the system
$('#system-logout').click(function () {
    location.href = urlLogout;
});

function editForm(id) {

        $.ajax({
            url: urlToEdit,
            type: 'POST',
            data: {
                idForm: id,
                csrfmiddlewaretoken: csrfToken
            },
            success: function () {
                onSuccessEdit = onSuccessEdit.replace('identifier', id);
                window.location.href = onSuccessEdit;
            },
            error: function () {
                toastr.error('Não pode editar formulários que contenham dados de participantes.');
            }
        });
    }