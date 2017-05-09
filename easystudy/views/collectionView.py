from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views import View
from easystudy.models import Form, Permission, ParticipantInForm, ParticipantToken, UserNotification, FormSpecialConfigs
from django.http import HttpResponseServerError
from django.contrib.auth.models import User

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
                    print(
                        "ERROR: There is already a participant with the ID " + idParticipant + " in the data collection.")
                    return HttpResponseServerError(
                        "ERROR: There is already a participant with the ID " + idParticipant + " in the data collection.")

            scaleExplained = 'N'
            trialFormID = "NA"
            specialConfigs = FormSpecialConfigs.objects.filter(idForm=idForm)

            if len(specialConfigs) == 1:
                if specialConfigs[0].idTrialForm == None:
                    trialFormID = "NA"
                else:
                    trialFormID = specialConfigs[0].idTrialForm.idForm
                scaleExplained = specialConfigs[0].scaleExplained

            # check if it data collection is open or if the form is not archived
            if selected_form.statusType == 'C' or selected_form.isArchived == 'Y':
                print("ERROR: Either the data collection is not open or the form " + idForm + " is archived.")
                return HttpResponseServerError("ERROR: Either the data collection is not open or the form " + idForm + " is archived.")

            else:
                formConfiguration = selected_form.formConfig

                context = {
                    "formConfiguration": formConfiguration,  # sends the form configuration in the get page
                    "idParticipant": idParticipant,
                    "trialFormID": trialFormID,
                    "scaleExplained": scaleExplained,
                }

                return render(request, "collection/data_collection_participant.html", context)

        except Exception as e:
            print("ERROR: " + str(e))
            return HttpResponseServerError("ERROR: " + str(e))

    def post(self, request, idForm, idParticipant):
        idParticipant = request.POST["idParticipant"]
        idForm = request.POST["idForm"]
        dataCollection = request.POST["dataCollection"]
        token = request.POST["token"]

        if ParticipantInForm.objects.filter(idParticipant=idParticipant, idForm=idForm):
            print("ERROR: There is already a participant with the ID " + idParticipant + " in the data collection.")
            return HttpResponseServerError(
                "ERROR: There is already a participant with the ID " + idParticipant + " in the data collection.")

        else:
            try:
                p = ParticipantInForm()
                p.idForm = Form.objects.get(idForm=idForm)
                p.idParticipant = idParticipant
                p.dataCollection = dataCollection
                p.save()

                # The participant submited the form: the token for that participant can be deleted.
                pt = ParticipantToken.objects.get(idForm=idForm, idFutureParticipant=idParticipant, token=token)
                pt.delete()

                # Start of push notifications
                try:
                    permission = Permission.objects.filter(idForm=idForm)  # get all permissions for that form
                    form = Form.objects.get(idForm=idForm)

                    for i in range(0, len(permission)):  # adds notification to users in the list of permissions
                        un = UserNotification()
                        un.username = User.objects.get(username=permission[i].username.username)
                        un.message = "O participante " + idParticipant + " submeteu uma resposta remota ao questionário " + idForm + " - «" + form.formName + "»."
                        un.severityLevel = "I"
                        un.save()
                        print("SUCCESS: Notification COLLECTION pushed to user " + permission[i].username.username)

                except Exception as e:
                    print("ERROR: " + str(e))
                    return HttpResponseServerError("ERROR: " + str(e))
                # End of push notifications

                print("SUCCESS: Form entry successfully saved.")
                return HttpResponse("SUCCESS: Form entry successfully saved.")

            except Exception as e:
                print("ERROR: " + str(e))
                return HttpResponseServerError("ERROR: " + str(e))


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

                scaleExplained = 'N'
                trialFormID = "NA"
                specialConfigs = FormSpecialConfigs.objects.filter(idForm=idForm)

                if len(specialConfigs) == 1:
                    if specialConfigs[0].idTrialForm == None:
                        trialFormID = "NA"
                    else:
                        trialFormID = specialConfigs[0].idTrialForm.idForm
                    scaleExplained = specialConfigs[0].scaleExplained

                # check if it data collection is open or if the form is not archived
                if selectedForm.statusType == 'C' or selectedForm.isArchived == 'Y':
                    return redirect('home')

                else:
                    formConfiguration = selectedForm.formConfig

                    context = {
                        "formConfiguration": formConfiguration,  # sends the form configuration in the get page
                        "participantsIDList": participants,
                        "trialFormID": trialFormID,
                        "scaleExplained": scaleExplained,
                    }

                    return render(request, "collection/data_collection.html", context)

            except Exception as e:
                print("ERROR: " + str(e))
                return HttpResponseServerError("ERROR: " + str(e))

    # posts the participants data
    def post(self, request, idForm):
        idParticipant = request.POST.get("idParticipant")
        idForm = request.POST.get("idForm")
        dataCollection = request.POST.get("dataCollection")

        try:
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

        except Exception as e:
            print("ERROR: " + str(e))
            return HttpResponseServerError("ERROR: " + str(e))


# ######################################################################## #
# Checks if the token inserted by the participant is correct.
# ######################################################################## #
def checkTokenForParticipant(request):
    idForm = request.POST.get("idForm")
    idParticipant = request.POST.get("idParticipant")
    tokenInserted = request.POST["token"]

    try:
        ParticipantToken.objects.get(idForm=idForm, idFutureParticipant=idParticipant, token=tokenInserted)
        return HttpResponse("SUCCESS")

    except Exception as e:
        print("ERROR: " + str(e))
        return HttpResponseServerError("ERROR: " + str(e))


# ######################################################################## #
# Generates a trial form for the participant.
# ######################################################################## #
def getTrialForm(request, idFormTrial):

    print(idFormTrial)

    if(idFormTrial == "NA"):
        return HttpResponseServerError("ERROR: The trial form you tried to open is not configured.")

    else:
        try:
            f = Form.objects.get(idForm=idFormTrial)
            formConfig = f.formConfig

            context = {
                "formConfiguration": formConfig,
            }

            return render(request, "collection/trial_data_collection.html", context)

        except Exception as e:
            print("ERROR: " + str(e))
            return HttpResponseServerError("ERROR: " + str(e))
