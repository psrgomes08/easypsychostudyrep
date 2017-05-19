import json
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views import View
from django.contrib.auth.models import User
from easystudy.models import Form, Permission, ParticipantInForm, ParticipantToken, UserNotification, FormSpecialConfigs
from django.core.exceptions import ObjectDoesNotExist
from django.http import Http404, HttpResponseServerError
from django.db import IntegrityError
import xlsxwriter
import string
import random
import urllib.parse
import math
import statistics

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
                print("ERROR downloadDataCollectionRequest: No data collected in form " + idForm + ".")
                return HttpResponseServerError("ERROR: No data collected in form " + idForm + ".")

            else:
                print("SUCCESS: The form " + idForm + " has data to be collected.")
                return HttpResponse("SUCCESS: The form " + idForm + " has data to be collected.")

        except Exception as e:
            print("ERROR downloadDataCollectionRequest: " + str(e))
            return HttpResponseServerError("ERROR: " + str(e))


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

        previousAccessToForm = False

        try:
            f = Form.objects.get(idForm=idForm)
            user = User.objects.get(username=username)

            p = Permission.objects.filter(username=user, idForm=idForm)

            # Start of Permission handling
            if len(p) == 1:  # already has access to form
                previousAccessToForm = True

                if p[0].permissionType == 'O':  # permission Owner can not be downgraded
                    if permissionType == 'O' or permissionType == 'R':
                        print(
                            "ERROR grantAccess: The user " + username + " already has Owner permission for the form " + idForm + ". This permission can not be altered.")
                        return HttpResponseServerError(
                            "O utilizador " + username + " já possui permissões de Administrador para o questionário \"" + f.formName + "\" que não podem ser alteradas.")

                else:  # p[0].permissionType == 'R'
                    if permissionType == 'O':
                        # upgrade permission
                        p[0].permissionType = 'O'
                        p[0].save()

                        # PUSH NOTIFICATION
                        message = "A sua permissão para o questionário \"" + f.formName + "\", foi subida para Administrador pelo utilizador " + \
                                  request.session['username'] + "."
                        pushNotification(username, idForm, message, 'S')

                        print(
                            "SUCCESS: The user " + username + " now has Owner permission for the form " + idForm + ".")
                        return HttpResponse(
                            "O utilizador " + username + " tem agora permissões de Administrador para o questionário \"" + f.formName + "\".")

                    else:  # permissionType == 'R'
                        print(
                            "ERROR grantAccess: The user " + username + " already has Reader permission for the form " + idForm + ".")
                        return HttpResponseServerError(
                            "O utilizador " + username + " já possui permissões de Leitor para o questionário \"" + f.formName + "\".")

            if len(p) == 0:  # does not have access to form
                previousAccessToForm = False

                newP = Permission()
                newP.username = user
                newP.idForm = f
                newP.permissionType = permissionType
                newP.save()  # grant permission

                # PUSH NOTIFICATION
                if permissionType == 'O':
                    message = "Foi-lhe concedida a permissão de Administrador para o questionário \"" + f.formName + "\", pelo utilizador " + \
                              request.session['username'] + "."
                    pushNotification(username, idForm, message, 'S')
                else:
                    message = "Foi-lhe concedida a permissão de Leitor para o questionário \"" + f.formName + "\", pelo utilizador " + \
                              request.session['username'] + "."
                    pushNotification(username, idForm, message, 'S')

            # End of Permission handling

            # Start of Trial Permission handling
            fsc = FormSpecialConfigs.objects.filter(idForm=idForm)

            if len(fsc) == 0:  # does not have a trial form associated - END
                print("SUCCESS: The permission was granted and this form has no trial form associated with it.")
                # return HttpResponse("SUCCESS_2: The permission was granted and this form has no trial form associated with it.")
                if permissionType == 'R':
                    return HttpResponse(
                        "Foi concedida a permissão de Leitor ao utilizador " + username + " para o questionário \"" + f.formName + "\".")
                else:
                    return HttpResponse(
                        "Foi concedida a permissão de Administrador ao utilizador " + username + " para o questionário \"" + f.formName + "\".")

            if len(fsc) == 1:  # has trial
                idT = fsc[0].idTrialForm.idForm  # id of the trial form
                idTN = fsc[0].idTrialForm.formName  # name of the trial form
                pForT = Permission.objects.filter(username=user,
                                                  idForm=idT)  # to check if user already can access the trial form

                if len(pForT) == 1:  # already can access the trial form - END

                    if not previousAccessToForm:  # user did not have previous access to form
                        # PUSH NOTIFICATION
                        message = "O questionário \"" + idTN + "\" ao qual já tem acesso, foi associado como questionário de treino de \"" + f.formName + "\"."
                        pushNotification(username, idForm, message, 'I')

                        print(
                            "SUCCESS: The permission for access to the form " + idForm + " was granted and the user already has access to the trial form " + idT + ".")
                        if permissionType == 'R':
                            return HttpResponse(
                                "Foi concedida a permissão de Leitor ao utilizador " + username + " para o questionário \"" + f.formName + "\" e este já possui permissões para o questionário de treino associado.")
                        else:
                            return HttpResponse(
                                "Foi concedida a permissão de Administrador ao utilizador " + username + " para o questionário \"" + f.formName + "\" e este já possui permissões para o questionário de treino associado.")

                if len(pForT) == 0:  # does not have permissions for the trial form
                    if not previousAccessToForm:
                        newP = Permission()
                        newP.username = user
                        newP.idForm = Form.objects.get(idForm=idT)
                        newP.permissionType = 'R'
                        newP.save()  # grant Reader access to trial form

                        # PUSH NOTIFICATION
                        message = "O questionário \"" + idTN + "\" foi associado como questionário de treino de \"" + f.formName + "\", ao qual lhe foi dado acesso como Leitor pelo utilizador " + \
                                  request.session['username'] + "."
                        pushNotification(username, idForm, message, 'I')

                        print("SUCCESS: The permission for the trial form " + idT + " was granted to the user.")
                        # return HttpResponse("SUCCESS_4: The permission for the trial form " + idT + " was granted to the user.")
                        if permissionType == 'R':
                            return HttpResponse(
                                "Foi concedida a permissão de Leitor ao utilizador " + username + " para o questionário \"" + f.formName + "\" e a permissão de Leitor para o respetivo questionário de treino associado.")
                        else:
                            return HttpResponse(
                                "Foi concedida a permissão de Administrador ao utilizador " + username + " para o questionário \"" + f.formName + "\" e a permissão de Leitor para o respetivo questionário de treino associado.")

                            # End of Trial Permission handling

        except Exception as e:
            print("ERROR grantAccess: " + str(e))
            return HttpResponseServerError(
                "Ocorreu um erro. Por favor tente novamente ou contacte o administrador do sistema.")


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
                            existingNotifications = UserNotification.objects.filter(idForm=idForm)
                            for j in range(0, len(existingNotifications)):
                                if "fechadas" in existingNotifications[j].message:
                                    existingNotifications[j].delete()
                                if "abertas" in existingNotifications[j].message:
                                    existingNotifications[j].delete()

                            message = "O questionário \"" + selectedForm.formName + "\", foi arquivado pelo utilizador " + \
                                      request.session['username'] + "."
                            pushNotification(permission[i].username.username, idForm, message, 'D')

                except Exception as e:
                    print("ERROR archiveForm: " + str(e))
                    return HttpResponseServerError("ERROR: " + str(e))
                    # End of push notifications

            return redirect('home')

        except Exception as e:
            print("ERROR archiveForm: " + str(e))
            return HttpResponseServerError("ERROR: " + str(e))


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
                            existingNotifications = UserNotification.objects.filter(idForm=idForm)
                            for j in range(0, len(existingNotifications)):
                                if "abertas" in existingNotifications[j].message:
                                    existingNotifications[j].delete()

                            message = "Foram fechadas as recolhas para o questionário \"" + selectedForm.formName + "\", pelo utilizador " + \
                                      request.session['username'] + "."
                            pushNotification(permission[i].username.username, idForm, message, 'W')

                except Exception as e:
                    print("ERROR closeDataCollection: " + str(e))
                    return HttpResponseServerError("ERROR: " + str(e))
                    # End of push notifications

            return redirect('home')

        except Exception as e:
            print("ERROR closeDataCollection: " + str(e))
            raise HttpResponse("ERROR: " + str(e))


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
                            existingNotifications = UserNotification.objects.filter(idForm=idForm)
                            for j in range(0, len(existingNotifications)):
                                if "fechadas" in existingNotifications[j].message:
                                    existingNotifications[j].delete()

                            message = "Foram abertas as recolhas para o questionário \"" + selectedForm.formName + "\", pelo utilizador " + \
                                      request.session['username'] + "."
                            pushNotification(permission[i].username.username, idForm, message, 'W')

                except Exception as e:
                    print("ERROR openDataCollection: " + str(e))
                    return HttpResponseServerError("ERROR: " + str(e))
                    # End of push notifications

            return redirect('home')

        except Exception as e:
            print("ERROR openDataCollection: " + str(e))
            return HttpResponseServerError("ERROR: " + str(e))


