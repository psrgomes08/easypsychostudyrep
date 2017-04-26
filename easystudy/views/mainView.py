import json
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views import View
from django.contrib.auth.models import User
from easystudy.models import Form, Permission, ParticipantInForm, ParticipantToken, UserNotification
from django.core.exceptions import ObjectDoesNotExist
from django.http import Http404, HttpResponseServerError
from django.db import IntegrityError
import xlsxwriter

try:
    from BytesIO import BytesIO
except ImportError:
    from io import BytesIO


# ######################################################################## #
# Checks if a form has participants to download a data collection.
# ######################################################################## #
def downloadDataCollectionRequest(request):
    if not request.session.has_key('username'):  # if the user is not logged in redirects to login page
        return redirect('login')

    else:
        idForm = request.POST.get("idForm")

        try:
            p = ParticipantInForm.objects.filter(idForm=idForm)
            if len(p) == 0:
                print("The selected form has no data collected.")
                return HttpResponseServerError("The selected form has no data collected.")

            else:
                return HttpResponse("Success.")

        except ObjectDoesNotExist:
            print("Either the entry or form don't exist.")
            raise Http404("There is no form for this data collection.")


# ######################################################################## #
# Grants a user access to a form.
# ######################################################################## #
def grantAccess(request):
    if not request.session.has_key('username'):  # if the user is not logged in redirects to login page
        return redirect('login')

    else:
        idForm = request.POST["idForm"]
        username = request.POST["username"]
        permissionType = request.POST["permissionType"]

        try:
            p = Permission()
            user = User.objects.get(username=username)
            p.username = user
            idF = Form.objects.get(idForm=idForm)
            p.idForm = idF
            p.permissionType = permissionType
            p.save()

            # Start of push notification
            un = UserNotification()
            un.username = user
            if permissionType == "R":
                permissionString = "Leitor"
            else:
                permissionString = "Administrador"
            un.message = "Foi-lhe concedida a permissão de " + permissionString + " para o questionário " + idForm + " - «" + idF.formName + "», pelo utilizador " + \
                         request.session['username'] + "."
            un.severityLevel = "I"
            un.save()
            print("SUCCESS: Notification PERMISSION pushed to user " + user.username)
            # End of push notifications

            print("SUCCESS: Permission " + permissionType + "to user " + username + " was granted!")
            return HttpResponse("SUCCESS: Permission " + permissionType + "to user " + username + " was granted!")

        except IntegrityError:
            print(
                "ERROR: The user " + username + " already has the permission " + permissionType + " for the form " + idForm + ".")
            return HttpResponseServerError(
                "ERROR: The user " + username + " already has the permission " + permissionType + " for the form " + idForm + ".")


# ######################################################################## #
# Archives a form.
# ######################################################################## #
def archiveForm(request, idForm):
    if not request.session.has_key('username'):  # if the user is not logged in redirects to login page
        return redirect('login')

    else:
        try:
            selectedForm = Form.objects.get(idForm=idForm)

            # if the status is closed and not archived, archives, otherwise does nothing
            if selectedForm.statusType == 'C' and selectedForm.isArchived == 'N':
                selectedForm.isArchived = 'Y'
                selectedForm.save()

                # Start of push notifications
                try:
                    permission = Permission.objects.filter(idForm=idForm)  # get all permissions for that form

                    for i in range(0, len(permission)):  # adds notification to users in the list of permissions
                        if permission[i].username.username != request.session[
                            'username']:  # avoids adding a notification to the user who performed the action

                            # When archiving a form, all the previous notifications for opening and closing that form are useless.
                            # Therefore they are deleted.
                            existingNotifications = UserNotification.objects.all()
                            for j in range(0, len(existingNotifications)):
                                if idForm in existingNotifications[j].message and "fechadas" in existingNotifications[
                                    j].message:
                                    existingNotifications[j].delete()
                                if idForm in existingNotifications[j].message and "abertas" in existingNotifications[
                                    j].message:
                                    existingNotifications[j].delete()

                            un = UserNotification()
                            un.username = User.objects.get(username=permission[i].username.username)
                            un.message = "O questionário " + idForm + " - «" + selectedForm.formName + "», foi arquivado pelo utilizador " + \
                                         request.session['username'] + "."
                            un.severityLevel = "D"
                            un.save()
                            print("SUCCESS: Notification ARCHIVED pushed to user " + permission[i].username.username)

                except IntegrityError:
                    print("ERROR: There are no permissions associated to the form " + idForm + ".")
                    return HttpResponseServerError(
                        "ERROR: There are no permissions associated to the form " + idForm + ".")
                    # End of push notifications

            return redirect('home')

        except ObjectDoesNotExist:
            print("Either the entry or form don't exist.")
            raise Http404("There is no form with this ID to be archived.")


