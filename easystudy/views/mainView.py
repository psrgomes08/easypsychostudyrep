import json
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views import View
from django.contrib.auth.models import User
from easystudy.models import Form, Permission, ParticipantInForm, ParticipantToken
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
            response = HttpResponse("Permission was granted!")
            return response
        except IntegrityError:
            response = HttpResponseServerError("The user already has the selected permission for the selected form.")
            return response


# ######################################################################## #
# Closes the data collecting of a form.
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
# (NOT IMPLEMENTED)
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
# Deletes a selected study in the home page.
# ######################################################################## #
def deleteStudyForm(request, idForm):
    if not request.session.has_key('username'):  # if the user is not logged in redirects to login page
        return redirect('login')

    else:
        try:
            selectedForm = Form.objects.get(idForm=idForm)
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
            worksheet = workbook.add_worksheet()

            # Format to be applied to the main header
            mFormat = workbook.add_format()
            mFormat.set_bold()
            mFormat.set_text_wrap()
            mFormat.set_align('center')
            mFormat.set_bg_color('#17202A')
            mFormat.set_color('#FFFFFF')

            mFormatW = workbook.add_format()
            mFormatW.set_bold()
            mFormatW.set_text_wrap()
            mFormatW.set_align('center')
            mFormatW.set_bg_color('#808B96')
            mFormatW.set_color('#FFFFFF')

            # Format to be applied to the headers
            hFormat = workbook.add_format()
            hFormat.set_bold()
            hFormat.set_text_wrap()
            hFormat.set_align('center')

            # Format to be applied to the participants
            pFormat = workbook.add_format()
            pFormat.set_text_wrap()
            pFormat.set_align('center')

            col = 0
            row = 0

            m_start_column = col
            m_end_column = col

            # Add headers
            worksheet.write_string(1, col, "Início recolha", hFormat)
            worksheet.set_column(col, col, 20)  # Width of column set to 20.
            col += 1
            m_end_column += 1

            worksheet.write_string(1, col, "ID Participante", hFormat)
            worksheet.set_column(col, col, 15)  # Width of column set to 20.
            col += 1
            m_end_column += 1

            m_end_column -= 1
            worksheet.merge_range(row, m_start_column, row, m_end_column, "Dados Gerais", mFormat)
            # print("Passo: Dados Gerais" + " | start: " + str(m_start_column) + ", end: " + str(m_end_column))
            m_end_column += 1

            row = 1  # row where second header starts
            presentSteps = []
            # presentStepsNames = []
            cN = 1  # for header color control

            for s in range(0, len(fConfig['passos'])):
                # print("»» At beginning of circle: " + str(s) + ": " + str(m_end_column))
                step = fConfig['passos'][s]
                presentSteps.append(step['nPasso'])
                # presentStepsNames.append(step['nomePasso'])
                stepName = step['nomePasso']
                m_start_column = m_end_column

                if 'nomeDoEstimuloVideo' in step:
                    worksheet.write_string(row, col, "Ordem Tarefa", hFormat)
                    worksheet.set_column(col, col, 10)  # Width of column set to 20.
                    col += 1
                    m_end_column += 1
                    worksheet.write_string(row, col, "Timestamp Estímulo", hFormat)
                    worksheet.set_column(col, col, 20)  # Width of column set to 20.
                    col += 1
                    m_end_column += 1
                    worksheet.write_string(row, col, "Estímulo", hFormat)
                    worksheet.set_column(col, col, 20)  # Width of column set to 20.
                    col += 1
                    m_end_column += 1

                if 'nomeDoEstimulo' in step:
                    worksheet.write_string(row, col, "Ordem Tarefa", hFormat)
                    worksheet.set_column(col, col, 10)  # Width of column set to 20.
                    col += 1
                    m_end_column += 1
                    worksheet.write_string(row, col, "Timestamp Estímulo", hFormat)
                    worksheet.set_column(col, col, 20)  # Width of column set to 20.
                    col += 1
                    m_end_column += 1
                    worksheet.write_string(row, col, "Estímulo", hFormat)
                    worksheet.set_column(col, col, 20)  # Width of column set to 20.
                    col += 1
                    m_end_column += 1

                if 'escalasSAM' in step and len(step['escalasSAM']) > 0:
                    worksheet.write_string(row, col, "Timestamp Escalas", hFormat)
                    worksheet.set_column(col, col, 20)  # Width of column set to 20.
                    col += 1
                    m_end_column += 1
                    for e in range(0, len(step['escalasSAM'])):
                        worksheet.write_string(row, col, step['escalasSAM'][e], hFormat)
                        worksheet.set_column(col, col, 10)  # Width of column set to 20.
                        col += 1
                        m_end_column += 1

                if 'questoes' in step:
                    worksheet.write_string(row, col, "Timestamp Questões", hFormat)
                    worksheet.set_column(col, col, 20)  # Width of column set to 20.
                    col += 1
                    m_end_column += 1
                    for q in range(0, len(step['questoes'])):
                        worksheet.write_string(row, col, step['questoes'][q], hFormat)
                        worksheet.set_column(col, col, 30)  # Width of column set to 20.
                        col += 1
                        m_end_column += 1

                if 'descricaoPasso' not in step:  # Merges the step name
                    m_end_column -= 1

                    if (cN % 2 == 0):
                        worksheet.merge_range(0, m_start_column, 0, m_end_column, stepName, mFormat)
                    else:
                        worksheet.merge_range(0, m_start_column, 0, m_end_column, stepName, mFormatW)

                    cN += 1

                    # worksheet.merge_range(0, m_start_column, 0, m_end_column, stepName, mFormat)
                    # print("Passo: " + stepName + " | start: " + str(m_start_column) + ", end: " + str(m_end_column))
                    m_end_column += 1
                    # print("»» At end of cicle of " + str(s) + ": " + str(m_end_column))

            # Headers finished

            # Add information from participant
            row = 2
            col = 0

            for i in range(0, len(pConfig)):
                worksheet.write_string(row, col, pConfig[i]['timestampRecolha'], pFormat)
                col += 1

                worksheet.write_string(row, col, pConfig[i]['idParticipante'], pFormat)
                col += 1

                collection = pConfig[i]['colheita']

                order = []
                for o in range(0, len(collection)):
                    order.append(collection[o]['nPasso'])

                # print("»» New Participant ««")
                # print(" ")

                for z in range(0, len(presentSteps)):
                    # print("»»»»»» Present step index: " + str(z))
                    for j in range(0, len(collection)):
                        if collection[j]['nPasso'] == presentSteps[z]:
                            # print(str(collection[j]['nPasso']) + " | " + str(presentSteps[z]) + " | " + str(presentStepsNames[z]))
                            # print(" I am at step: " + str(collection[j]['nPasso']))
                            nOrder = order.index(collection[j]['nPasso']) + 1  # order in which appeared
                            # print(" I appeared at order: " + str(nOrder))
                            # print("")

                            if 'nomeDoEstimuloVideo' in collection[j]:
                                worksheet.write_string(row, col, str(nOrder), pFormat)  # order
                                col += 1
                                worksheet.write_string(row, col, collection[j]['timestampEstimuloVideo'], pFormat)
                                # print(str(collection[j]['timestampEstimulo']))
                                col += 1
                                worksheet.write_string(row, col, collection[j]['nomeDoEstimuloVideo'], pFormat)
                                # print(str(collection[j]['nomeDoEstimulo']))
                                col += 1

                            if 'nomeDoEstimulo' in collection[j]:
                                worksheet.write_string(row, col, str(nOrder), pFormat)  # order
                                col += 1
                                worksheet.write_string(row, col, collection[j]['timestampEstimulo'], pFormat)
                                # print(str(collection[j]['timestampEstimulo']))
                                col += 1
                                worksheet.write_string(row, col, collection[j]['nomeDoEstimulo'], pFormat)
                                # print(str(collection[j]['nomeDoEstimulo']))
                                col += 1

                            if 'colheitaEscalas' in collection[j]:
                                worksheet.write_string(row, col, collection[j]['timestampEscalas'], pFormat)
                                # print(str(collection[j]['timestampEscalas']))
                                col += 1
                                if 'alerta' in collection[j]['colheitaEscalas']:
                                    worksheet.write_string(row, col, collection[j]['colheitaEscalas']['alerta'],
                                                           pFormat)
                                    # print(str(collection[j]['colheitaEscalas']['alerta']))
                                    col += 1
                                if 'valencia' in collection[j]['colheitaEscalas']:
                                    worksheet.write_string(row, col, collection[j]['colheitaEscalas']['valencia'],
                                                           pFormat)
                                    # print(str(collection[j]['colheitaEscalas']['valencia']))
                                    col += 1
                                if 'dominancia' in collection[j]['colheitaEscalas']:
                                    worksheet.write_string(row, col, collection[j]['colheitaEscalas']['dominancia'],
                                                           pFormat)
                                    # print(str(collection[j]['colheitaEscalas']['dominancia']))
                                    col += 1

                            if 'colheitaQuestoes' in collection[j]:
                                arrayQuestoes = collection[j]['colheitaQuestoes']
                                worksheet.write_string(row, col, collection[j]['timestampQuestoes'], pFormat)
                                # print(str(collection[j]['timestampQuestoes']))
                                col += 1
                                for k in range(0, len(arrayQuestoes)):
                                    worksheet.write_string(row, col, arrayQuestoes[k], pFormat)
                                    # print(str(arrayQuestoes[k]))
                                    col += 1

                col = 0
                row += 1

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
            # ownedFormsList = Permission.objects.filter(username__username=user).filter(permissionType='O')
            ownedFormsClosedList = []
            ownedFormsOpenList = []
            # sharedFormsList = Permission.objects.filter(username__username=user).filter(permissionType='R')
            sharedFormsClosedList = []
            sharedFormsOpenList = []
            ownedArchivedForms = []
            sharedArchivedForms = []

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
                "ownedFormsClosedList": ownedFormsClosedList,
                "ownedFormsOpenList": ownedFormsOpenList,
                "sharedFormsClosedList": sharedFormsClosedList,
                "sharedFormsOpenList": sharedFormsOpenList,
                "ownedArchivedForms": ownedArchivedForms,
                "sharedArchivedForms": sharedArchivedForms,
                "usersList": usersList,
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