# ######################################################################## #
# For logout of the web app.
# ######################################################################## #
def logout(request):
    try:
        del request.session['username']  # deletes the stored session

    except Exception as e:
        print("ERROR openDataCollection: " + str(e))
        return HttpResponseServerError("ERROR: " + str(e))

    return redirect('login')  # redirects to the login page


# ######################################################################## #
# For download of a JSON configuration file belonging to a study.
# ######################################################################## #
def downloadJSON(request, idForm):
    if not request.session.has_key('username'):  # if the user is not logged in redirects to login page
        return redirect('login')

    else:
        configArray = []

        try:
            selectedForm = Form.objects.get(idForm=idForm)
            formConfig = selectedForm.formConfig
            formThumb = selectedForm.formThumbnail

            formName = selectedForm.formName
            formName = formName.replace(" ", "_")
            formName = urllib.parse.quote(formName)  # parses ascii characters

            filename = formName + '_config' + '.psyconfig'

            configArray.append(formThumb)
            configArray.append(formConfig)

            pF = ParticipantInForm.objects.filter(idForm=idForm)

            for i in range(0, len(pF)):
                configArray.append(pF[i].dataCollection)

            configJson = json.dumps(configArray)

            response = HttpResponse(configJson, content_type='application/force-download')
            response['Content-Type'] = 'application/force-download'
            response['Content-Disposition'] = "attachment; filename=" + filename

            print("SUCCESS: JSON for form " + idForm + " successfully downloaded.")
            return response

        except Exception as e:
            print("ERROR downloadJSON: " + str(e))
            raise Http404("ERROR: " + str(e))


# ######################################################################## #
# For upload of a JSON configuration file.
# ######################################################################## #
def uploadJSON(request):
    if not request.session.has_key('username'):
        return redirect('login')

    else:
        changedID = False  # aux variable

        uploadedFormConfig = request.POST.get("uploadedFormConfig")

        aux = json.loads(uploadedFormConfig)

        # aux positions explained:
        # Position 0: thumbnail
        # Position 1: formConfig
        # Position 2 - n: participantConfig

        if len(aux) == 0:
            return HttpResponseServerError("ERROR uploadJSON: The file length is 0.")

        formThumbnail = aux[0]

        for i in range(1, len(aux)):
            config = json.loads(aux[i])

            # formConfig:
            if i == 1:
                idForm = config['id']
                formName = config['nome']
                formConfig = json.dumps(config)

                try:
                    fAux = Form.objects.filter(idForm=idForm)

                    if len(fAux) == 0:  # checks if there is not a form with the id of the form trying to be uploaded
                        f = Form(idForm=idForm, formName=formName, formConfig=formConfig, formThumbnail=formThumbnail)
                        f.save()

                        p = Permission(username=User.objects.get(username=request.session['username']),
                                       idForm=Form.objects.get(idForm=idForm), permissionType='O')
                        p.save()

                    else:  # there is already a form with that ID
                        size = len(fAux)
                        newID = ""
                        while size != 0:  # generates a random id and checks if it exists
                            newID = id_generator()
                            fAux = Form.objects.filter(idForm=newID)
                            size = len(fAux)

                        config['id'] = newID
                        changedID = True
                        idForm = config['id']
                        formName = config['nome']
                        formConfig = json.dumps(config)
                        f = Form(idForm=idForm, formName=formName, formConfig=formConfig, formThumbnail=formThumbnail)
                        f.save()

                        p = Permission(username=User.objects.get(username=request.session['username']),
                                       idForm=Form.objects.get(idForm=idForm), permissionType='O')
                        p.save()

                except Exception as e:
                    print("ERROR uploadJSON: " + str(e))
                    return HttpResponseServerError("ERROR: " + str(e))

            # participantConfig
            else:
                if changedID:
                    config['id'] = newID

                idForm = config['id']
                idParticipant = config['idParticipante']
                dataCollection = json.dumps(config)

                try:
                    p = ParticipantInForm(idForm=Form.objects.get(idForm=idForm), idParticipant=idParticipant,
                                          dataCollection=dataCollection)
                    p.save()

                except Exception as e:
                    print("ERROR uploadJSON: " + str(e))
                    return HttpResponseServerError("ERROR: " + str(e))

        print("SUCCESS: Form uploaded successfully.")
        return HttpResponse("SUCCESS: Form uploaded successfully.")