# ######################################################################## #
# Closes the data collecting of a form.
# ######################################################################## #
def closeDataCollection(request, idForm):
    if not request.session.has_key('username'):  # if the user is not logged in redirects to login page
        return redirect('login')

    else:
        try:
            selectedForm = Form.objects.get(idForm=idForm)

            # if the status is open, it closes, otherwise does nothing
            if selectedForm.statusType == 'O':
                selectedForm.statusType = 'C'
                selectedForm.save()

                # Start of push notifications
                try:
                    permission = Permission.objects.filter(idForm=idForm)  # get all permissions for that form

                    for i in range(0, len(permission)):  # adds notification to users in the list of permissions
                        if permission[i].username.username != request.session['username']:

                            # When closing a form, all the previous notifications for opening that form are useless.
                            # Therefore they are deleted.
                            existingNotifications = UserNotification.objects.all()
                            for j in range(0, len(existingNotifications)):
                                if idForm in existingNotifications[j].message and "abertas" in existingNotifications[
                                    j].message:
                                    existingNotifications[j].delete()

                            un = UserNotification()
                            un.username = User.objects.get(username=permission[i].username.username)
                            un.message = "Foram fechadas as recolhas para o questionário " + idForm + " - «" + selectedForm.formName + "», pelo utilizador " + \
                                         request.session['username'] + "."
                            un.severityLevel = "W"
                            un.save()
                            print("SUCCESS: Notification CLOSED pushed to user " + permission[i].username.username)

                except IntegrityError:
                    print("ERROR: There are no permissions associated to the form " + idForm + ".")
                    return HttpResponseServerError(
                        "ERROR: There are no permissions associated to the form " + idForm + ".")
                    # End of push notifications

            return redirect('home')

        except ObjectDoesNotExist:
            print("Either the entry or form don't exist.")
            raise Http404("There is no form with this ID to be closed.")


# ######################################################################## #
# Opens the data collecting of a form.
# ######################################################################## #
def openDataCollection(request, idForm):
    if not request.session.has_key('username'):  # if the user is not logged in redirects to login page
        return redirect('login')

    else:
        try:
            selectedForm = Form.objects.get(idForm=idForm)

            # if the status is closed and is not archived, it opens, otherwise does nothing
            if selectedForm.statusType == 'C' and selectedForm.isArchived != 'Y':
                selectedForm.statusType = 'O'
                selectedForm.save()

                # Start of push notifications
                try:
                    permission = Permission.objects.filter(idForm=idForm)  # get all permissions for that form

                    for i in range(0, len(permission)):  # adds notification to users in the list of permissions
                        if permission[i].username.username != request.session['username']:

                            # When opening a form, all the previous notifications for closing that form are useless.
                            # Therefore they are deleted.
                            existingNotifications = UserNotification.objects.all()
                            for j in range(0, len(existingNotifications)):
                                if idForm in existingNotifications[j].message and "fechadas" in existingNotifications[
                                    j].message:
                                    existingNotifications[j].delete()

                            un = UserNotification()
                            un.username = User.objects.get(username=permission[i].username.username)
                            un.message = "Foram abertas as recolhas para o questionário " + idForm + " - «" + selectedForm.formName + "», pelo utilizador " + \
                                         request.session['username'] + "."
                            un.severityLevel = "W"
                            un.save()
                            print("SUCCESS: Notification OPEN pushed to user " + permission[i].username.username)

                except IntegrityError:
                    print("ERROR: There are no permissions associated to the form " + idForm + ".")
                    return HttpResponseServerError(
                        "ERROR: There are no permissions associated to the form " + idForm + ".")
                    # End of push notifications

            return redirect('home')

        except ObjectDoesNotExist:
            print("Either the entry or form don't exist.")
            raise Http404("There is no form with this ID to be opened.")


# ######################################################################## #
# For logout of the web app.
# ######################################################################## #
def logout(request):
    try:
        del request.session['username']  # deletes the stored session

    except KeyError:
        print("The key username is not present.")
        return HttpResponseServerError("The logout could not be performed.")

    return redirect('login')  # redirects to the login page


