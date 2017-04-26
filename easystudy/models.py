from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import JSONField


# ######################################################################## #
# Forms
# ######################################################################## #
class Form(models.Model):
    STATUS_TYPE = (
        ('O', 'Open'),
        ('C', 'Closed'),
    )
    IS_ARCHIVED = (
        ('Y', 'Yes'),
        ('N', 'No')
    )
    idForm = models.CharField(max_length=100, primary_key=True)
    formName = models.CharField(max_length=100, blank=False, null=True)
    formConfig = JSONField()
    formThumbnail = models.TextField(blank=True, null=True)
    statusType = models.CharField(max_length=1, choices=STATUS_TYPE, default='C')
    isArchived = models.CharField(max_length=1, choices=IS_ARCHIVED, default='N')

    def __str__(self):
        return self.idForm


# ######################################################################## #
# Permissions associated to the edition of the form
# ######################################################################## #
class Permission(models.Model):
    PERMISSION_TYPE = (
        ('O', 'Owner'),
        ('R', 'Reader'),
    )
    idPermission = models.AutoField(primary_key=True)
    username = models.ForeignKey(User, on_delete=models.CASCADE)
    idForm = models.ForeignKey(Form, on_delete=models.CASCADE)
    permissionType = models.CharField(max_length=1, choices=PERMISSION_TYPE, default='R')

    class Meta:
        unique_together = ('username', 'permissionType', 'idForm',)

    def __str__(self):
        return str(self.idPermission)


# ######################################################################## #
# Participants associated to the form
# ######################################################################## #
class ParticipantInForm(models.Model):
    idParticipantInForm = models.AutoField(primary_key=True)
    idParticipant = models.CharField(max_length=100)  # the same participant id can be used in more than one study
    idForm = models.ForeignKey(Form, on_delete=models.CASCADE)
    dataCollection = JSONField()

    class Meta:
        unique_together = (
        'idParticipant', 'idForm',)  # makes sure there is not more than one participant in a form with the same ID

    def __str__(self):
        return str(self.idParticipant)


# ######################################################################## #
# Tokens for participants at distance
# ######################################################################## #
class ParticipantToken(models.Model):
    idParticipantToken = models.AutoField(primary_key=True)
    idForm = models.ForeignKey(Form, on_delete=models.CASCADE)
    idFutureParticipant = models.CharField(max_length=100, default="p000")
    token = models.CharField(max_length=50)

    class Meta:
        unique_together = ('idForm', 'idFutureParticipant',) # makes sure there is not more than one token for a participant in a form

    def __str__(self):
        return str(self.idFutureParticipant)

# ######################################################################## #
# Notifications for users
# ######################################################################## #
class UserNotification(models.Model):
    SEVERITY_LEVEL = (
        ('I', 'Info'),
        ('D', 'Danger'),
        ('W', 'Warning'),
    )

    idUserNotification = models.AutoField(primary_key=True)
    username = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField(blank=True, null=True)
    severityLevel = models.CharField(max_length=1, choices=SEVERITY_LEVEL, default='I')

    def __str__(self):
        return str(self.idUserNotification)
