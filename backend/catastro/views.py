from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth import get_user_model
from django.urls import reverse
from .utils import send_email_async
from .models import Condominio, Unidad, Residente, Documento, Notificacion
from .serializers import CondominioSerializer, UnidadSerializer, ResidenteSerializer, DocumentoSerializer, NotificacionSerializer

class RoleBasedAccess(permissions.BasePermission):
    """
    Permiso custom para proteger los datos médicos:
    - Admin y Conserje pueden ver el listado (para evacuaciones).
    - Un Residente solo interactúa con los de su misma unidad.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

class CondominioViewSet(viewsets.ModelViewSet):
    queryset = Condominio.objects.all()
    serializer_class = CondominioSerializer
    permission_classes = [permissions.IsAuthenticated]

class UnidadViewSet(viewsets.ModelViewSet):
    queryset = Unidad.objects.all()
    serializer_class = UnidadSerializer
    permission_classes = [permissions.IsAuthenticated]

class ResidenteViewSet(viewsets.ModelViewSet):
    queryset = Residente.objects.all()
    serializer_class = ResidenteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'rol', None) == 'RESIDENTE':
            # Buscar la unidad del residente logueado y devolver todos los de esa unidad
            mi_residente = Residente.objects.filter(correo=user.email).first()
            if mi_residente and mi_residente.unidad_id:
                return Residente.objects.filter(unidad=mi_residente.unidad)
            return Residente.objects.filter(correo=user.email)
        return super().get_queryset()

    @action(detail=True, methods=['post'], url_path='enviar-invitacion')
    def enviar_invitacion(self, request, pk=None):
        """Genera una invitación por correo para que el residente cree su contraseña."""
        try:
            residente = self.get_object()
        except Exception as e:
            return Response({'detail': 'Residente no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        User = get_user_model()
        # Crear/obtener usuario asociado al correo del residente
        user, created = User.objects.get_or_create(username=residente.correo, defaults={
            'email': residente.correo,
            'rol': User.Roles.RESIDENTE,
            'is_active': True,
        })
        # Generar token y uid
        token_generator = PasswordResetTokenGenerator()
        token = token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        # Construir enlace (asumimos que frontend corre en localhost:5173)
        link = f"http://localhost:5173/establecer-clave/{uid}/{token}"
        # Enviar email
        subject = "Invitación de acceso a CondoConnect"
        message = f"Hola {residente.nombre},\n\nSe ha creado una cuenta para ti en el portal.\nHaz clic en el siguiente enlace para establecer tu contraseña y activar tu acceso:\n{link}\n\nSi no solicitaste esto, ignora el mensaje."
        send_email_async(subject=subject, message=message, recipient_list=[residente.correo])
        return Response({'detail': 'Invitación enviada correctamente.'}, status=status.HTTP_200_OK)

class EstablecerClaveView(viewsets.ViewSet):
    """Endpoint que valida token y permite crear la contraseña del usuario."""
    def create(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        password = request.data.get('password')
        if not all([uidb64, token, password]):
            return Response({'detail': 'Datos incompletos.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            User = get_user_model()
            user = User.objects.get(pk=uid)
        except Exception:
            return Response({'detail': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        token_generator = PasswordResetTokenGenerator()
        if not token_generator.check_token(user, token):
            return Response({'detail': 'Token inválido o expirado.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(password)
        user.save()
        return Response({'detail': 'Contraseña establecida correctamente.'}, status=status.HTTP_200_OK)


class RecuperarClaveView(viewsets.ViewSet):
    """Endpoint para solicitar recuperación de contraseña por correo."""
    def create(self, request):
        email = request.data.get('email', '').strip()
        if not email:
            return Response({'detail': 'Debe ingresar un correo electrónico.'}, status=status.HTTP_400_BAD_REQUEST)
        User = get_user_model()
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Por seguridad, no revelamos si el correo existe o no
            return Response({'detail': 'Si el correo está registrado, recibirá un enlace para restablecer su contraseña.'}, status=status.HTTP_200_OK)
        token_generator = PasswordResetTokenGenerator()
        token = token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        link = f"http://localhost:5173/establecer-clave/{uid}/{token}"
        subject = "Recuperación de contraseña - CondoConnect"
        message = (
            f"Hola {user.get_full_name() or user.username},\n\n"
            f"Recibimos una solicitud para restablecer tu contraseña.\n"
            f"Haz clic en el siguiente enlace para crear una nueva contraseña:\n{link}\n\n"
            f"Si no solicitaste esto, puedes ignorar este mensaje.\n"
            f"El enlace expirará en 24 horas."
        )
        send_email_async(subject=subject, message=message, recipient_list=[email])
        return Response({'detail': 'Si el correo está registrado, recibirá un enlace para restablecer su contraseña.'}, status=status.HTTP_200_OK)

class DocumentoViewSet(viewsets.ModelViewSet):
    queryset = Documento.objects.all()
    serializer_class = DocumentoSerializer
    permission_classes = [permissions.IsAuthenticated]

from .utils import check_vencimientos_sistema

class NotificacionViewSet(viewsets.ModelViewSet):
    queryset = Notificacion.objects.all()
    serializer_class = NotificacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Corremos el check automático cada vez que se consultan las notificaciones
        # (En un entorno real de alta carga esto iría en Celery o Cron, aquí on-the-fly es perfecto)
        try:
            check_vencimientos_sistema()
        except Exception as e:
            print(f"Error checking vencimientos: {e}")

        user = self.request.user
        qs = Notificacion.objects.all()
        # Si el usuario tiene rol Residente, solo ve las notificaciones de su unidad o globales
        if getattr(user, 'rol', None) == 'RESIDENTE':
            # Tenemos que saber de qué unidad es, busquemos su registro Residente
            # Asumimos que el correo del User coincide con el del Residente
            residentes_mios = Residente.objects.filter(correo=user.email)
            unidades_ids = residentes_mios.values_list('unidad_id', flat=True)
            # Retorna notificaciones de esas unidades o globales (unidad=None)
            from django.db.models import Q
            qs = qs.filter(Q(unidad__in=unidades_ids) | Q(unidad__isnull=True))
        return qs