# ######################################################################## #
# Generates a random id (auxiliary function).
# (Used in uploadJSON).
# ######################################################################## #
def id_generator(size=32, chars=string.ascii_uppercase + string.ascii_lowercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))


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
                    if permission[i].username.username != request.session[
                        'username']:  # avoids adding a notification to the user who performed the action

                        existingNotifications = UserNotification.objects.filter(idForm=idForm)
                        for j in range(0, len(existingNotifications)):
                            existingNotifications[
                                j].delete()  # when the form is deleted, all previous notifications are useless, even if not read

                        message = "O questionário \"" + formName + "\", foi apagado do sistema pelo utilizador " + \
                                  request.session['username'] + "."
                        pushNotification(permission[i].username.username, idForm, message, 'D')

            except Exception as e:
                print("ERROR deleteStudyForm: " + str(e))
                return HttpResponseServerError("ERROR: " + str(e))
                # End of push notifications

            selectedForm.delete()

            return redirect('home')

        except Exception as e:
            print("ERROR deleteStudyForm: " + str(e))
            return HttpResponseServerError("ERROR: " + str(e))


# ######################################################################## #
# For download of an excel file containing the participants collected data.
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
            formName = urllib.parse.quote(formName)  # parses ascii characters

            filename = formName + '_dados_recolhidos' + '.xlsx'

            # Create a workbook and add a worksheet.
            workbook = xlsxwriter.Workbook(output)
            worksheet = workbook.add_worksheet("Dados Recolhidos")

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

            ### BEGINING OF Worksheet generation for variables:
            scalesInForm = []
            v_col = 0
            v_row = 0
            a_col = 0
            a_row = 0
            d_col = 0
            d_row = 0
            worksheetValence = workbook.add_worksheet("Valência")
            worksheetArousal = workbook.add_worksheet("Alerta")
            worksheetDominance = workbook.add_worksheet("Dominância")

            # finds what are the scales in form
            for s in range(0, len(fConfig['passos'])):
                step = fConfig['passos'][s]
                if 'escalasSAM' in step and len(step['escalasSAM']) > 0:
                    for e in range(0, len(step['escalasSAM'])):
                        if step['escalasSAM'][e] == 'Valência' and 'Valência' not in scalesInForm:
                            scalesInForm.append('Valência')
                        if step['escalasSAM'][e] == 'Alerta' and 'Alerta' not in scalesInForm:
                            scalesInForm.append('Alerta')
                        if step['escalasSAM'][e] == 'Dominância' and 'Dominância' not in scalesInForm:
                            scalesInForm.append('Dominância')

            # print(scalesInForm)

            if 'Valência' in scalesInForm:
                worksheetValence.write_string(v_row, v_col, "ID Participante", hFormat)
                worksheetValence.set_column(v_col, v_col, 20)

                v_row = 1
                for i in range(0, len(pConfig)):
                    worksheetValence.write_string(v_row, v_col, pConfig[i]['idParticipante'], pFormat)
                    v_row += 1

                v_row = 0
                v_col = 1

            if 'Alerta' in scalesInForm:
                worksheetArousal.write_string(a_row, a_col, "ID Participante", hFormat)
                worksheetArousal.set_column(a_col, a_col, 20)

                a_row = 1
                for i in range(0, len(pConfig)):
                    worksheetArousal.write_string(a_row, a_col, pConfig[i]['idParticipante'], pFormat)
                    a_row += 1

                a_row = 0
                a_col = 1

            if 'Dominância' in scalesInForm:
                worksheetDominance.write_string(d_row, d_col, "ID Participante", hFormat)
                worksheetDominance.set_column(d_col, d_col, 20)

                d_row = 1
                for i in range(0, len(pConfig)):
                    worksheetDominance.write_string(d_row, d_col, pConfig[i]['idParticipante'], pFormat)
                    d_row += 1

                d_row = 0
                d_col = 1

            ### END OF Worksheet generation for variables

            #### BEGINING OF Worksheet generation for form:
            col = 0
            row = 0

            v_row = 0
            v_col = 1

            a_row = 0
            a_col = 1

            d_row = 0
            d_col = 1

            # Add headers
            worksheet.write_string(row, col, "Timestamp Recolha", hFormat)
            worksheet.set_column(col, col, 20)  # Width of column set to 20.
            col += 1

            worksheet.write_string(row, col, "ID Participante", hFormat)
            worksheet.set_column(col, col, 15)  # Width of column set to 20.
            col += 1

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

                if 'nomeDoEstimulo' in step:
                    worksheet.write_string(row, col, "Timestamp Estímulo", hFormat)
                    worksheet.set_column(col, col, 20)  # Width of column set to 20.
                    col += 1

                    worksheet.write_string(row, col, "Estímulo", hFormat)
                    worksheet.set_column(col, col, 20)  # Width of column set to 20.
                    col += 1

                if 'escalasSAM' in step and len(step['escalasSAM']) > 0:
                    worksheet.write_string(row, col, "Timestamp Escalas", hFormat)
                    worksheet.set_column(col, col, 20)  # Width of column set to 20.
                    col += 1

                    for e in range(0, len(step['escalasSAM'])):
                        worksheet.write_string(row, col, step['escalasSAM'][e], hFormat)
                        worksheet.set_column(col, col, 10)  # Width of column set to 20.
                        col += 1

                        # Worksheet Valence
                        if step['escalasSAM'][e] == 'Valência':
                            if 'nomeDoEstimulo' in step:
                                worksheetValence.write_string(v_row, v_col, step['nomeDoEstimulo'], hFormat)
                                worksheetValence.set_column(v_col, v_col, 20)
                                # print("Valência - " + step['nomeDoEstimulo'] + ": " + str(v_row) + "," + str(v_col))
                                v_col += 1
                            if 'nomeDoEstimuloVideo' in step:
                                worksheetValence.write_string(v_row, v_col, step['nomeDoEstimuloVideo'], hFormat)
                                worksheetValence.set_column(v_col, v_col, 20)
                                # print("Valência - " + step['nomeDoEstimuloVideo'] + ": " + str(v_row) + "," + str(v_col))
                                v_col += 1

                        # Worksheet Arousal
                        if step['escalasSAM'][e] == 'Alerta':
                            if 'nomeDoEstimulo' in step:
                                worksheetArousal.write_string(a_row, a_col, step['nomeDoEstimulo'], hFormat)
                                worksheetArousal.set_column(a_col, a_col, 20)
                                # print("Alerta - " + step['nomeDoEstimulo'] + ": " + str(a_row) + "," + str(a_col))
                                a_col += 1
                            if 'nomeDoEstimuloVideo' in step:
                                worksheetArousal.write_string(a_row, a_col, step['nomeDoEstimuloVideo'], hFormat)
                                worksheetArousal.set_column(a_col, a_col, 20)
                                # print("Alerta - " + step['nomeDoEstimuloVideo'] + ": " + str(a_row) + "," + str(a_col))
                                a_col += 1

                        # Worksheet Dominance
                        if step['escalasSAM'][e] == 'Dominância':
                            if 'nomeDoEstimulo' in step:
                                worksheetDominance.write_string(d_row, d_col, step['nomeDoEstimulo'], hFormat)
                                worksheetDominance.set_column(d_col, d_col, 20)
                                # print("Dominância - " + step['nomeDoEstimulo'] + ": " + str(d_row) + "," + str(d_col))
                                d_col += 1
                            if 'nomeDoEstimuloVideo' in step:
                                worksheetDominance.write_string(d_row, d_col, step['nomeDoEstimuloVideo'], hFormat)
                                worksheetDominance.set_column(d_col, d_col, 20)
                                # print("Dominância - " + step['nomeDoEstimuloVideo'] + ": " + str(d_row) + "," + str(d_col))
                                d_col += 1

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

            v_row = 1
            v_col = 1

            a_row = 1
            a_col = 1

            d_row = 1
            d_col = 1

            for i in range(0, len(pConfig)):
                worksheet.write_string(row, col, pConfig[i]['timestampRecolha'], pFormat)
                col += 1

                worksheet.write_string(row, col, pConfig[i]['idParticipante'], pFormat)
                col += 1

                collection = pConfig[i]['colheita']

                order = []
                for o in range(0, len(collection)):
                    order.append(collection[o]['nPasso'])

                for z in range(0, len(presentSteps)):

                    for j in range(0, len(collection)):

                        if collection[j]['nPasso'] == presentSteps[z]:
                            nOrder = order.index(collection[j]['nPasso']) + 1  # order in which appeared

                            worksheet.write_number(row, col, nOrder, oFormat)  # order
                            col += 1

                            if 'nomeDoEstimuloVideo' in collection[j]:
                                worksheet.write_string(row, col, collection[j]['timestampEstimuloVideo'], pFormat)
                                col += 1

                                worksheet.write_string(row, col, collection[j]['nomeDoEstimuloVideo'], pFormat)
                                col += 1

                            if 'nomeDoEstimulo' in collection[j]:
                                worksheet.write_string(row, col, collection[j]['timestampEstimulo'], pFormat)
                                col += 1

                                worksheet.write_string(row, col, collection[j]['nomeDoEstimulo'], pFormat)
                                col += 1

                            if 'colheitaEscalas' in collection[j]:
                                worksheet.write_string(row, col, collection[j]['timestampEscalas'], pFormat)
                                col += 1

                                if 'valencia' in collection[j]['colheitaEscalas']:
                                    worksheet.write_number(row, col, int(collection[j]['colheitaEscalas']['valencia']),
                                                           pFormat)
                                    col += 1

                                    worksheetValence.write_number(v_row, v_col,
                                                                  int(collection[j]['colheitaEscalas']['valencia']),
                                                                  pFormat)
                                    v_col += 1

                                if 'alerta' in collection[j]['colheitaEscalas']:
                                    worksheet.write_number(row, col, int(collection[j]['colheitaEscalas']['alerta']),
                                                           pFormat)
                                    col += 1

                                    # a_row = 1
                                    # a_col = 1
                                    worksheetArousal.write_number(a_row, a_col,
                                                                  int(collection[j]['colheitaEscalas']['alerta']),
                                                                  pFormat)
                                    a_col += 1

                                if 'dominancia' in collection[j]['colheitaEscalas']:
                                    worksheet.write_number(row, col,
                                                           int(collection[j]['colheitaEscalas']['dominancia']),
                                                           pFormat)
                                    col += 1

                                    worksheetDominance.write_number(d_row, d_col,
                                                                    int(collection[j]['colheitaEscalas']['dominancia']),
                                                                    pFormat)
                                    d_col += 1

                            if 'colheitaQuestoes' in collection[j]:
                                arrayQuestoes = collection[j]['colheitaQuestoes']
                                worksheet.write_string(row, col, collection[j]['timestampQuestoes'], pFormat)
                                col += 1

                                for k in range(0, len(arrayQuestoes)):
                                    worksheet.write_string(row, col, arrayQuestoes[k], pFormat)
                                    col += 1

                col = 0
                row += 1

                v_col = 1
                v_row += 1

                a_col = 1
                a_row += 1

                d_col = 1
                d_row += 1

            # endfor
            #### END OF Worksheet generation for form

            workbook.close()

            # construct response
            output.seek(0)
            response = HttpResponse(output.read(), content_type="application/vnd.ms-excel")
            response['Content-Disposition'] = "attachment; filename=" + filename

            print("SUCCESS: Data collection for form " + idForm + " successfully downloaded.")
            return response

        except Exception as e:
            print("ERROR downloadParticipantsDataCollectedData: " + str(e))
            return HttpResponseServerError("ERROR: " + str(e))


