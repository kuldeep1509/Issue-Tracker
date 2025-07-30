# issue_tracker_backend/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from issues.views import IssueViewSet, TeamViewSet # Import TeamViewSet

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'issues', IssueViewSet)
router.register(r'teams', TeamViewSet) # NEW: Register TeamViewSet

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('djoser.urls')),
    path('api/auth/', include('djoser.urls.jwt')), # Use JWT URLs for token creation/refresh
    path('api/', include(router.urls)), # Include the router URLs under /api/
]