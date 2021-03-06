from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from easystudy.forms import UserLoginForm, UserRegistrationForm
from django.views import View

try:
    from BytesIO import BytesIO
except ImportError:
    from io import BytesIO


# ######################################################################## #
# For user login.
# ######################################################################## #
class UserLoginView(View):
    form_class = UserLoginForm
    template_name = "authentication/login_form.html"

    # display blank form
    def get(self, request):
        if request.session.has_key('username'):  # if the user is already logged, it is immediately redirected
            return redirect('home')

        else:
            form = self.form_class(None)
            return render(request, self.template_name, {'form': form})

    # process form data
    def post(self, request):
        form = self.form_class(request.POST)

        if form.is_valid():
            username = form.cleaned_data.get("username")
            password = form.cleaned_data.get("password")

            user = authenticate(username=username, password=password)
            login(request, user)

            # redirect
            if request.user.is_authenticated():
                request.session['username'] = username  # saves the username in the session
                return redirect('home')

        return render(request, self.template_name, {'form': form})


# ######################################################################## #
# For user registration.
# ######################################################################## #
class UserRegisterView(View):
    template_name = "authentication/register_form.html"

    # display blank form
    def get(self, request):
        if request.session.has_key('username'):
            return redirect('home')

        else:
            form = UserRegistrationForm()
            return render(request, self.template_name, {'form': form})

    # process form data
    def post(self, request):
        form = UserRegistrationForm(request.POST)

        if form.is_valid():
            form.save()
            return redirect('home')

        return render(request, self.template_name, {'form': form})