# ######################################################################## #
# For the main page.
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
            # userNotifications = []

            # to get the number of notifications for the user
            existingNotifications = UserNotification.objects.filter(username__username=user)

            # for k in range(0, len(existingNotifications)):
            #    userNotifications.append(existingNotifications[k])

            # Owned forms by user
            pO = Permission.objects.filter(username__username=user).filter(permissionType='O').select_related()

            for i in range(0, len(pO)):
                if pO[i].idForm.isArchived == 'Y':  # if is archived
                    nP = ParticipantInForm.objects.filter(idForm=pO[i].idForm.idForm)
                    ownedArchivedForms.append([pO[i], len(nP)])

                else:  # if not archived
                    if pO[i].permissionType == 'O':  # owner
                        if pO[i].idForm.statusType == 'C':  # closed
                            nP = ParticipantInForm.objects.filter(idForm=pO[i].idForm.idForm)
                            ownedFormsClosedList.append([pO[i], len(nP)])
                        else:  # open
                            nP = ParticipantInForm.objects.filter(idForm=pO[i].idForm.idForm)
                            ownedFormsOpenList.append([pO[i], len(nP)])

            # Guest forms for user
            pG = Permission.objects.filter(username__username=user).filter(permissionType='R').select_related()

            for j in range(0, len(pG)):
                if pG[j].idForm.isArchived == 'Y':
                    nP = ParticipantInForm.objects.filter(idForm=pG[j].idForm.idForm)
                    sharedArchivedForms.append([pG[j], len(nP)])
                else:
                    if pG[j].permissionType == 'R':
                        if pG[j].idForm.statusType == 'C':  # closed
                            nP = ParticipantInForm.objects.filter(idForm=pG[j].idForm.idForm)
                            sharedFormsClosedList.append([pG[j], len(nP)])
                        else:  # open
                            nP = ParticipantInForm.objects.filter(idForm=pG[j].idForm.idForm)
                            sharedFormsOpenList.append([pG[j], len(nP)])

            # to display usernames in access granting
            usersList = User.objects.exclude(username=user)

            # get e-mail from user
            u = User.objects.get(username=user)
            userEmail = u.email

            # for special form configs
            formsList = []
            p = Permission.objects.filter(username__username=user)
            for i in range(0, len(p)):
                formsList.append(p[i].idForm)

            context = {
                "username": user,
                "userEmail": userEmail,
                "ownedFormsClosedList": ownedFormsClosedList,
                "ownedFormsOpenList": ownedFormsOpenList,
                "sharedFormsClosedList": sharedFormsClosedList,
                "sharedFormsOpenList": sharedFormsOpenList,
                "ownedArchivedForms": ownedArchivedForms,
                "sharedArchivedForms": sharedArchivedForms,
                "usersList": usersList,
                "userNotificationsNumber": len(existingNotifications),
                "formsList": formsList,
            }

            return render(request, "main/home.html", context)


