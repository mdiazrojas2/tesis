import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

if not User.objects.filter(username='admin').exists():
    user = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    user.rol = 'ADMIN'
    user.save()
    print("Admin user created successfully")
else:
    user = User.objects.get(username='admin')
    user.set_password('admin123')
    user.rol = 'ADMIN'
    user.save()
    print("Admin user updated with password admin123")
