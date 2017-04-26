from django import forms
from django.contrib.auth import (authenticate, get_user_model, )
from django.contrib.auth.forms import UserCreationForm

User = get_user_model()


# ######################################################################## #
# User login form.
# ######################################################################## #
class UserLoginForm(forms.Form):
    username = forms.CharField(label="Nome de utilizador")
    password = forms.CharField(widget=forms.PasswordInput, label="Palavra-passe")

    def clean(self, *args, **kwargs):
        username = self.cleaned_data.get("username")
        password = self.cleaned_data.get("password")
        user = authenticate(username=username, password=password)

        if not user:
            raise forms.ValidationError("O conjunto de credenciais que inseriu não está correto.")

        if not user.check_password(password):
            raise forms.ValidationError("A palavra-passe que inseriu não está correta.")

        if not user.is_active:
            raise forms.ValidationError("Este utilizador já não se encontra ativo.")

        return super(UserLoginForm, self).clean(*args, **kwargs)


# ######################################################################## #
# Registration form.
# https://docs.djangoproject.com/en/1.8/_modules/django/contrib/auth/forms/
# ######################################################################## #
class UserRegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True)

    error_messages = {
        'duplicate_username': ("Já existe um utilizador com esse nome."),
        'password_mismatch': ("As duas palavras-passe não são iguais.")
    }

    class Meta:
        model = User
        fields = ('username',
                  'first_name',
                  'last_name',
                  'email',
                  'password1',
                  'password2')

    def clean_username(self):
        username = self.cleaned_data["username"]

        try:
            User._default_manager.get(username=username)

            # if the user exists, then let's raise an error message
            raise forms.ValidationError(
                self.error_messages['duplicate_username'],  # user my customized error message
                code='duplicate_username',  # set the error message key
            )

        except User.DoesNotExist:
            return username  # great, this user does not exist so we can continue the registration process

    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")

        if password1 and password2 and password1 != password2:
            raise forms.ValidationError(
                self.error_messages['password_mismatch'],
                code='password_mismatch',
            )

        return password2

    def save(self, commit=True):
        user = super(UserRegistrationForm, self).save(commit=False)
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']
        user.email = self.cleaned_data['email']

        if commit:
            user.save()

        return user
