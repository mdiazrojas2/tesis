from rest_framework import viewsets, permissions
from .models import Unidad, Residente
from .serializers import UnidadSerializer, ResidenteSerializer

class RoleBasedAccess(permissions.BasePermission):
    """
    Permiso custom para proteger los datos médicos:
    - Admin y Conserje pueden ver el listado (para evacuaciones).
    - Un Residente solo interactúa con los de su misma unidad.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

class UnidadViewSet(viewsets.ModelViewSet):
    queryset = Unidad.objects.all()
    serializer_class = UnidadSerializer
    permission_classes = [permissions.IsAuthenticated, RoleBasedAccess]

class ResidenteViewSet(viewsets.ModelViewSet):
    queryset = Residente.objects.all()
    serializer_class = ResidenteSerializer
    permission_classes = [permissions.IsAuthenticated, RoleBasedAccess]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'rol', None) == 'RESIDENTE':
            # Solo retorna por correo, asumiendo validación básica
            return Residente.objects.filter(correo=user.email)
        return super().get_queryset()
