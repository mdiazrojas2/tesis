import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from catastro.models import Unidad
print('Total Unidades:', Unidad.objects.count())
print('With __in=[None, ""]:', Unidad.objects.filter(torre__in=[None, '']).count())
print('With isnull=True:', Unidad.objects.filter(torre__isnull=True).count())
