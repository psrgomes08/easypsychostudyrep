from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views import View
from django.contrib.auth.models import User
from easystudy.models import Form, Permission, ParticipantInForm, ParticipantToken
from django.core.exceptions import ObjectDoesNotExist
from django.http import Http404, HttpResponseServerError

try:
    from BytesIO import BytesIO
except ImportError:
    from io import BytesIO


# ######################################################################## #
# Gets a preview of a form in the making.
# ######################################################################## #
class PreviewFormView(View):
    def get(self, request):
        if not request.session.has_key('username'):  # if the user is not logged in redirects to login page
            return redirect('login')

        else:
            # Get a session value by its key, raising a KeyError if the key is not present
            try:
                formConfigPreview = request.session['form_config_preview']

                context = {
                    "formConfiguration": formConfigPreview,
                }

                return render(request, "form/preview_form.html", context)

            except KeyError:
                print("The key form_config_preview is not present.")
                return HttpResponseServerError("The preview can not be generated.")

    def post(self, request):
        formConfigPreview = request.POST.get("formConfig")

        # Set a session value
        try:
            request.session['form_config_preview'] = formConfigPreview
            return HttpResponse("Success")

        except KeyError:
            print("The key form_config_preview is not present.")
            return HttpResponseServerError("The preview can not be generated.")


# ######################################################################## #
# Checks if a form can be edited.
# ######################################################################## #
def editFormRequest(request):
    if not request.session.has_key('username'):  # if the user is not logged in redirects to login page
        return redirect('login')

    else:
        idForm = request.POST.get("idForm")

        try:
            p = ParticipantInForm.objects.filter(idForm=idForm)
            if len(p) > 0:
                return HttpResponseServerError("A form with collected data from participants cannot be edited.")

            else:
                return HttpResponse("Success.")

        except ObjectDoesNotExist:
            print("Either the entry or form don't exist.")
            raise Http404("There is no form for this data collection.")


# ######################################################################## #
# For editing a form if it has no participants and after editFormRequest
# ######################################################################## #
class EditFormView(View):
    def get(self, request, idForm):
        if not request.session.has_key('username'):  # if the user is not logged in redirects to login page
            return redirect('login')

        else:
            try:
                f = Form.objects.get(idForm=idForm)
                formConfig = f.formConfig
                formThumbnail = f.formThumbnail

                context = {
                    "formID": idForm,
                    "formConfig": formConfig,
                    "formThumbnail": formThumbnail,
                }

                return render(request, "form/edit_form.html", context)

            except ObjectDoesNotExist:
                print("Either the entry or form don't exist.")
                raise Http404("There is no form for this data collection.")

    def post(self, request, idForm):
        idForm = request.POST["idForm"]
        formName = request.POST["formName"]
        formConfig = request.POST["formConfig"]
        formThumbnail = request.POST["formThumbnail"]

        try:
            p = ParticipantInForm.objects.filter(idForm=idForm)

            if len(p) > 0:
                return HttpResponseServerError("A form with collected data from participants cannot be edited.")

            else:
                f = Form.objects.get(idForm=idForm)
                f.formName = formName
                f.formConfig = formConfig
                f.formThumbnail = formThumbnail
                f.save()
                return HttpResponse("Form successfully edited.")

        except ObjectDoesNotExist:
            print("Either the entry or form don't exist.")
            raise Http404("There is no form for this data collection.")


# ######################################################################## #
# For submission of psycho form in database.
# ######################################################################## #
class NewFormView(View):
    # displays the page
    def get(self, request):
        if not request.session.has_key('username'):  # if the user is not logged in redirects to login page
            return redirect('login')

        else:
            return render(request, "form/new_form.html", {})

    # inserts a new form in the database
    def post(self, request):
        idForm = request.POST["idForm"]
        formName = request.POST["formName"]
        formConfig = request.POST["formConfig"]
        formThumbnail = request.POST["formThumbnail"]

        # formConfig = json.loads(formConfig)

        f = Form(idForm=idForm, formName=formName, formConfig=formConfig, formThumbnail=formThumbnail)

        # Checks if there is already a study with that ID
        if Form.objects.filter(idForm=idForm):
            response = HttpResponseServerError("The form could not be submited.")

        else:
            f.save()
            username = request.session['username']
            p = Permission()
            user = User.objects.get(username=username)
            p.username = user
            idF = Form.objects.get(idForm=idForm)
            p.idForm = idF
            p.permissionType = 'O'  # the creator has owner permission
            p.save()

            # Delete the session form preview because it was saved.
            if request.session.has_key('form_config_preview'):
                del request.session['form_config_preview']

            response = HttpResponse("Form successfully sent.")

        return response


# ######################################################################## #
# For form clonation.
# ######################################################################## #
class CloneFormView(View):
    def get(self, request, idForm):
        if not request.session.has_key('username'):  # if the user is not logged in redirects to login page
            return redirect('login')

        else:
            try:
                f = Form.objects.get(idForm=idForm)
                formConfig = f.formConfig
                formThumbnail = f.formThumbnail

                context = {
                    "formConfig": formConfig,
                    "formThumbnail": formThumbnail,
                }

                return render(request, "form/clone_form.html", context)

            except ObjectDoesNotExist:
                print("Either the entry or form don't exist.")
                raise Http404("There is no form for this data collection.")

    def post(self, request, idForm):
        idForm = request.POST["idForm"]
        formName = request.POST["formName"]
        formConfig = request.POST["formConfig"]
        formThumbnail = request.POST["formThumbnail"]

        # formConfig = json.loads(formConfig)

        f = Form(idForm=idForm, formName=formName, formConfig=formConfig, formThumbnail=formThumbnail)

        # Checks if there is already a study with that ID
        if Form.objects.filter(idForm=idForm):
            response = HttpResponseServerError("The form could not be submited.")

        else:
            f.save()
            username = request.session['username']
            p = Permission()
            user = User.objects.get(username=username)
            p.username = user
            idF = Form.objects.get(idForm=idForm)
            p.idForm = idF
            p.permissionType = 'O'  # the creator has owner permission
            p.save()
            response = HttpResponse("Form successfully sent.")

        return response