# ######################################################################## #
# For download of a JSON configuration file belonging to a study.
# (NOT BEING USED)
# ######################################################################## #
def downloadJSON(request, idForm):
    if not request.session.has_key('username'):  # if the user is not logged in redirects to login page
        return redirect('login')

    else:
        filename = idForm + '_config' + '.txt'

        try:
            selectedForm = Form.objects.get(idForm=idForm)
            formConfig = selectedForm.formConfig
            response = HttpResponse(formConfig, content_type='application/force-download')
            response['Content-Type'] = 'application/force-download'
            response['Content-Disposition'] = "attachment; filename=" + filename
            return response

        except ObjectDoesNotExist:
            print("Either the entry or form don't exist.")
            raise Http404("There is no form with this ID therefore no configuration file to be downloaded.")


# ######################################################################## #
# Deletes a selected form in the home page.
# ######################################################################## #
def deleteStudyForm(request, idForm):
    if not request.session.has_key('username'):  # if the user is not logged in redirects to login page
        return redirect('login')

    else:
        try:
            selectedForm = Form.objects.get(idForm=idForm)
            formName = selectedForm.formName  # to be used in notifications

            # Start of push notifications
            try:
                permission = Permission.objects.filter(idForm=idForm)  # get all permissions for that form

                for i in range(0, len(permission)):  # adds notification to users in the list of permissions
                    if permission[i].username.username != request.session['username']:

                        # When deleting a form, all the previous notifications for that form are useless.
                        # Therefore they are deleted.
                        existingNotifications = UserNotification.objects.all()
                        for j in range(0, len(existingNotifications)):
                            if idForm in existingNotifications[j].message:
                                existingNotifications[j].delete()

                        un = UserNotification()
                        un.username = User.objects.get(username=permission[i].username.username)
                        un.message = "O questionário " + idForm + " - «" + formName + "», foi apagado do sistema pelo utilizador " + \
                                     request.session['username'] + "."
                        un.severityLevel = "D"
                        un.save()
                        print("SUCCESS: Notification DELETE pushed to user " + permission[i].username.username)

            except IntegrityError:
                print("ERROR: There are no permissions associated to the form " + idForm + ".")
                return HttpResponseServerError(
                    "ERROR: There are no permissions associated to the form " + idForm + ".")
                # End of push notifications

            selectedForm.delete()

            return redirect('home')

        except ObjectDoesNotExist:
            print("Either the entry or form don't exist.")
            raise Http404("There is no form with this ID to be deleted.")


