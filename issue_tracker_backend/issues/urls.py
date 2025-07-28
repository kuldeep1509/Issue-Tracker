# issues/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IssueViewSet

router = DefaultRouter()
router.register(r'issues', IssueViewSet) # Registers /issues/ and /issues/{id}/

urlpatterns = [
    path('', include(router.urls)), # Includes all routes from IssueViewSet
]