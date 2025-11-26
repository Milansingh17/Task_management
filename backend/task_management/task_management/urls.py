"""
URL configuration for task_management project.

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
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="Task Management API",
        default_version='v1',
        description="Complete Task Management System with Authentication and Audit Logs",
        terms_of_service="https://www.example.com/terms/",
        contact=openapi.Contact(email="contact@taskmanagement.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

def root_health(_request):
    """Simple root endpoint so platform probes don't 404."""
    return JsonResponse({"status": "ok", "message": "Task Management API"})


def api_index(_request):
    """Provide human-friendly guidance when someone browses to /api."""
    return JsonResponse(
        {
            "message": "Task Management API",
            "endpoints": {
                "auth": {
                    "register": {"url": "/api/auth/register/", "method": "POST"},
                    "login": {"url": "/api/auth/login/", "method": "POST"},
                },
                "tasks": "/api/tasks/",
                "logs": "/api/logs/",
                "docs": {
                    "swagger": "/swagger/",
                    "redoc": "/redoc/",
                },
            },
        }
    )


urlpatterns = [
    path('', root_health, name='root-health'),
    path('api/', api_index, name='api-index'),
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # API endpoints
    path('api/auth/', include('apps.authentication.urls')),
    path('api/tasks/', include('apps.tasks.urls')),
    path('api/logs/', include('apps.audit.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)