# ######################################################################## #
# For download of an excel file containing the participants collected data
# ######################################################################## #
def downloadParticipantsDataCollectedData(request, idForm):
    if not request.session.has_key('username'):  # if the user is not logged in redirects to login page
        return redirect('login')

    else:
        try:
            f = Form.objects.get(idForm=idForm)
            fConfig = json.loads(f.formConfig)

            p = ParticipantInForm.objects.filter(idForm=idForm)
            pConfig = []

            # loads info of each participant into an array of dictionaries
            for i in range(0, len(p)):
                idP = json.loads(p[i].dataCollection)
                pConfig.append(idP)

            # create a workbook in memory
            output = BytesIO()

            # desired filename
            formName = f.formName
            formName = formName.replace(",", " ").replace(".", " ").replace(" ", "_")
            filename = formName + '_dados_recolhidos' + '.xlsx'

            # Create a workbook and add a worksheet.
            workbook = xlsxwriter.Workbook(output)
            worksheet = workbook.add_worksheet("Dados Recolhidos")
            worksheet2 = workbook.add_worksheet("Estímulos")

            # Format to be applied to the headers
            hFormat = workbook.add_format()
            hFormat.set_bold()
            hFormat.set_text_wrap()
            hFormat.set_align('center')

            # Format to be applied to the order field
            oFormat = workbook.add_format()
            oFormat.set_bold()
            oFormat.set_text_wrap()
            oFormat.set_align('center')
            oFormat.set_bg_color('#17202A')
            oFormat.set_color('#FFFFFF')

            # Format to be applied to the participants
            pFormat = workbook.add_format()
            pFormat.set_text_wrap()
            pFormat.set_align('center')

            col = 0
            row = 0

            col_w2 = 0
            row_w2 = 0

            # Add headers
            worksheet.write_string(row, col, "Timestamp Recolha", hFormat)
            worksheet.set_column(col, col, 20)  # Width of column set to 20.
            col += 1

            worksheet.write_string(row, col, "ID Participante", hFormat)
            worksheet.set_column(col, col, 15)  # Width of column set to 20.
            col += 1

            worksheet2.write_string(row_w2, col_w2, "ID Participante", hFormat)
            worksheet2.set_column(col_w2, col_w2, 15)  # Width of column set to 20.
            col_w2 += 1

            presentSteps = []

            for s in range(0, len(fConfig['passos'])):
                step = fConfig['passos'][s]
                presentSteps.append(step['nPasso'])

                if 'descricaoPasso' not in step:
                    worksheet.write_string(row, col, "Ordem Tarefa", oFormat)
                    worksheet.set_column(col, col, 10)  # Width of column set to 20.
                    col += 1

                if 'nomeDoEstimuloVideo' in step:
                    worksheet.write_string(row, col, "Timestamp Estímulo", hFormat)
                    worksheet.set_column(col, col, 20)  # Width of column set to 20.
                    col += 1

                    worksheet.write_string(row, col, "Estímulo", hFormat)
                    worksheet.set_column(col, col, 20)  # Width of column set to 20.
                    col += 1

                    worksheet2.write_string(row_w2, col_w2, "Estímulo", oFormat)
                    worksheet2.set_column(col_w2, col_w2, 20)  # Width of column set to 20.
                    col_w2 += 1

                if 'nomeDoEstimulo' in step:
                    worksheet.write_string(row, col, "Timestamp Estímulo", hFormat)
                    worksheet.set_column(col, col, 20)  # Width of column set to 20.
                    col += 1

                    worksheet.write_string(row, col, "Estímulo", hFormat)
                    worksheet.set_column(col, col, 20)  # Width of column set to 20.
                    col += 1

                    worksheet2.write_string(row_w2, col_w2, "Estímulo", oFormat)
                    worksheet2.set_column(col_w2, col_w2, 20)  # Width of column set to 20.
                    col_w2 += 1

                if 'escalasSAM' in step and len(step['escalasSAM']) > 0:
                    worksheet.write_string(row, col, "Timestamp Escalas", hFormat)
                    worksheet.set_column(col, col, 20)  # Width of column set to 20.
                    col += 1

                    for e in range(0, len(step['escalasSAM'])):
                        worksheet.write_string(row, col, step['escalasSAM'][e], hFormat)
                        worksheet.set_column(col, col, 10)  # Width of column set to 20.
                        col += 1

                        worksheet2.write_string(row_w2, col_w2, step['escalasSAM'][e], oFormat)
                        worksheet2.set_column(col_w2, col_w2, 10)  # Width of column set to 20.
                        col_w2 += 1

                if 'questoes' in step:
                    worksheet.write_string(row, col, "Timestamp Questões", hFormat)
                    worksheet.set_column(col, col, 20)  # Width of column set to 20.
                    col += 1

                    for q in range(0, len(step['questoes'])):
                        worksheet.write_string(row, col, step['questoes'][q], hFormat)
                        worksheet.set_column(col, col, 30)  # Width of column set to 20.
                        col += 1

            # Headers finished

            # Add information from participant
            row = 1
            col = 0

            row_w2 = 1
            col_w2 = 0

            for i in range(0, len(pConfig)):
                worksheet.write_string(row, col, pConfig[i]['timestampRecolha'], pFormat)
                col += 1

                worksheet.write_string(row, col, pConfig[i]['idParticipante'], pFormat)
                col += 1

                worksheet2.write_string(row_w2, col_w2, pConfig[i]['idParticipante'], pFormat)
                col_w2 += 1

                collection = pConfig[i]['colheita']

                order = []
                for o in range(0, len(collection)):
                    order.append(collection[o]['nPasso'])

                for z in range(0, len(presentSteps)):

                    for j in range(0, len(collection)):

                        if collection[j]['nPasso'] == presentSteps[z]:
                            nOrder = order.index(collection[j]['nPasso']) + 1  # order in which appeared

                            worksheet.write_string(row, col, str(nOrder), oFormat)  # order
                            col += 1

                            if 'nomeDoEstimuloVideo' in collection[j]:
                                worksheet.write_string(row, col, collection[j]['timestampEstimuloVideo'], pFormat)
                                col += 1

                                worksheet.write_string(row, col, collection[j]['nomeDoEstimuloVideo'], pFormat)
                                col += 1

                                worksheet2.write_string(row_w2, col_w2, collection[j]['nomeDoEstimuloVideo'], oFormat)
                                col_w2 += 1

                            if 'nomeDoEstimulo' in collection[j]:
                                worksheet.write_string(row, col, collection[j]['timestampEstimulo'], pFormat)
                                col += 1

                                worksheet.write_string(row, col, collection[j]['nomeDoEstimulo'], pFormat)
                                col += 1

                                worksheet2.write_string(row_w2, col_w2, collection[j]['nomeDoEstimulo'], oFormat)
                                col_w2 += 1

                            if 'colheitaEscalas' in collection[j]:
                                worksheet.write_string(row, col, collection[j]['timestampEscalas'], pFormat)
                                col += 1

                                if 'alerta' in collection[j]['colheitaEscalas']:
                                    worksheet.write_string(row, col, collection[j]['colheitaEscalas']['alerta'],
                                                           pFormat)
                                    col += 1

                                    worksheet2.write_string(row_w2, col_w2, collection[j]['colheitaEscalas']['alerta'],
                                                            pFormat)
                                    col_w2 += 1

                                if 'valencia' in collection[j]['colheitaEscalas']:
                                    worksheet.write_string(row, col, collection[j]['colheitaEscalas']['valencia'],
                                                           pFormat)
                                    col += 1

                                    worksheet2.write_string(row_w2, col_w2,
                                                            collection[j]['colheitaEscalas']['valencia'],
                                                            pFormat)
                                    col_w2 += 1

                                if 'dominancia' in collection[j]['colheitaEscalas']:
                                    worksheet.write_string(row, col, collection[j]['colheitaEscalas']['dominancia'],
                                                           pFormat)
                                    col += 1

                                    worksheet2.write_string(row_w2, col_w2,
                                                            collection[j]['colheitaEscalas']['dominancia'],
                                                            pFormat)
                                    col_w2 += 1

                            if 'colheitaQuestoes' in collection[j]:
                                arrayQuestoes = collection[j]['colheitaQuestoes']
                                worksheet.write_string(row, col, collection[j]['timestampQuestoes'], pFormat)
                                col += 1

                                for k in range(0, len(arrayQuestoes)):
                                    worksheet.write_string(row, col, arrayQuestoes[k], pFormat)
                                    col += 1

                col = 0
                row += 1

                col_w2 = 0
                row_w2 += 1

            # endfor

            workbook.close()

            # construct response
            output.seek(0)
            response = HttpResponse(output.read(), content_type="application/vnd.ms-excel")
            response['Content-Disposition'] = "attachment; filename=" + filename

            return response

        except ObjectDoesNotExist:
            print("Either the entry or form don't exist.")
            raise Http404("There is no form for this data collection.")


