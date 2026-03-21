from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from .models import Residente, Condominio
import logging

logger = logging.getLogger(__name__)

@shared_task
def alertar_vencimientos_y_desactualizaciones():
    hoy = timezone.localdate()
    
    # 1. Alerta: Planes por vencer (< 30 días)
    fecha_limite = hoy + timedelta(days=30)
    condominios_vencen = Condominio.objects.filter(
        fecha_vencimiento_plan_emergencia__lte=fecha_limite,
        fecha_vencimiento_plan_emergencia__gte=hoy
    )

    for c in condominios_vencen:
        mensaje = f"URGENTE: El plan de emergencia del condominio {c.nombre} vence el {c.fecha_vencimiento_plan_emergencia}."
        send_mail(
            subject='Alerta - Vencimiento de Plan de Emergencia',
            message=mensaje,
            from_email='sistema@catastroemergenciacl.cl',
            recipient_list=['administracion@condominio.cl'],
            fail_silently=False,
        )
        logger.info(f"Alerta enviada: {c.nombre}")

    # 2. Alerta: Residentes desactualizados (> 1 Año)
    limite_actualizacion = timezone.now() - timedelta(days=365)
    residentes_desactualizados = Residente.objects.filter(
        fecha_ultima_actualizacion__lt=limite_actualizacion
    ).exclude(correo__isnull=True).exclude(correo__exact='')

    for r in residentes_desactualizados:
        mensaje = (
            f"Estimado(a) {r.nombre},\n\n"
            f"Han pasado más de 12 meses desde la última vez que revisó sus datos.\n"
            f"Actualice sus datos a la brevedad."
        )
        send_mail(
            subject='Actualización Anual Requerida',
            message=mensaje,
            from_email='sistema@catastroemergenciacl.cl',
            recipient_list=[r.correo],
            fail_silently=False,
        )
        logger.info(f"Alerta enviada a: {r.correo}")
