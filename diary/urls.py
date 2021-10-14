from django.urls import path
from . import views


url_name = 'diary'

urlpatterns = [
    path('articles/', views.article_list),
    path('articles/<int:article_pk>', views.article_detail),
    path('articles/<int:article_pk>/comments', views.comment_list),
]
