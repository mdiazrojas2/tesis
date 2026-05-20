import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from catastro.models import Condominio, Unidad

def populate():
    # Crear o actualizar Condominio Volcanes
    condominio, created = Condominio.objects.get_or_create(
        nombre="Condominio Volcanes",
        defaults={
            "direccion": "Avenida Principal 123",
            "email_administracion": "admin@volcanes.cl"
        }
    )
    
    if created:
        print(f"Creado: {condominio.nombre}")
    else:
        print(f"Ya existe: {condominio.nombre}")

    # Crear Unidades (Pisos 1 al 19, 15 por piso) en Torre A
    print("Generando unidades...")
    unidades_creadas = 0
    for piso in range(1, 20):
        for depto in range(1, 16):
            # Formato: 101, 115, 1901, 1915
            numero = f"{piso}{depto:02d}"
            
            _, u_created = Unidad.objects.get_or_create(
                condominio=condominio,
                torre="Torre A",
                numero_depto=numero
            )
            if u_created:
                unidades_creadas += 1

    print(f"Se crearon {unidades_creadas} unidades nuevas en {condominio.nombre}.")

if __name__ == '__main__':
    populate()
