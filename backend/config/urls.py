
from django.contrib import admin
from django.urls import include, path

from rest_framework.decorators import (
    api_view,
    permission_classes,
)
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):

    return Response({
        "status": "ok",
        "service": "Guitar Chords API",
        "version": "1.0.0",
    })


urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/health/", health_check, name="health-check"),

    path(
        "api/schema/",
        SpectacularAPIView.as_view(),
        name="schema",
    ),

    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),

    path(
        "api/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),

    path("api/", include("config.api_urls")),
]


admin.site.site_header = "Guitar Chords Administration"
admin.site.site_title = "Guitar Chords Admin"
admin.site.index_title = "Song and Chord Management"
