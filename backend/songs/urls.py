
from django.urls import path

from .views import (
    health_check,
    ArtistListAPIView,
    ArtistDetailAPIView,
    SongListAPIView,
    SongDetailAPIView,
    CommunitySubmissionCreateAPIView,
)


urlpatterns = [
    path(
        "health/",
        health_check,
        name="health-check",
    ),
    path(
        "artists/",
        ArtistListAPIView.as_view(),
        name="artist-list",
    ),
    path(
        "artists/<int:pk>/",
        ArtistDetailAPIView.as_view(),
        name="artist-detail",
    ),
    path(
        "songs/",
        SongListAPIView.as_view(),
        name="song-list",
    ),
    path(
        "songs/<int:pk>/",
        SongDetailAPIView.as_view(),
        name="song-detail",
    ),
    path(
        "submissions/",
        CommunitySubmissionCreateAPIView.as_view(),
        name="community-submission",
    ),
]