# ######################################################################## #
# Gets the token associated to a form.
# ######################################################################## #
def getFormToken(request):
    if not request.session.has_key('username'):  # if the user is not logged in redirects to login page
        return redirect('login')

    else:
        idForm = request.GET.get("idForm")

        try:
            f = Form.objects.get(idForm=idForm)
            p = ParticipantToken.objects.get(idForm=f)
            print("SUCCESS: " + p.token)
            return HttpResponse(p.token)

        except Exception as e:
            print("ERROR getFormToken: " + str(e))
            return HttpResponseServerError("ERROR getFormToken: " + str(e))


# ######################################################################## #
# Deletes all the notifications of a user.
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

        except Exception as e:
            print("ERROR deleteNotifications: " + str(e))
            return HttpResponseServerError("ERROR: " + str(e))


# ######################################################################## #
# Gets all the notifications of a user.
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

        except Exception as e:
            print("ERROR getNotifications: " + str(e))
            return HttpResponseServerError("ERROR: " + str(e))


# ######################################################################## #
# Gets the number of notifications of a user.
# ######################################################################## #
def getNNotifications(request):
    if not request.session.has_key('username'):  # if the user is not logged in redirects to login page
        return redirect('login')

    else:
        try:
            user = request.session['username']
            existingNotifications = UserNotification.objects.filter(username__username=user)

            return HttpResponse(json.dumps(len(existingNotifications)), content_type="application/json")

        except Exception as e:
            return HttpResponseServerError("ERROR getNNotifications: " + str(e))


