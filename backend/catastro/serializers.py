from rest_framework import serializers
from .models import Condominio, Unidad, Residente, Documento, Notificacion

class CondominioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Condominio
        fields = '__all__'

class ResidenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Residente
        fields = '__all__'
        
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
