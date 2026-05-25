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

    def validate_rut_dni(self, value):
        if not value:
            return value
            
        queryset = Residente.objects.filter(rut_dni=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
            
        if queryset.exists():
            raise serializers.ValidationError("Ya existe un residente registrado con este RUT/DNI.")
        return value

    def validate_detalles_salud_sensibles(self, value):
        # Fernet encriptará el valor automáticamente al guardarlo en BD 
        # y lo desencriptará al traerlo. Posibles validaciones acá.
        return value

    def validate(self, data):
        relacion = data.get('relacion_jefe_hogar', getattr(self.instance, 'relacion_jefe_hogar', None))
        fecha_nacimiento = data.get('fecha_nacimiento', getattr(self.instance, 'fecha_nacimiento', None))
        
        if relacion in ['FAMILIAR_ADULTO_MAYOR', 'FAMILIAR_MENOR'] and not fecha_nacimiento:
            raise serializers.ValidationError({"fecha_nacimiento": "Debe indicar la fecha de nacimiento para verificar la edad."})
            
        if fecha_nacimiento:
            from datetime import date
            today = date.today()
            age = today.year - fecha_nacimiento.year - ((today.month, today.day) < (fecha_nacimiento.month, fecha_nacimiento.day))
            
            if relacion == 'FAMILIAR_ADULTO_MAYOR' and age < 65:
                raise serializers.ValidationError({"relacion_jefe_hogar": f"El residente tiene {age} años. Para ser Familiar Adulto Mayor debe tener 65 años o más."})
                
            if relacion == 'FAMILIAR_MENOR' and age >= 18:
                raise serializers.ValidationError({"relacion_jefe_hogar": f"El residente tiene {age} años. Para ser Familiar Menor de edad debe tener menos de 18 años."})
                
        return data

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

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['rol'] = user.rol
        return token
