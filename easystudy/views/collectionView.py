from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views import View
from easystudy.models import Form, Permission, ParticipantInForm, ParticipantToken
from django.core.exceptions import ObjectDoesNotExist
from django.http import Http404, HttpResponseServerError

try:
    from BytesIO import BytesIO
except ImportError:
    from io import BytesIO

# ######################################################################## #
# For data collection with attributed participantID
# ######################################################################## #
class DataCollectionForParticipantView(View):
    def get(self, request, idForm, idParticipant):
        try:
            selected_form = Form.objects.get(idForm=idForm)

            participants_in_form = ParticipantInForm.objects.filter(idForm=idForm)

            for i in range(0, len(participants_in_form)):
                if idParticipant == participants_in_form[i].idParticipant:
                    raise Http404(
                        "ERROR: There is already a participant with the ID " + idParticipant + " in the data collection.")

            # check if it data collection is open or if the form is not archived
            if selected_form.statusType == 'C' or selected_form.isArchived == 'Y':
                raise Http404("ERROR: Either the data collection is not open or the form " + idForm + " is archived.")

            else:
                formConfiguration = selected_form.formConfig

                context = {
                    "formConfiguration": formConfiguration,  # sends the form configuration in the get page
                    "idParticipant": idParticipant,
                }

                return render(request, "collection/data_collection_participant.html", context)

        except ObjectDoesNotExist:
            raise Http404("ERROR: There is no form for this data collection.")

    def post(self, request, idForm, idParticipant):
        idParticipant = request.POST["idParticipant"]
        idForm = request.POST["idForm"]
        dataCollection = request.POST["dataCollection"]
        token = request.POST["token"]

        if ParticipantInForm.objects.filter(idParticipant=idParticipant, idForm=idForm):
            return HttpResponseServerError(
                "ERROR: There is already a participant with the ID " + idParticipant + " in the data collection.")

        else:
            p = ParticipantInForm()
            p.idForm = Form.objects.get(idForm=idForm)
            p.idParticipant = idParticipant
            p.dataCollection = dataCollection
            p.save()

            # The participant submited the form: the token for that participant can be deleted.
            pt = ParticipantToken.objects.get(idForm=idForm, idFutureParticipant=idParticipant, token=token)
            pt.delete()

            return HttpResponse("SUCCESS: Form entry successfully saved.")


# ######################################################################## #
# For data collection generation based on form.
# ######################################################################## #
class DataCollectionView(View):
    # serves the json configuration file to the page of the study
    def get(self, request, idForm):
        if not request.session.has_key('username'):  # if the user is not logged in redirects to login page
            return redirect('login')

        else:
            try:
                selectedForm = Form.objects.get(idForm=idForm)

                participantsInForm = ParticipantInForm.objects.filter(idForm=idForm)
                participants = []

                for i in range(0, len(participantsInForm)):
                    idP = participantsInForm[i].idParticipant
                    participants.append(idP)  # list of IDs for integrity check

                # check if it data collection is open or if the form is not archived
                if selectedForm.statusType == 'C' or selectedForm.isArchived == 'Y':
                    return redirect('home')

                else:
                    formConfiguration = selectedForm.formConfig

                    context = {
                        "formConfiguration": formConfiguration,  # sends the form configuration in the get page
                        "participantsIDList": participants,
                    }

                    return render(request, "collection/data_collection.html", context)

            except ObjectDoesNotExist:
                print("Either the entry or form don't exist.")
                raise Http404("There is no form for this data collection.")

    # posts the participants data
    def post(self, request, idForm):
        idParticipant = request.POST.get("idParticipant")
        idForm = request.POST.get("idForm")
        dataCollection = request.POST.get("dataCollection")

        if ParticipantInForm.objects.filter(idParticipant=idParticipant, idForm=idForm):
            response = HttpResponseServerError("The collected data could not be submited.")
        else:
            p = ParticipantInForm()
            p.idForm = Form.objects.get(idForm=idForm)
            p.idParticipant = idParticipant
            p.dataCollection = dataCollection
            p.save()
            response = HttpResponse("Form successfully sent.")

        return response


# ######################################################################## #
# Checks if the token inserted by the participant is correct
# ######################################################################## #
def checkTokenForParticipant(request):
    idForm = request.POST.get("idForm")
    idParticipant = request.POST.get("idParticipant")
    tokenInserted = request.POST["token"]

    try:
        ParticipantToken.objects.get(idForm=idForm, idFutureParticipant=idParticipant, token=tokenInserted)
        return HttpResponse("SUCCESS")

    except ObjectDoesNotExist:
        return HttpResponseServerError("ERROR: The token is not correct.")
