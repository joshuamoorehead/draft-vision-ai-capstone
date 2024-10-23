from django.urls import path
from . import views

urlpatterns = [
    path('', views.compare_players, name='compare_players'),
    path('result/', views.compare_players, name='result')
]