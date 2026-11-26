
from rest_framework.routers import DefaultRouter

from chords.views import ChordViewSet
from songs.views import ArtistViewSet, SongViewSet


router = DefaultRouter()

router.register(
    "songs",
    SongViewSet,
    basename="song",
)

router.register(
    "artists",
    ArtistViewSet,
    basename="artist",
)

router.register(
    "chords",
    ChordViewSet,
    basename="chord",
)

urlpatterns = router.urls
