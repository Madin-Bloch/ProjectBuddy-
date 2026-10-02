from django.urls import path
from . import views

urlpatterns = [
    path("login/", views.login),
    path("students/", views.students),
    path("papers/", views.papers),
    path("attempts/", views.attempts),
]
