
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .models import Chord
from .serializers import ChordSerializer


class ChordViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = Chord.objects.all()

    serializer_class = ChordSerializer

    permission_classes = [AllowAny]

    lookup_field = "slug"

    filterset_fields = [
        "category",
    ]

    search_fields = [
        "name",
        "description",
    ]

    ordering_fields = [
        "name",
        "category",
    ]

    ordering = ["name", "id"]
