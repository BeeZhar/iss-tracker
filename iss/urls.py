from . import views
from django.urls import path

urlpatterns = [
    path('', views.home, name='iss-home'),
    path('about', views.about, name='iss-about')
]