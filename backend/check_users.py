import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
print("==== USUARIOS REGISTRADOS ====")
for u in User.objects.all():
    print(f"Username: {u.username} | Email: {u.email} | Rol: {u.rol}")
print("================================")
