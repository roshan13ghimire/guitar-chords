
import re

from django import forms

from .models import ChordArrangement


CHORD_TAG_PATTERN = re.compile(
    r"\[([^\[\]\r\n]+)\]"
)

SUPPORTED_CHORD_PATTERN = re.compile(
    r"^[A-G](?:#|b)?"
    r"(?:maj7|m7|sus2|sus4|add9|dim|aug|m|7)?"
    r"(?:/[A-G](?:#|b)?)?$"
)


class ChordArrangementAdminForm(forms.ModelForm):
    class Meta:
        model = ChordArrangement
        fields = "__all__"

        widgets = {
            "chord_content": forms.Textarea(
                attrs={
                    "rows": 16,
                    "spellcheck": "false",
                    "placeholder": (
                        "[G]साँझ पर्दा [D]मनले सम्झन्छ\n"
                        "[Em]मीठो सपना [C]फेरि देख्छ"
                    ),
                }
            ),
            "source_notes": forms.Textarea(
                attrs={
                    "rows": 4,
                    "placeholder": (
                        "Describe where the sheet came from "
                        "and what rights allow publication."
                    ),
                }
            ),
            "review_notes": forms.Textarea(
                attrs={
                    "rows": 4,
                    "placeholder": (
                        "Internal review comments: "
                        "incorrect chords, missing attribution, "
                        "rights questions, etc."
                    ),
                }
            ),
        }

    def clean_chord_content(self):
        content = self.cleaned_data.get(
            "chord_content", ""
        )

        content = (
            content
            .replace("\r\n", "\n")
            .strip()
        )

        if not content:
            raise forms.ValidationError(
                "Chord content cannot be empty."
            )

        tags = CHORD_TAG_PATTERN.findall(content)

        remaining = CHORD_TAG_PATTERN.sub(
            "",
            content,
        )

        if "[" in remaining or "]" in remaining:
            raise forms.ValidationError(
                "Chord brackets are not properly paired. "
                "Use notation such as [G] or [Am]."
            )

        if not tags:
            raise forms.ValidationError(
                "Include at least one chord, for example [G]."
            )

        invalid_tags = [
            tag
            for tag in tags
            if not SUPPORTED_CHORD_PATTERN.fullmatch(
                tag.strip()
            )
        ]

        if invalid_tags:
            raise forms.ValidationError(
                "Unsupported chord tag: "
                f"[{invalid_tags[0]}]. "
                "Use supported chords such as "
                "[G], [Am], [D7], [Cmaj7], or [D/F#]."
            )

        return content

    def clean(self):
        cleaned_data = super().clean()

        verified = cleaned_data.get(
            "is_verified"
        )

        source_notes = cleaned_data.get(
            "source_notes", ""
        )

        if (
            verified
            and not (source_notes or "").strip()
        ):
            self.add_error(
                "source_notes",
                "Record the source and rights information "
                "before marking the arrangement verified.",
            )

        return cleaned_data
