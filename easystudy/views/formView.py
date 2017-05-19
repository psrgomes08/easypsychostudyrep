from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views import View
from django.contrib.auth.models import User
from easystudy.models import Form, Permission, ParticipantInForm, ParticipantToken
from django.http import HttpResponseServerError
import random
import string

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

            except Exception as e:
                print("ERROR PreviewFormView: " + str(e))
                return HttpResponseServerError("ERROR: " + str(e))

    def post(self, request):
        formConfigPreview = request.POST.get("formConfig")

        # Set a session value
        try:
            request.session['form_config_preview'] = formConfigPreview
            return HttpResponse("SUCCESS: The key form_config_preview was stored in session.")

        except Exception as e:
            print("ERROR PreviewFormView: " + str(e))
            return HttpResponseServerError("ERROR: " + str(e))


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
                print("ERROR editFormRequest: A form with collected data from participants cannot be edited.")
                return HttpResponseServerError("ERROR: A form with collected data from participants cannot be edited.")

            else:
                print("SUCCESS: This form can be edited.")
                return HttpResponse("SUCCESS: This form can be edited.")

        except Exception as e:
            print("ERROR PreviewFormView: " + str(e))
            return HttpResponseServerError("ERROR: " + str(e))


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


            except Exception as e:
                print("ERROR EditFormView: " + str(e))
                return HttpResponseServerError("ERROR: " + str(e))

    def post(self, request, idForm):
        idForm = request.POST["idForm"]
        formName = request.POST["formName"]
        formConfig = request.POST["formConfig"]
        formThumbnail = request.POST["formThumbnail"]

        try:
            p = ParticipantInForm.objects.filter(idForm=idForm)

            if len(p) > 0:
                print("ERROR EditFormView: A form with collected data from participants cannot be edited.")
                return HttpResponseServerError("ERROR: A form with collected data from participants cannot be edited.")

            else:
                f = Form.objects.get(idForm=idForm)
                f.formName = formName
                f.formConfig = formConfig
                f.formThumbnail = formThumbnail
                f.save()

                # Delete the session form preview because it was saved.
                if request.session.has_key('form_config_preview'):
                    del request.session['form_config_preview']

                print("SUCCESS: Form successfully edited.")
                return HttpResponse("SUCCESS: Form successfully edited.")


        except Exception as e:
            print("ERROR EditFormView: " + str(e))
            return HttpResponseServerError("ERROR: " + str(e))


# ######################################################################## #
# For submission of psycho form in database.
# ######################################################################## #
class NewFormView(View):
    def get(self, request):
        if not request.session.has_key('username'):  # if the user is not logged in redirects to login page
            return redirect('login')

        else:
            return render(request, "form/new_form.html", {})

    def post(self, request):
        idForm = request.POST["idForm"]
        formName = request.POST["formName"]
        formConfig = request.POST["formConfig"]
        formThumbnail = request.POST["formThumbnail"]

        try:
            # formConfig = json.loads(formConfig)

            f = Form(idForm=idForm, formName=formName, formConfig=formConfig, formThumbnail=formThumbnail)

            # Checks if there is already a study with that ID
            if Form.objects.filter(idForm=idForm):
                print("ERROR NewFormView: The form could not be submited.")
                return HttpResponseServerError("ERROR: The form could not be submited.")

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

                t = ParticipantToken()
                t.idForm = Form.objects.get(idForm=idForm)
                t.token = id_generator(10)
                t.save()

                # Delete the session form preview because it was saved.
                if request.session.has_key('form_config_preview'):
                    del request.session['form_config_preview']

                print("SUCCESS: Form successfully submited.")
                return HttpResponse("SUCCESS: Form successfully submited.")

        except Exception as e:
            print("ERROR NewFormView: " + str(e))
            return HttpResponseServerError("ERROR: " + str(e))


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


            except Exception as e:
                print("ERROR CloneFormView: " + str(e))
                return HttpResponseServerError("ERROR: " + str(e))

    def post(self, request, idForm):
        idForm = request.POST["idForm"]
        formName = request.POST["formName"]
        formConfig = request.POST["formConfig"]
        formThumbnail = request.POST["formThumbnail"]

        try:
            f = Form(idForm=idForm, formName=formName, formConfig=formConfig, formThumbnail=formThumbnail)

            # Checks if there is already a study with that ID
            if Form.objects.filter(idForm=idForm):
                print("ERROR CloneFormView: The form could not be cloned.")
                return HttpResponseServerError("ERROR: The form could not be cloned.")

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

                t = ParticipantToken()
                t.idForm = Form.objects.get(idForm=idForm)
                t.token = id_generator(10)
                t.save()

                # Delete the session form preview because it was saved.
                if request.session.has_key('form_config_preview'):
                    del request.session['form_config_preview']

                print("SUCCESS: Form successfully cloned.")
                return HttpResponse("SUCCESS: Form successfully cloned.")

        except Exception as e:
            print("ERROR CloneFormView: " + str(e))
            return HttpResponseServerError("ERROR: " + str(e))

# ######################################################################## #
# Generates a random id (auxiliary function).
# ######################################################################## #
def id_generator(size=32, chars=string.ascii_uppercase + string.ascii_lowercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))