# ######################################################################## #
# For the main page
# ######################################################################## #
class HomeView(View):
    def get(self, request):
        if not request.session.has_key('username'):  # if the user is not logged in redirects to login page
            return redirect('login')

        else:
            user = request.session['username']
            ownedFormsClosedList = []
            ownedFormsOpenList = []
            sharedFormsClosedList = []
            sharedFormsOpenList = []
            ownedArchivedForms = []
            sharedArchivedForms = []
            #userNotifications = []

            #existingNotifications = UserNotification.objects.filter(username__username=user)
            #for k in range(0, len(existingNotifications)):
            #    userNotifications.append(existingNotifications[k])

            pO = Permission.objects.filter(username__username=user).filter(permissionType='O').select_related()

            for i in range(0, len(pO)):
                if pO[i].idForm.isArchived == 'Y':  # if is archived
                    ownedArchivedForms.append(pO[i])
                else:  # if not archived
                    if pO[i].permissionType == 'O':  # owner
                        if pO[i].idForm.statusType == 'C':  # closed
                            ownedFormsClosedList.append(pO[i])
                        else:
                            ownedFormsOpenList.append(pO[i])  # open

            pG = Permission.objects.filter(username__username=user).filter(permissionType='R').select_related()

            for j in range(0, len(pG)):
                if pG[j].idForm.isArchived == 'Y':
                    sharedArchivedForms.append(pG[j])
                else:
                    if pG[j].permissionType == 'R':
                        if pG[j].idForm.statusType == 'C':  # closed
                            sharedFormsClosedList.append(pG[j])
                        else:
                            sharedFormsOpenList.append(pG[j])  # open

            # to display usernames in access granting
            usersList = User.objects.exclude(username=user)

            context = {
                "username": user,
                "ownedFormsClosedList": ownedFormsClosedList,
                "ownedFormsOpenList": ownedFormsOpenList,
                "sharedFormsClosedList": sharedFormsClosedList,
                "sharedFormsOpenList": sharedFormsOpenList,
                "ownedArchivedForms": ownedArchivedForms,
                "sharedArchivedForms": sharedArchivedForms,
                "usersList": usersList,
                # "userNotifications": userNotifications,
                #"userNotificationsNumber": len(userNotifications)
            }

            return render(request, "main/home.html", context)


