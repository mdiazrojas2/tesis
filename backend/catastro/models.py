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
    fecha_vencimiento_plan_emergencia = models.DateField(null=True, blank=True)
    
    # Nuevos campos de configuración
    email_administracion = models.EmailField(blank=True, null=True)
    telefono_administracion = models.CharField(max_length=50, blank=True, null=True)
    notificar_vencimiento_datos = models.BooleanField(default=True)
    notificar_actualizacion_planes = models.BooleanField(default=True)
    plantilla_vencimiento = models.TextField(blank=True, null=True)
    plantilla_planes = models.TextField(blank=True, null=True)
    frecuencia_planes = models.CharField(max_length=50, choices=[('Anual', 'Anual'), ('Bianual', 'Bianual')], default='Anual')
    categorias_documentos = models.CharField(max_length=255, blank=True, null=True, help_text="Separadas por comas")

    def __str__(self):
        return self.nombre

class Unidad(models.Model):
    condominio = models.ForeignKey(Condominio, on_delete=models.CASCADE, related_name='unidades')
    torre = models.CharField(max_length=50, blank=True, null=True)
    numero_depto = models.CharField(max_length=50)

    class Meta:
        unique_together = ('condominio', 'torre', 'numero_depto')
        verbose_name_plural = 'Unidades'

    def __str__(self):
        return f"{self.torre if self.torre else 'Depto'} {self.numero_depto} - {self.condominio.nombre}"

class Residente(models.Model):
    class RelacionHogar(models.TextChoices):
        JEFE_HOGAR = 'JEFE_HOGAR', 'Jefe de Hogar'
        CONYUGE = 'CONYUGE', 'Cónyuge'
        ARRENDATARIO = 'ARRENDATARIO', 'Arrendatario'
        FAMILIAR_MENOR = 'FAMILIAR_MENOR', 'Familiar menor de edad'
        FAMILIAR_ADULTO = 'FAMILIAR_ADULTO', 'Familiar adulto'
        FAMILIAR_ADULTO_MAYOR = 'FAMILIAR_ADULTO_MAYOR', 'Familiar adulto mayor'
        OTRO = 'OTRO', 'Otro'

    unidad = models.ForeignKey(Unidad, on_delete=models.CASCADE, related_name='residentes')
    nombre = models.CharField(max_length=255)
    apellidos = models.CharField(max_length=255, blank=True, null=True)
    rut_dni = models.CharField(max_length=50, blank=True, null=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    nacionalidad = models.CharField(max_length=100, blank=True, null=True)
    idioma_principal = models.CharField(max_length=100, blank=True, null=True)
    relacion_jefe_hogar = models.CharField(
        max_length=30,
        choices=RelacionHogar.choices,
        default=RelacionHogar.JEFE_HOGAR,
        blank=True, null=True
    )
    
    telefono = models.CharField(max_length=50, blank=True, null=True)
    correo = models.EmailField(blank=True, null=True)
    
    # Info Médica
    condicion_medica = models.BooleanField(default=False)
    movilidad_reducida = models.BooleanField(default=False)
    requiere_asistencia_emergencia = models.BooleanField(default=False)
    
    detalles_salud_sensibles = CustomEncryptedTextField(
        blank=True, 
        null=True, 
        help_text="Ej: tipo de movilidad reducida, enfermedades crónicas."
    )
    
    # Contacto de Emergencia
    contacto_emergencia_nombre = models.CharField(max_length=255, blank=True, null=True)
    contacto_emergencia_parentesco = models.CharField(max_length=100, blank=True, null=True)
    contacto_emergencia_telefono = models.CharField(max_length=50, blank=True, null=True)
    contacto_emergencia_correo = models.EmailField(blank=True, null=True)
    
    recibir_notificaciones = models.BooleanField(default=True)
    fecha_ultima_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nombre} {self.apellidos or ''} - Unidad {self.unidad.numero_depto}"

class Documento(models.Model):
    condominio = models.ForeignKey(Condominio, on_delete=models.CASCADE, related_name='documentos')
    titulo = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)
    tipo_documento = models.CharField(max_length=100)
    version = models.CharField(max_length=50, blank=True, null=True)
    archivo = models.FileField(upload_to='documentos_condominio/')
    fecha_subida = models.DateTimeField(auto_now_add=True)
    fecha_emision = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"{self.titulo} (v{self.version})"

