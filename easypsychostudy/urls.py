"""easypsychostudy URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.contrib import admin
from easystudy import views

from easystudy.views import *

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^painel$', HomeView.as_view(), name='home'),
    url(r'^$', UserLoginView.as_view(), name='login'),
    url(r'^criarquestionario$', NewFormView.as_view(), name='new-form'),
    url(r'^logout/', views.logout, name='logout'),
    url(r'^descarregarconfiguracoes/([a-zA-Z0-9S]+)$', views.downloadJSON, name='download-json'),  # not implemented
    url(r'^apagarquestionario/([a-zA-Z0-9S]+)$', views.deleteStudyForm, name='delete-form'),
    url(r'^recolha/([a-zA-Z0-9S]+)$', DataCollectionView.as_view(), name='data-collection'),
    url(r'^recolhaparticipante/([a-zA-Z0-9S]+)/([a-zA-Z0-9S]+)$', DataCollectionForParticipantView.as_view(),
        name='data-collection-participant'),
    url(r'^descarregardadoscolecionados/([a-zA-Z0-9S]+)$', views.downloadParticipantsDataCollectedData,
        name='download-collected-data'),
    url(r'^permitirrecolhas/([a-zA-Z0-9S]+)$', views.openDataCollection, name='open-data-collection'),
    url(r'^fecharrecolhas/([a-zA-Z0-9S]+)$', views.closeDataCollection, name='close-data-collection'),
    url(r'^arquivarquestionário/([a-zA-Z0-9S]+)$', views.archiveForm, name='archive-form'),
    url(r'^convidar', views.grantAccess, name='grant'),
    url(r'^descarregarparticipacoes/([a-zA-Z0-9S]+)$', views.downloadParticipantsDataCollectedData,
        name='download-xls'),  # after downloadDataCollectionRequest
    url(r'^clonarquestionario/([a-zA-Z0-9S]+)$', CloneFormView.as_view(), name='clone-form'),
    url(r'^editarquestionario/([a-zA-Z0-9S]+)$', EditFormView.as_view(), name='edit-form'),
    url(r'^editar', views.editFormRequest, name='edit-request'),
    url(r'^previsualizacao', PreviewFormView.as_view(), name='preview-form'),  # after editFormRequest
    url(r'^descarregar', views.downloadDataCollectionRequest, name='data-collection-request'),
    url(r'^verificaridparticipante', views.checkParticipantID, name='check-participant'),
    url(r'^verificartoken', views.checkTokenForParticipant, name='check-token'),
]
