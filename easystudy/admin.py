from django.contrib import admin
from .models import Form, Permission, ParticipantInForm, ParticipantToken


class FormAdmin(admin.ModelAdmin):
    list_display = ["__str__", "formName", "statusType", "isArchived"]

    class Meta:
        model = Form


class PermissionAdmin(admin.ModelAdmin):
    list_display = ["__str__", "permissionType", "username", "idForm"]


class ParticipantInFormAdmin(admin.ModelAdmin):
    list_display = ["__str__", "idForm"]

class ParticipantTokenAdmin(admin.ModelAdmin):
    list_display = ["__str__", "idForm", "token"]


admin.site.register(Form, FormAdmin)
admin.site.register(Permission, PermissionAdmin)
admin.site.register(ParticipantInForm, ParticipantInFormAdmin)
admin.site.register(ParticipantToken, ParticipantTokenAdmin)