# ######################################################################## #
# Saves or retrieves special configs of a form.
# ######################################################################## #
class SpecialConfigsView(View):
    def get(self, request):
        idForm = request.GET.get("idForm")

        try:
            fsc = FormSpecialConfigs.objects.get(idForm=idForm)

            response = []

            if (fsc.idTrialForm != None):
                response.append(fsc.idTrialForm.idForm)
            else:
                response.append("NA")
            response.append(fsc.scaleExplained)

            print(
                "SUCCESS: " + str(response))
            return HttpResponse(json.dumps(response), content_type="application/json")

        except Exception as e:
            print("ERROR SpecialConfigsView: " + str(e))
            return HttpResponseServerError("ERROR: " + str(e))

    def post(self, request):
        if not request.session.has_key('username'):  # if the user is not logged in redirects to login page
            return redirect('login')

        else:
            idForm = request.POST.get("idForm")
            idTrialForm = request.POST.get("idTrialForm")
            scaleExplained = request.POST.get("scaleExplained")

            try:
                if idTrialForm == "NA":
                    try:
                        fsc = FormSpecialConfigs.objects.get(idForm=idForm)
                        fsc.idTrialForm = None
                        fsc.scaleExplained = scaleExplained
                        fsc.save()

                        # grants permission of reader to users that have permission of access to the form
                        p = Permission.objects.filter(idForm=idForm).exclude(
                            username__username=request.session['username'])
                        f = Form.objects.get(idForm=idForm)

                        existingNotifications = UserNotification.objects.filter(idForm=idForm)
                        for j in range(0, len(existingNotifications)):
                            if "treino" in existingNotifications[j].message:
                                existingNotifications[j].delete()

                        for i in range(0, len(p)):
                            user = p[i].username
                            message = "O questionário \"" + f.formName + "\" deixou de ter questionário de treino, por decisão do utilizador " + \
                                      request.session['username'] + "."
                            pushNotification(user.username, idForm, message, 'D')

                        print(
                            "SUCCESS: The special form configurations for form " + idForm + " were saved with idTrialForm = " + idTrialForm + " and scaleExplained = " + scaleExplained)
                        return HttpResponse(
                            "SUCCESS: The special form configurations for form " + idForm + " were saved with idTrialForm = " + idTrialForm + " and scaleExplained = " + scaleExplained)

                    except ObjectDoesNotExist:
                        print("SUCCESS: The form " + idForm + " has no special configurations.")
                        return HttpResponse("SUCCESS: The form " + idForm + " has no special configurations.")

                try:  # if it exists, edit
                    fsc = FormSpecialConfigs.objects.get(idForm=idForm)
                    fsc.idTrialForm = Form.objects.get(idForm=idTrialForm)
                    fsc.scaleExplained = scaleExplained
                    fsc.save()

                    # grants permission of reader to users that have permission of access to the form
                    p = Permission.objects.filter(idForm=idForm).exclude(username__username=request.session['username'])
                    f = Form.objects.get(idForm=idForm)
                    fT = Form.objects.get(idForm=idTrialForm)

                    existingNotifications = UserNotification.objects.filter(idForm=idForm)
                    for j in range(0, len(existingNotifications)):
                        if "treino" in existingNotifications[j].message:
                            existingNotifications[j].delete()

                    for i in range(0, len(p)):
                        user = p[i].username
                        pT = Permission.objects.filter(idForm=idTrialForm, username=user)
                        if len(pT) == 0:  # user does not have permmission for trial access
                            # grant permission
                            newP = Permission()
                            newP.username = user
                            newP.idForm = Form.objects.get(idForm=idTrialForm)
                            newP.permissionType = 'R'
                            newP.save()

                            message = "Foi-lhe concedida permissão de Leitor ao questionário \"" + fT.formName + "\" pelo utilizador " + \
                                      request.session['username'] + "."
                            pushNotification(user.username, idForm, message, 'S')

                            message = "O questionário \"" + fT.formName + "\" foi selecionado como questionário de treino de \"" + f.formName + "\" pelo utilizador " + \
                                      request.session['username'] + "."
                            pushNotification(user.username, idForm, message, 'I')

                        else:
                            message = "O questionário \"" + fT.formName + "\" foi selecionado como questionário de treino de \"" + f.formName + "\" pelo utilizador " + \
                                      request.session['username'] + "."
                            pushNotification(user.username, idForm, message, 'I')

                    print(
                        "SUCCESS: The special form configurations for form " + idForm + " were saved with idTrialForm = " + idTrialForm + " and scaleExplained = " + scaleExplained)
                    return HttpResponse(
                        "SUCCESS: The special form configurations for form " + idForm + " were saved with idTrialForm = " + idTrialForm + " and scaleExplained = " + scaleExplained)

                except ObjectDoesNotExist:  # If it does not exists, saves.
                    sc = FormSpecialConfigs()
                    sc.idForm = Form.objects.get(idForm=idForm)
                    sc.idTrialForm = Form.objects.get(idForm=idTrialForm)
                    sc.scaleExplained = scaleExplained
                    sc.save()

                    # grants permission of reader to users that have permission of access to the form
                    p = Permission.objects.filter(idForm=idForm).exclude(username__username=request.session['username'])
                    f = Form.objects.get(idForm=idForm)
                    fT = Form.objects.get(idForm=idTrialForm)

                    existingNotifications = UserNotification.objects.filter(idForm=idForm)
                    for j in range(0, len(existingNotifications)):
                        if "treino" in existingNotifications[j].message:
                            existingNotifications[j].delete()

                    for i in range(0, len(p)):
                        user = p[i].username
                        pT = Permission.objects.filter(idForm=idTrialForm, username=user)
                        if len(pT) == 0:  # user does not have permmission for trial access
                            # grant permission
                            newP = Permission()
                            newP.username = user
                            newP.idForm = Form.objects.get(idForm=idTrialForm)
                            newP.permissionType = 'R'
                            newP.save()

                            message = "Foi-lhe concedida permissão de Leitor ao questionário \"" + fT.formName + "\"."
                            pushNotification(user.username, idForm, message, 'S')

                            message = "O questionário \"" + fT.formName + "\" foi selecionado como questionário de treino de \"" + f.formName + "\"."
                            pushNotification(user.username, idForm, message, 'I')

                        else:
                            message = "O questionário \"" + fT.formName + "\" foi selecionado como questionário de treino de \"" + f.formName + "\"."
                            pushNotification(user.username, idForm, message, 'I')

                    print(
                        "SUCCESS: The special form configurations for form " + idForm + " were saved with idTrialForm = " + idTrialForm + " and scaleExplained = " + scaleExplained)
                    return HttpResponse(
                        "SUCCESS: The special form configurations for form " + idForm + " were saved with idTrialForm = " + idTrialForm + " and scaleExplained = " + scaleExplained)

            except Exception as e:
                print("ERROR SpecialConfigsView: " + str(e))
                return HttpResponseServerError("ERROR: " + str(e))


# ######################################################################## #
# Pushes a notification (auxiliary function).
# ######################################################################## #
def pushNotification(username, idForm, message, severityLevel):
    un = UserNotification()
    un.username = User.objects.get(username=username)
    un.idForm = idForm
    un.message = message
    un.severityLevel = severityLevel
    un.save()

    print("NOTIFICATION PUSHED: " + message)


# ######################################################################## #
# Returns a list of users with access to form, excluding the user who
# requested the list.
# ######################################################################## #
def getListOfUsersWithForm(request):
    if not request.session.has_key('username'):  # if the user is not logged in redirects to login page
        return redirect('login')

    else:
        idForm = request.GET.get("idForm")

    try:
        p = Permission.objects.filter(idForm=idForm).exclude(username__username=request.session['username'])
        usersListWithAccess = []

        for i in range(0, len(p)):
            if p[i].permissionType == 'R':
                usersListWithAccess.append([p[i].username.username, 'leitor'])
            else:
                usersListWithAccess.append([p[i].username.username, 'administrador'])

        print("SUCCESS: List of users with access to form " + idForm + ": " + str(usersListWithAccess))
        return HttpResponse(json.dumps(usersListWithAccess), content_type="application/json")

    except Exception as e:
        print("ERROR getListOfUsersWithForm: " + str(e))
        return HttpResponseServerError("ERROR: " + str(e))


