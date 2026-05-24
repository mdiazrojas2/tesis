from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Condominio, Unidad, Residente, Documento, Notificacion

User = get_user_model()

class CondominioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Condominio
        fields = '__all__'

class ResidenteSerializer(serializers.ModelSerializer):
    tiene_cuenta = serializers.SerializerMethodField()

    class Meta:
        model = Residente
        fields = '__all__'
        
    def get_tiene_cuenta(self, obj):
        if not obj.correo:
            return False
        return User.objects.filter(email=obj.correo).exists()

    def validate_detalles_salud_sensibles(self, value):
        # Fernet encriptará el valor automáticamente al guardarlo en BD 
        # y lo desencriptará al traerlo. Posibles validaciones acá.
        return value

class UnidadSerializer(serializers.ModelSerializer):
    residentes = ResidenteSerializer(many=True, read_only=True)

    class Meta:
        model = Unidad
        fields = '__all__'

class DocumentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Documento
        fields = '__all__'


class NotificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificacion
        fields = '__all__'
