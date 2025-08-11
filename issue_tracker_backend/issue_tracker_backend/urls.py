"""
URL configuration for issue_tracker_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# issue_tracker_backend/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls), # Django Admin interface

    # Djoser Authentication URLs
    # This includes core user endpoints like /auth/users/ (for registration),

    path('api/auth/', include('djoser.urls')),

    # Djoser JWT Authentication URLs
    # This includes JWT token endpoints like /auth/jwt/create/ (for login),
    # /auth/jwt/refresh/, /auth/jwt/verify/
    path('api/auth/', include('djoser.urls.jwt')),

    # Your Issue Tracker App APIs
    # This includes /api/issues/, /api/issues/{id}/, and custom actions like /api/issues/my_issues/
    path('api/', include('issues.urls')),

  
]
