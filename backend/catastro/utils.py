import threading
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
from .models import Documento, Residente, Notificacion

def send_email_async(subject, message, recipient_list):
    if not recipient_list:
        return
    def send():
        try:
            send_mail(subject, message, None, recipient_list, fail_silently=True)
        except Exception as e:
            print(f"Error enviando correo: {e}")
    threading.Thread(target=send, daemon=True).start()

def get_all_resident_emails(condominio=None):
    qs = Residente.objects.filter(correo__isnull=False).exclude(correo='')
    if condominio:
        qs = qs.filter(unidad__condominio=condominio)
    return list(qs.values_list('correo', flat=True))

def check_vencimientos_sistema():
    """Evalúa fechas y crea notificaciones al vuelo si no existen."""
    ahora = timezone.now().date()
    
    # 1. Residentes: 6 meses sin actualizar (Vencido) o 5 meses (Por vencer) o info incompleta
    for r in Residente.objects.all():
        # Check incompletos
        if not r.contacto_emergencia_telefono or not r.contacto_emergencia_correo:
            # Crear notif si no existe una reciente (en el último mes) para este residente sobre esto
            reciente = Notificacion.objects.filter(
                unidad=r.unidad,
                titulo__icontains="Información incompleta",
                fecha__gte=timezone.now() - timedelta(days=30)
            ).exists()
            if not reciente:
                Notificacion.objects.create(
                    condominio=r.unidad.condominio,
                    unidad=r.unidad,
                    titulo=f"Información incompleta: {r.nombre}",
                    mensaje="Falta información de contacto de emergencia en su ficha.",
                    tipo="Alerta",
                    estado="Pendiente"
                )
                if r.correo:
                    send_email_async("Actualice su información", "Estimado residente, por favor complete su contacto de emergencia.", [r.correo])

        # Check actualización
        if r.fecha_ultima_actualizacion:
            dias_desde_act = (ahora - r.fecha_ultima_actualizacion.date()).days
            if dias_desde_act >= 180: # 6 meses
                reciente = Notificacion.objects.filter(unidad=r.unidad, titulo__icontains="Datos Vencidos", fecha__gte=timezone.now() - timedelta(days=30)).exists()
                if not reciente:
                    Notificacion.objects.create(
                        condominio=r.unidad.condominio, unidad=r.unidad,
                        titulo=f"Datos Vencidos: {r.nombre}",
                        mensaje=f"Lleva más de 6 meses sin actualizar sus datos.", tipo="Alerta", estado="Pendiente"
                    )
                    if r.correo:
                        send_email_async("Sus datos están vencidos", "Estimado residente, debe actualizar sus datos obligatoriamente.", [r.correo])
            elif dias_desde_act >= 150: # 5 meses
                reciente = Notificacion.objects.filter(unidad=r.unidad, titulo__icontains="Próximo a Vencer", fecha__gte=timezone.now() - timedelta(days=30)).exists()
                if not reciente:
                    Notificacion.objects.create(
                        condominio=r.unidad.condominio, unidad=r.unidad,
                        titulo=f"Datos Próximos a Vencer: {r.nombre}",
                        mensaje=f"Queda un mes para que sus datos se consideren vencidos.", tipo="Alerta", estado="Pendiente"
                    )
                    if r.correo:
                        send_email_async("Actualización próxima", "En un mes vencerá la validez de sus datos. Por favor actualícelos.", [r.correo])

    # 2. Documentos: Vencido o a 1 mes
    for d in Documento.objects.filter(tipo_documento__icontains="plan de emergencia"):
        if d.fecha_emision:
            vencimiento = d.fecha_emision + timedelta(days=365)
        else:
            vencimiento = d.fecha_subida.date() + timedelta(days=365)
        
        dias_restantes = (vencimiento - ahora).days
        if dias_restantes < 0:
            # Ya venció
            reciente = Notificacion.objects.filter(titulo__icontains="Plan Vencido", mensaje__icontains=d.titulo).exists()
            if not reciente:
                Notificacion.objects.create(
                    condominio=d.condominio,
                    titulo=f"Plan Vencido: {d.titulo}",
                    mensaje=f"El documento '{d.titulo}' se encuentra vencido desde el {vencimiento}.",
                    tipo="Alerta", estado="Pendiente"
                )
                # Enviar correo a todos
                send_email_async("Plan de Emergencia Vencido", f"El plan '{d.titulo}' ha vencido.", get_all_resident_emails(d.condominio))
        elif dias_restantes <= 30:
            reciente = Notificacion.objects.filter(titulo__icontains="Próximo Vencimiento Plan", mensaje__icontains=d.titulo).exists()
            if not reciente:
                Notificacion.objects.create(
                    condominio=d.condominio,
                    titulo=f"Próximo Vencimiento Plan: {d.titulo}",
                    mensaje=f"Faltan {dias_restantes} días para que venza el plan '{d.titulo}'.",
                    tipo="Alerta", estado="Pendiente"
                )
                send_email_async("Plan próximo a vencer", f"Faltan {dias_restantes} días para que venza el plan '{d.titulo}'.", get_all_resident_emails(d.condominio))

import re

def valida_rut_chileno(rut):
    if not rut or type(rut) != str:
        return False
        
    rut = rut.upper().replace("-", "").replace(".", "")
    if len(rut) < 2:
        return False
        
    aux = rut[:-1]
    dv = rut[-1]

    if not aux.isdigit():
        return False
        
    revertido = map(int, reversed(str(aux)))
    factors = [2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7]
    s = sum(d * f for d, f in zip(revertido, factors))
    res = 11 - (s % 11)

    if res == 11:
        dv_esperado = '0'
    elif res == 10:
        dv_esperado = 'K'
    else:
        dv_esperado = str(res)

    return dv == dv_esperado

def valida_nombre(nombre):
    if not nombre:
        return False
    return bool(re.match(r'^[A-Za-zÁ-Úá-úñÑ\s]+$', nombre))
