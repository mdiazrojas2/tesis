import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from catastro.models import Condominio, Unidad, Residente, Notificacion
from catastro.utils import valida_nombre, valida_rut_chileno

# 1. PRUEBAS UNITARIAS (Lógica pura)
def test_valida_nombre_correcto():
    assert valida_nombre("Diego Troncoso") == True
    assert valida_nombre("María José") == True

def test_valida_nombre_incorrecto():
    assert valida_nombre("Diego123") == False
    assert valida_nombre("Marcela@!") == False

def test_valida_rut_correcto():
    # Usamos un RUT ficticio válido matemáticamente
    assert valida_rut_chileno("11111111-1") == False # 11111111-1 es inválido
    # RUTs ficticios pero correctos según algoritmo:
    assert valida_rut_chileno("12345678-5") == True
    
def test_valida_rut_incorrecto():
    assert valida_rut_chileno("12345678-9") == False

# 2. PRUEBAS DE INTEGRACIÓN (Base de datos y Señales ORM)
@pytest.mark.django_db
def test_creacion_residente_genera_notificacion():
    # Preparar base de datos
    condominio = Condominio.objects.create(nombre="Condominio Test", rut="11111111-1")
    unidad = Unidad.objects.create(condominio=condominio, numero_depto="101")
    
    # Crear residente (Esto debería gatillar la Señal post_save)
    residente = Residente.objects.create(
        unidad=unidad,
        rut="12345678-5",
        nombre="Juan",
        apellidos="Pérez",
        relacion="JEFE_HOGAR"
    )
    
    # Verificar que el residente se guardó
    assert Residente.objects.count() == 1
    
    # Verificar que el ORM generó automáticamente la notificación de registro
    notificaciones = Notificacion.objects.filter(unidad=unidad, titulo__icontains="registrado")
    assert notificaciones.count() == 1
    assert "Juan Pérez" in notificaciones.first().mensaje

# 3. PRUEBAS DE API Y SEGURIDAD PERIMETRAL (Endpoint Testing)
@pytest.mark.django_db
def test_endpoint_documentos_protegido_sin_token():
    client = APIClient()
    # Intentar acceder a la lista de documentos sin enviar token JWT
    url = reverse('documento-list') # Nombre del router en urls.py
    response = client.get(url)
    
    # Debe retornar 401 Unauthorized o 403 Forbidden
    assert response.status_code in [401, 403]

@pytest.mark.django_db
def test_endpoint_notificaciones_protegido_sin_token():
    client = APIClient()
    url = reverse('notificacion-list')
    response = client.get(url)
    
    assert response.status_code in [401, 403]
