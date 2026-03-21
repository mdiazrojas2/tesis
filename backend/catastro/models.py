from django.db import models
from django.contrib.auth.models import AbstractUser
from cryptography.fernet import Fernet
from django.conf import settings
import base64

def get_cipher():
    key = settings.SECRET_KEY.encode('utf-8')[:32].ljust(32, b'A')
    return Fernet(base64.urlsafe_b64encode(key))

class CustomEncryptedTextField(models.TextField):
    def get_prep_value(self, value):
        if value is None or value == '':
            return value
        return get_cipher().encrypt(str(value).encode('utf-8')).decode('utf-8')

    def from_db_value(self, value, expression, connection):
        if value is None or value == '':
            return value
        try:
            return get_cipher().decrypt(value.encode('utf-8')).decode('utf-8')
        except Exception:
            return value

class Usuario(AbstractUser):
    class Roles(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrador'
        CONSERJE = 'CONSERJE', 'Conserje'
        RESIDENTE = 'RESIDENTE', 'Residente'

    rol = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default=Roles.RESIDENTE
    )

    def __str__(self):
        return f"{self.username} ({self.get_rol_display()})"

class Condominio(models.Model):
    nombre = models.CharField(max_length=255)
    direccion = models.CharField(max_length=255)
    fecha_vencimiento_plan_emergencia = models.DateField()

    def __str__(self):
        return self.nombre

class Unidad(models.Model):
    condominio = models.ForeignKey(Condominio, on_delete=models.CASCADE, related_name='unidades')
    numero_depto = models.CharField(max_length=50)

    class Meta:
        unique_together = ('condominio', 'numero_depto')
        verbose_name_plural = 'Unidades'

    def __str__(self):
        return f"Depto {self.numero_depto} - {self.condominio.nombre}"

class Residente(models.Model):
    class TipoResidente(models.TextChoices):
        PROPIETARIO = 'PROPIETARIO', 'Propietario'
        ARRENDATARIO = 'ARRENDATARIO', 'Arrendatario'

    unidad = models.ForeignKey(Unidad, on_delete=models.CASCADE, related_name='residentes')
    nombre = models.CharField(max_length=255)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    correo = models.EmailField(blank=True, null=True)
    tipo = models.CharField(max_length=20, choices=TipoResidente.choices)
    
    requiere_asistencia_emergencia = models.BooleanField(default=False)
    
    # Campo CIFRADO a nivel de base de datos usando implementación custom compatible con Django 6
    detalles_salud_sensibles = CustomEncryptedTextField(
        blank=True, 
        null=True, 
        help_text="Ej: movilidad reducida, 3ra edad, infantes."
    )
    
    fecha_ultima_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nombre} - Unidad {self.unidad.numero_depto}"
