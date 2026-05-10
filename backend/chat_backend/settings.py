# chat_backend/settings.py

import os 
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-for-local-dev')

<<<<<<< HEAD
DEBUG = os.environ.get('DEBUG', 'True') == 'True'

# ✅ FIXED - Added localhost and render domain
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '.onrender.com',         # ✅ your Render backend
    'chatapp-2o81.onrender.com',  # ✅ your exact Render URL
    os.environ.get('ALLOWED_HOST', ''),
=======
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '.onrender.com',
    'chatapp-2081.onrender.com',
>>>>>>> 8b1ca51a41c0348b9df2e00b039ca17bdbdd7d6b
]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'chat',
]

# ✅ FIXED - CorsMiddleware must be FIRST
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',        # ✅ Moved to FIRST position
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'chat_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'chat_backend.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ✅ Added STATIC_ROOT for production
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ✅ FIXED - Added localhost to CORS as well
CORS_ALLOWED_ORIGINS = [
    "https://normal-chat-app.netlify.app",  # ✅ your Netlify frontend
    "http://localhost:5173",                        # ✅ local React dev
    "http://localhost:3000",                        # ✅ alternate local port
    "http://127.0.0.1:5173",                       # ✅ alternate localhost format
]

# ✅ Allow auth headers to pass through CORS
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_ALLOW_CREDENTIALS = True

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

# ✅ JWT token lifetime settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}