# ######################################################################## #
# Retrieves data from form to present graphs and other relevant
# data in a dashboard.
# ######################################################################## #
def formDashboardView(request, idForm):
    if not request.session.has_key('username'):
        return redirect('login')

    else:

        try:
            f = Form.objects.get(idForm=idForm)

            p = ParticipantInForm.objects.filter(idForm=idForm)
            participantIDs = []

            # loads info of each participant into an array of dictionaries
            for i in range(0, len(p)):
                pData = json.loads(p[i].dataCollection)
                participantIDs.append(pData['idParticipante'])

            # gets a list of the stimulus with scales
            fData = json.loads(f.formConfig)
            # [stimulus, average, max, min, mediana, desvio]
            stimulusListValence = []
            stimulusListArousal = []
            stimulusListDominance = []

            stimulusListValuesValence = []
            stimulusListValuesArousal = []
            stimulusListValuesDominance = []

            listOfStimulus = []

            for i in range(0, len(fData['passos'])):
                step = fData['passos'][i]

                if 'escalasSAM' in step and len(step['escalasSAM']) > 0:
                    if 'Valência' in step['escalasSAM']:
                        if 'nomeDoEstimuloVideo' in step:
                            stimulusListValence.append([step['nomeDoEstimuloVideo'], 0, 0, 0, 0, 0, 0, 0])
                            stimulusListValuesValence.append([step['nomeDoEstimuloVideo'], []])

                            if (step['nomeDoEstimuloVideo'] not in listOfStimulus):
                                listOfStimulus.append(step['nomeDoEstimuloVideo'])

                        if 'nomeDoEstimulo' in step:
                            stimulusListValence.append([step['nomeDoEstimulo'], 0, 0, 0, 0, 0, 0, 0])
                            stimulusListValuesValence.append([step['nomeDoEstimulo'], []])

                            if (step['nomeDoEstimulo'] not in listOfStimulus):
                                listOfStimulus.append(step['nomeDoEstimulo'])

                    if 'Alerta' in step['escalasSAM']:
                        if 'nomeDoEstimuloVideo' in step:
                            stimulusListArousal.append([step['nomeDoEstimuloVideo'], 0, 0, 0, 0, 0, 0, 0])
                            stimulusListValuesArousal.append([step['nomeDoEstimuloVideo'], []])

                            if (step['nomeDoEstimuloVideo'] not in listOfStimulus):
                                listOfStimulus.append(step['nomeDoEstimuloVideo'])

                        if 'nomeDoEstimulo' in step:
                            stimulusListArousal.append([step['nomeDoEstimulo'], 0, 0, 0, 0, 0, 0, 0])
                            stimulusListValuesArousal.append([step['nomeDoEstimulo'], []])

                            if (step['nomeDoEstimulo'] not in listOfStimulus):
                                listOfStimulus.append(step['nomeDoEstimulo'])

                    if 'Dominância' in step['escalasSAM']:
                        if 'nomeDoEstimuloVideo' in step:
                            stimulusListDominance.append([step['nomeDoEstimuloVideo'], 0, 0, 0, 0, 0, 0, 0])
                            stimulusListValuesDominance.append([step['nomeDoEstimuloVideo'], []])

                            if (step['nomeDoEstimuloVideo'] not in listOfStimulus):
                                listOfStimulus.append(step['nomeDoEstimuloVideo'])

                        if 'nomeDoEstimulo' in step:
                            stimulusListDominance.append([step['nomeDoEstimulo'], 0, 0, 0, 0, 0, 0, 0])
                            stimulusListValuesDominance.append([step['nomeDoEstimulo'], []])

                            if (step['nomeDoEstimulo'] not in listOfStimulus):
                                listOfStimulus.append(step['nomeDoEstimulo'])

            # end of gets a list of the stimulus with scales

            # gets the values of the scales for each stimulus
            for i in range(0, len(participantIDs)):
                r = json.loads(getScalesFromParticipant(participantIDs[i], idForm))

                if 'valence' in r:
                    for j in range(0, len(stimulusListValence)):
                        stimulusName = stimulusListValence[j][0]
                        for k in range(0, len(r['valence'])):
                            if r['valence'][k][0] == stimulusName:
                                stimulusListValuesValence[j][1].append(int(r['valence'][k][1]))

                if 'arousal' in r:
                    for j in range(0, len(stimulusListArousal)):
                        stimulusName = stimulusListArousal[j][0]
                        for k in range(0, len(r['arousal'])):
                            if r['arousal'][k][0] == stimulusName:
                                stimulusListValuesArousal[j][1].append(int(r['arousal'][k][1]))

                if 'dominance' in r:
                    for j in range(0, len(stimulusListDominance)):
                        stimulusName = stimulusListDominance[j][0]
                        for k in range(0, len(r['dominance'])):
                            if r['dominance'][k][0] == stimulusName:
                                stimulusListValuesDominance[j][1].append(int(r['dominance'][k][1]))

            # end of gets the values of the scales for each stimulus

            # calculates average, maximum, minimum, median and standard deviation for each stimulus
            for i in range(0, len(stimulusListValuesValence)):
                values = stimulusListValuesValence[i][1]

                stimulusListValence[i][0] = stimulusListValuesValence[i][0]  # stimules name
                stimulusListValence[i][1] = round((float(sum(values)) / len(values)), 3)  # average
                stimulusListValence[i][2] = max(values)  # maximum
                stimulusListValence[i][3] = min(values)  # minimum
                stimulusListValence[i][4] = statistics.median(values)  # median

                dev = []
                for x in values:
                    dev.append(x - stimulusListValence[i][1])

                sqr = []
                for x in dev:
                    sqr.append(x * x)

                stimulusListValence[i][5] = round((math.sqrt(sum(sqr) / (len(sqr) - 1))), 3)  # standard deviation

                sortedValues = sorted(values)
                stimulusListValence[i][6] = percentile(sortedValues, 0.25)  # 1st quartile
                stimulusListValence[i][7] = percentile(sortedValues, 0.75)  # 3rd quartile

            for i in range(0, len(stimulusListValuesArousal)):
                values = stimulusListValuesArousal[i][1]

                stimulusListArousal[i][0] = stimulusListValuesArousal[i][0]  # stimules name
                stimulusListArousal[i][1] = round((float(sum(values)) / len(values)), 3)  # average
                stimulusListArousal[i][2] = max(values)  # maximum
                stimulusListArousal[i][3] = min(values)  # minimum
                stimulusListArousal[i][4] = statistics.median(values)  # median

                dev = []
                for x in values:
                    dev.append(x - stimulusListArousal[i][1])

                sqr = []
                for x in dev:
                    sqr.append(x * x)

                stimulusListArousal[i][5] = round((math.sqrt(sum(sqr) / (len(sqr) - 1))), 3)  # standard deviation

                sortedValues = sorted(values)
                stimulusListArousal[i][6] = percentile(sortedValues, 0.25)  # 1st quartile
                stimulusListArousal[i][7] = percentile(sortedValues, 0.75)  # 3rd quartile

            for i in range(0, len(stimulusListValuesDominance)):
                values = stimulusListValuesDominance[i][1]

                stimulusListDominance[i][0] = stimulusListValuesDominance[i][0]  # stimules name
                stimulusListDominance[i][1] = round((float(sum(values)) / len(values)), 3)  # average
                stimulusListDominance[i][2] = max(values)  # maximum
                stimulusListDominance[i][3] = min(values)  # minimum
                stimulusListDominance[i][4] = statistics.median(values)  # median

                dev = []
                for x in values:
                    dev.append(x - stimulusListArousal[i][1])

                sqr = []
                for x in dev:
                    sqr.append(x * x)

                stimulusListDominance[i][5] = round((math.sqrt(sum(sqr) / (len(sqr) - 1))), 3)  # standard deviation

                sortedValues = sorted(values)
                stimulusListDominance[i][6] = percentile(sortedValues, 0.25)  # 1st quartile
                stimulusListDominance[i][7] = percentile(sortedValues, 0.75)  # 3rd quartile

            stimulusListValenceHistogram = []
            for i in range(0, len(stimulusListValuesValence)):
                occurences = []
                occurences.append(stimulusListValuesValence[i][1].count(1))
                occurences.append(stimulusListValuesValence[i][1].count(2))
                occurences.append(stimulusListValuesValence[i][1].count(3))
                occurences.append(stimulusListValuesValence[i][1].count(4))
                occurences.append(stimulusListValuesValence[i][1].count(5))
                occurences.append(stimulusListValuesValence[i][1].count(6))
                occurences.append(stimulusListValuesValence[i][1].count(7))
                occurences.append(stimulusListValuesValence[i][1].count(8))
                occurences.append(stimulusListValuesValence[i][1].count(9))

                stimulusListValenceHistogram.append([stimulusListValuesValence[i][0], occurences])

            stimulusListArousalHistogram = []
            for i in range(0, len(stimulusListValuesArousal)):
                occurences = []
                occurences.append(stimulusListValuesArousal[i][1].count(1))
                occurences.append(stimulusListValuesArousal[i][1].count(2))
                occurences.append(stimulusListValuesArousal[i][1].count(3))
                occurences.append(stimulusListValuesArousal[i][1].count(4))
                occurences.append(stimulusListValuesArousal[i][1].count(5))
                occurences.append(stimulusListValuesArousal[i][1].count(6))
                occurences.append(stimulusListValuesArousal[i][1].count(7))
                occurences.append(stimulusListValuesArousal[i][1].count(8))
                occurences.append(stimulusListValuesArousal[i][1].count(9))

                stimulusListArousalHistogram.append([stimulusListValuesArousal[i][0], occurences])

            stimulusListDominanceHistogram = []
            for i in range(0, len(stimulusListValuesDominance)):
                occurences = []
                occurences.append(stimulusListValuesDominance[i][1].count(1))
                occurences.append(stimulusListValuesDominance[i][1].count(2))
                occurences.append(stimulusListValuesDominance[i][1].count(3))
                occurences.append(stimulusListValuesDominance[i][1].count(4))
                occurences.append(stimulusListValuesDominance[i][1].count(5))
                occurences.append(stimulusListValuesDominance[i][1].count(6))
                occurences.append(stimulusListValuesDominance[i][1].count(7))
                occurences.append(stimulusListValuesDominance[i][1].count(8))
                occurences.append(stimulusListValuesDominance[i][1].count(9))

                stimulusListDominanceHistogram.append([stimulusListValuesDominance[i][0], occurences])

            # print("Valence: " + str(stimulusListValence))
            # print("Arousal: " + str(stimulusListArousal))
            # print("Dominance: " + str(stimulusListDominance))

            # print("Valence: " + str(stimulusListValuesValence))
            # print("Arousal: " + str(stimulusListValuesArousal))
            # print("Dominance: " + str(stimulusListValuesDominance))

            # print("Valence Histogram: " + str(stimulusListValenceHistogram))
            # print("Arousal Histogram: " + str(stimulusListArousalHistogram))
            # print("Dominance Histogram: " + str(stimulusListDominanceHistogram))

            context = {
                "idForm": f.idForm,
                "formName": f.formName,
                "listOfStimulusNames": listOfStimulus,
                "stimulusListValence": stimulusListValence,
                "stimulusListArousal": stimulusListArousal,
                "stimulusListDominance": stimulusListDominance,
                "stimulusListValenceHistogram": stimulusListValenceHistogram,
                "stimulusListArousalHistogram": stimulusListArousalHistogram,
                "stimulusListDominanceHistogram": stimulusListDominanceHistogram,
            }
            return render(request, "main/form_dashboard.html", context)


        except Exception as e:
            print("ERROR formDashboardView: " + str(e))
            return HttpResponseServerError("ERROR: " + str(e))