# ######################################################################## #
# Verifies if an ID was already given to a participant
# ######################################################################## #
def checkParticipantID(request):
    if not request.session.has_key('username'):  # if the user is not logged in redirects to login page
        return redirect('login')

    else:
        idForm = request.POST.get("idForm")
        idFutureParticipant = request.POST.get("participantID")
        definedPass = request.POST.get("token")

        try:
            p = ParticipantInForm.objects.get(idForm=idForm, idParticipant=idFutureParticipant)

            if p.idParticipant == idFutureParticipant:  # checks if there is already a participant with this ID in the form
                return HttpResponseServerError("ERROR_1")

        except ObjectDoesNotExist:  # if the ID was not used yet

            try:
                pt = ParticipantToken()
                pt.idForm = Form.objects.get(idForm=idForm)
                pt.idFutureParticipant = idFutureParticipant  # the ID is not yet submited in the ParticipantInForm table
                pt.token = definedPass
                pt.save()
                return HttpResponse("SUCCESS: The token for participant " + idFutureParticipant + " was created.")

            except ObjectDoesNotExist:
                return HttpResponseServerError("ERROR_2")

            except IntegrityError:
                pts = ParticipantToken.objects.get(idForm=idForm, idFutureParticipant=idFutureParticipant)
                return HttpResponseServerError(pts.token)


# ######################################################################## #
# Deletes all the notifications of a user
# ######################################################################## #
def deleteNotifications(request):
    if not request.session.has_key('username'):  # if the user is not logged in redirects to login page
        return redirect('login')

    else:
        try:
            user = request.session['username']
            existingNotifications = UserNotification.objects.filter(username__username=user)
            for i in range(0, len(existingNotifications)):
                existingNotifications[i].delete()

            print("SUCCESS: The notifications for user " + user + " were deleted.")
            return HttpResponse("SUCCESS: The notifications for user " + user + " were deleted.")

        except KeyError:
            print("ERROR: There is no username " + user + ".")
            return Http404("ERROR: There is no username " + user + ".")
        except ObjectDoesNotExist:
            print("ERROR: It was not possible to delete the notifications for user " + user + ".")
            return HttpResponseServerError(
                "ERROR: It was not possible to delete the notifications for user " + user + ".")


# ######################################################################## #
# Gets all the notifications of a user
# ######################################################################## #
def getNotifications(request):
    if not request.session.has_key('username'):  # if the user is not logged in redirects to login page
        return redirect('login')

    else:
        userNotifications = []

        try:
            user = request.session['username']
            existingNotifications = UserNotification.objects.filter(username__username=user)
            for k in range(0, len(existingNotifications)):
                userNotifications.append([existingNotifications[k].message, existingNotifications[k].severityLevel])

            return HttpResponse(json.dumps(userNotifications), content_type="application/json")

        except KeyError:
            print("ERROR: There is no username " + user + ".")
            return Http404("ERROR: There is no username " + user + ".")
        except ObjectDoesNotExist:
            print("ERROR: It was not possible to get the notifications for user " + user + ".")
            return HttpResponseServerError(
                "ERROR: It was not possible to get the notifications for user " + user + ".")


# ######################################################################## #
# Gets the number of notifications of a user
# ######################################################################## #
def getNNotifications(request):
    if not request.session.has_key('username'):  # if the user is not logged in redirects to login page
        return redirect('login')

    else:
        try:
            user = request.session['username']
            existingNotifications = UserNotification.objects.filter(username__username=user)

            return HttpResponse(json.dumps(len(existingNotifications)), content_type="application/json")

        except KeyError:
            print("ERROR: There is no username " + user + ".")
            return Http404("ERROR: There is no username " + user + ".")
        except ObjectDoesNotExist:
            print("ERROR: It was not possible to get the notifications for user " + user + ".")
            return HttpResponseServerError(
                "ERROR: It was not possible to get the notifications for user " + user + ".")
