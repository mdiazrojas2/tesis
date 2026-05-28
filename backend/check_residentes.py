import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from catastro.models import Residente, Unidad, Condominio
print(f"Condominios: {Condominio.objects.count()}")
print(f"Unidades: {Unidad.objects.count()}")
print(f"Residentes: {Residente.objects.count()}")
