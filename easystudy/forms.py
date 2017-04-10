from django import forms
from django.contrib.auth import (
    authenticate,
    get_user_model,
)

User = get_user_model()

# for user login
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