# ######################################################################## #
# Retrieves average value of sam scales.
# (aux function of formDashboardView)
# ######################################################################## #
def getScalesFromParticipant(idParticipant, idForm):
    try:
        f = Form.objects.get(idForm=idForm)
        p = ParticipantInForm.objects.get(idParticipant=idParticipant, idForm=f)

        pData = json.loads(p.dataCollection)

        valence = []
        arousal = []
        dominance = []

        for i in range(0, len(pData['colheita'])):
            step = pData['colheita'][i]

            if 'colheitaEscalas' in step:
                if 'nomeDoEstimulo' in step:
                    stimulus = step['nomeDoEstimulo']
                if 'nomeDoEstimuloVideo' in step:
                    stimulus = step['nomeDoEstimuloVideo']

                if 'valencia' in step['colheitaEscalas']:
                    valence.append([stimulus, step['colheitaEscalas']['valencia']])
                if 'alerta' in step['colheitaEscalas']:
                    arousal.append([stimulus, step['colheitaEscalas']['alerta']])
                if 'dominancia' in step['colheitaEscalas']:
                    dominance.append([stimulus, step['colheitaEscalas']['dominancia']])

        response = {}
        response['valence'] = valence
        response['arousal'] = arousal
        response['dominance'] = dominance

        # print("SUCCESS: " + json.dumps(response))
        return json.dumps(response)

    except Exception as e:
        print("ERROR getScalesFromParticipant: " + str(e))
        return json.dumps({})


# ######################################################################## #
# Find the percentile of a list of values.
# N - is a list of values. Note N MUST BE already sorted.
# percent - a float value from 0.0 to 1.0.
# key - optional key function to compute value from each element of N.
# (aux function of formDashboardView)
# ######################################################################## #
def percentile(N, percent, key=lambda x: x):
    if not N:
        return None

    k = (len(N) - 1) * percent
    f = math.floor(k)
    c = math.ceil(k)

    if f == c:
        return key(N[int(k)])

    d0 = key(N[int(f)]) * (c - k)
    d1 = key(N[int(c)]) * (k - f)

    return d0 + d1
