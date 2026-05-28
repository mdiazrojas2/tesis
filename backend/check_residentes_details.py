import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from catastro.models import Residente
print("==== RESIDENTES ====")
for r in Residente.objects.all():
    print(f"Nombre: {r.nombre} {r.apellidos} | Correo: '{r.correo}' | Unidad: {r.unidad}")
print("====================")
