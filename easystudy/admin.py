from django.contrib import admin
from .models import Form, Permission, ParticipantInForm, ParticipantToken, UserNotification, FormSpecialConfigs


# ######################################################################## #
# Forms
# ######################################################################## #
class FormAdmin(admin.ModelAdmin):
    list_display = ["__str__", "formName", "statusType", "isArchived"]

    class Meta:
        model = Form


# ######################################################################## #
# Permissions associated to the edition of the form
# ######################################################################## #
class PermissionAdmin(admin.ModelAdmin):
    list_display = ["__str__", "permissionType", "username", "idForm"]


# ######################################################################## #
# Participants associated to the form
# ######################################################################## #
class ParticipantInFormAdmin(admin.ModelAdmin):
    list_display = ["__str__", "idForm"]


# ######################################################################## #
# Tokens for participants at distance
# ######################################################################## #
class ParticipantTokenAdmin(admin.ModelAdmin):
    list_display = ["__str__", "idForm", "token"]


# ######################################################################## #
# Notifications for users
# ######################################################################## #
class UserNotificationAdmin(admin.ModelAdmin):
    list_display = ["__str__", "username", "message", "severityLevel", "idForm"]


# ######################################################################## #
# Special Configurations associated with a form
# ######################################################################## #
class FormSpecialConfigsAdmin(admin.ModelAdmin):
    list_display = ["__str__", "idForm", "idTrialForm", "scaleExplained"]


admin.site.register(Form, FormAdmin)
admin.site.register(Permission, PermissionAdmin)
admin.site.register(ParticipantInForm, ParticipantInFormAdmin)
admin.site.register(ParticipantToken, ParticipantTokenAdmin)
admin.site.register(UserNotification, UserNotificationAdmin)
admin.site.register(FormSpecialConfigs, FormSpecialConfigsAdmin)
