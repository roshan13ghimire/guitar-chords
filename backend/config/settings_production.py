
"""
Production settings for Guitar Chords.

This file extends the existing development settings.
Local development continues to use config.settings.

Activate with:
    DJANGO_SETTINGS_MODULE=config.settings_production
"""

from urllib.parse import urlsplit

from decouple import config as env
from django.core.exceptions import ImproperlyConfigured

from .settings import *


def required_env(name):
    value = env(name, default="")

    if not isinstance(value, str) or not value.strip():
        raise ImproperlyConfigured(
            f"Missing required production setting: {name}"
        )

    return value.strip()


def comma_separated(name, required=False):
    raw = (
        required_env(name)
        if required
        else env(name, default="")
    )

    return [
        item.strip()
        for item in raw.split(",")
        if item.strip()
    ]


def https_origins(name):
    origins = comma_separated(name)

    for origin in origins:
        parsed = urlsplit(origin)

        if (
            parsed.scheme != "https"
            or not parsed.hostname
            or parsed.username
            or parsed.password
            or parsed.path
            or parsed.query
            or parsed.fragment
        ):
            raise ImproperlyConfigured(
                f"{name} must contain HTTPS origins "
                "without paths or trailing slashes."
            )

    return origins


# --------------------------------------------------
# 1. Production environment
# --------------------------------------------------

if env("DJANGO_ENV", default="") != "production":
    raise ImproperlyConfigured(
        "Production settings require DJANGO_ENV=production."
    )


# --------------------------------------------------
# 2. Security
# --------------------------------------------------

DEBUG = False

SECRET_KEY = required_env(
    "DJANGO_PRODUCTION_SECRET_KEY"
)

if (
    len(SECRET_KEY) < 50
    or "REPLACE" in SECRET_KEY.upper()
):
    raise ImproperlyConfigured(
        "Configure a strong production SECRET_KEY."
    )


ALLOWED_HOSTS = comma_separated(
    "DJANGO_ALLOWED_HOSTS",
    required=True,
)

for host in ALLOWED_HOSTS:
    if (
        "*" in host
        or "://" in host
        or "/" in host
        or any(character.isspace() for character in host)
    ):
        raise ImproperlyConfigured(
            "Configure explicit production hostnames only."
        )


SECURE_SSL_REDIRECT = True

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

SESSION_COOKIE_HTTPONLY = True

SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"

SECURE_CONTENT_TYPE_NOSNIFF = True

SECURE_REFERRER_POLICY = "same-origin"

SECURE_CROSS_ORIGIN_OPENER_POLICY = "same-origin"

X_FRAME_OPTIONS = "DENY"


# Enable HSTS only after actual HTTPS deployment
# is verified on your production domain.

SECURE_HSTS_SECONDS = env(
    "DJANGO_HSTS_SECONDS",
    default=0,
    cast=int,
)

if SECURE_HSTS_SECONDS < 0:
    raise ImproperlyConfigured(
        "HSTS duration cannot be negative."
    )

SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False


# Only trust forwarded HTTPS headers from
# a correctly configured reverse proxy.

if env(
    "DJANGO_TRUST_PROXY_SSL_HEADER",
    default=False,
    cast=bool,
):
    SECURE_PROXY_SSL_HEADER = (
        "HTTP_X_FORWARDED_PROTO",
        "https",
    )
else:
    SECURE_PROXY_SSL_HEADER = None


# --------------------------------------------------
# 3. CORS and CSRF
# --------------------------------------------------

CORS_ALLOW_ALL_ORIGINS = False

CORS_ALLOWED_ORIGINS = https_origins(
    "DJANGO_CORS_ALLOWED_ORIGINS"
)

CORS_ALLOW_CREDENTIALS = False

CORS_URLS_REGEX = r"^/api/"

CSRF_TRUSTED_ORIGINS = https_origins(
    "DJANGO_CSRF_TRUSTED_ORIGINS"
)


# --------------------------------------------------
# 4. Email
# --------------------------------------------------

# Email is deliberately disabled.
#
# Configure a real email provider before enabling
# features that depend on outbound email.
#
# Django will report mail.W001 until then.

MAILERS = {}


# --------------------------------------------------
# 5. PostgreSQL
# --------------------------------------------------

# Database settings are inherited from settings.py.
#
# Production must provide separate:
# DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT.


# --------------------------------------------------
# 6. Shared Redis cache
# --------------------------------------------------

# Required for sharing DRF throttle counters
# across multiple Django worker processes.

REDIS_URL = required_env(
    "DJANGO_REDIS_URL"
)

if urlsplit(REDIS_URL).scheme not in (
    "redis",
    "rediss",
):
    raise ImproperlyConfigured(
        "DJANGO_REDIS_URL must use "
        "redis:// or rediss://."
    )

CACHES = {
    "default": {
        "BACKEND": (
            "django.core.cache.backends.redis.RedisCache"
        ),
        "LOCATION": REDIS_URL,
        "TIMEOUT": 300,
    }
}


# --------------------------------------------------
# 7. Static files
# --------------------------------------------------

STATIC_ROOT = BASE_DIR / "staticfiles"


# --------------------------------------------------
# 8. REST API
# --------------------------------------------------

REST_FRAMEWORK = {
    **globals().get("REST_FRAMEWORK", {}),
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
}
