# issues/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IssueViewSet , TeamViewSet

router = DefaultRouter()
router.register(r'issues', IssueViewSet) # Registers /issues/ and /issues/{id}/
router.register(r'teams', TeamViewSet)

urlpatterns = [
    path('', include(router.urls)), # Includes all routes from IssueViewSet,
     path('my_issues/', IssueViewSet.as_view({'get': 'my_issues'}), name='my-issues')
]