class Notificacion(models.Model):
    condominio = models.ForeignKey(Condominio, on_delete=models.CASCADE, related_name='notificaciones', null=True, blank=True)
    unidad = models.ForeignKey(Unidad, on_delete=models.CASCADE, related_name='notificaciones', null=True, blank=True)
    titulo = models.CharField(max_length=255)
    mensaje = models.TextField()
    tipo = models.CharField(max_length=100, default='Alerta')
    fecha = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=50, default='Pendiente')

    def __str__(self):
        return f"{self.titulo} - {self.estado}"

from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from datetime import timedelta
import os

@receiver(pre_save, sender=Documento)
def auto_delete_file_on_change(sender, instance, **kwargs):
    """Deletes old file from filesystem when corresponding Documento object is updated with new file."""
    if not instance.pk:
        return False
    try:
        old_file = Documento.objects.get(pk=instance.pk).archivo
    except Documento.DoesNotExist:
        return False

    new_file = instance.archivo
    if old_file and not old_file == new_file:
        if os.path.isfile(old_file.path):
            os.remove(old_file.path)

@receiver(post_save, sender=Documento)
def notify_documento_saved(sender, instance, created, **kwargs):
    # Notificación general de creación/actualización
    accion = "subido" if created else "actualizado"
    Notificacion.objects.create(
        condominio=instance.condominio,
        titulo=f"Documento {accion}",
        mensaje=f"El documento '{instance.titulo}' (v{instance.version or '1.0'}) ha sido {accion}.",
        tipo="Informativa",
        estado="Enviada"
    )
    
    # Enviar correo a todos los residentes sobre nuevo documento o nueva versión
    from .utils import get_all_resident_emails, send_email_async
    correos = get_all_resident_emails(instance.condominio)
    send_email_async(
        subject=f"Documento {accion}: {instance.titulo}",
        message=f"Estimados residentes,\n\nSe ha {accion} el documento '{instance.titulo}' (versión {instance.version or '1.0'}). Ya puede revisarlo en su portal de Catastro.",
        recipient_list=correos
    )

    # Lógica original: vencimiento Plan de Emergencia
    if instance.tipo_documento and 'plan de emergencia' in instance.tipo_documento.lower():
        if instance.fecha_emision:
            fecha_vencimiento = instance.fecha_emision + timedelta(days=365)
            identificador = f"El documento '{instance.titulo}'"
            Notificacion.objects.filter(
                condominio=instance.condominio,
                mensaje__startswith=identificador,
                estado="Pendiente"
            ).delete()
            Notificacion.objects.create(
                condominio=instance.condominio,
                titulo="Vencimiento Plan de Emergencia",
                mensaje=f"{identificador} (Plan de Emergencia) fue emitido el {instance.fecha_emision} y vencerá el {fecha_vencimiento}.",
                tipo="Alerta",
                estado="Pendiente"
            )

@receiver(post_delete, sender=Documento)
def notify_documento_deleted(sender, instance, **kwargs):
    # Delete physical file
    if instance.archivo:
        if os.path.isfile(instance.archivo.path):
            os.remove(instance.archivo.path)
            
    Notificacion.objects.create(
        condominio=instance.condominio,
        titulo="Documento eliminado",
        mensaje=f"El documento '{instance.titulo}' ha sido eliminado del sistema.",
        tipo="Informativa",
        estado="Enviada"
    )

@receiver(post_save, sender=Residente)
def notify_residente_saved(sender, instance, created, **kwargs):
    accion = "registrado" if created else "actualizado"
    # El residente pertenece a una unidad, y la unidad a un condominio
    condominio = instance.unidad.condominio if instance.unidad else None
    Notificacion.objects.create(
        condominio=condominio,
        unidad=instance.unidad,
        titulo=f"Residente {accion}",
        mensaje=f"El residente {instance.nombre} {instance.apellidos or ''} ha sido {accion} en la Unidad {instance.unidad.numero_depto if instance.unidad else 'Desconocida'}.",
        tipo="Informativa",
        estado="Enviada"
    )
    
    from .utils import send_email_async
    if instance.correo:
        send_email_async(
            subject=f"Su perfil ha sido {accion}",
            message=f"Estimado/a {instance.nombre},\n\nSus datos de residente han sido {accion} exitosamente en el sistema.",
            recipient_list=[instance.correo]
        )

@receiver(post_delete, sender=Residente)
def notify_residente_deleted(sender, instance, **kwargs):
    condominio = instance.unidad.condominio if instance.unidad else None
    Notificacion.objects.create(
        condominio=condominio,
        unidad=instance.unidad,
        titulo="Residente eliminado",
        mensaje=f"El residente {instance.nombre} {instance.apellidos or ''} (Unidad {instance.unidad.numero_depto if instance.unidad else 'Desconocida'}) ha sido eliminado.",
        tipo="Informativa",
        estado="Enviada"
    )

