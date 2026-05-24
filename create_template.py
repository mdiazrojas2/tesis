import openpyxl
from openpyxl.worksheet.datavalidation import DataValidation

wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Residentes"

# Encabezados (Todos los campos del modelo Residente)
headers = [
    "Torre", "Numero_Depto", "Nombres", "Apellidos", "Rut_DNI", "Correo", "Telefono", 
    "Fecha_Nacimiento", "Nacionalidad", "Idioma", "Relacion_Hogar", 
    "Movilidad_Reducida", "Condicion_Medica", "Contacto_Emergencia_Nombre", 
    "Contacto_Emergencia_Telefono", "Contacto_Emergencia_Correo"
]
ws.append(headers)

# Ajustar ancho de columnas para mejor legibilidad
for col_idx, column in enumerate(ws.columns, 1):
    ws.column_dimensions[openpyxl.utils.get_column_letter(col_idx)].width = 20

# Crear Validaciones de Datos (Listas Desplegables)
# 1. Relación con Jefe de Hogar
dv_relacion = DataValidation(type="list", formula1='"JEFE_HOGAR,CONYUGE,ARRENDATARIO,FAMILIAR_MENOR,FAMILIAR_ADULTO,FAMILIAR_MAYOR,OTRO"', allow_blank=True)
dv_relacion.error ='Debe seleccionar una opción válida de la lista'
dv_relacion.errorTitle = 'Opción Inválida'
dv_relacion.prompt = 'Seleccione el tipo de residente'
dv_relacion.promptTitle = 'Tipo de Residente'
ws.add_data_validation(dv_relacion)
dv_relacion.add('K2:K1000') # Columna K es Relacion_Hogar

# 2. Movilidad Reducida (Sí/No)
dv_si_no = DataValidation(type="list", formula1='"Sí,No"', allow_blank=True)
dv_si_no.error ='Seleccione Sí o No'
dv_si_no.errorTitle = 'Opción Inválida'
ws.add_data_validation(dv_si_no)
dv_si_no.add('L2:L1000') # Columna L es Movilidad_Reducida

# 3. Condición Médica (Sí/No)
dv_medica = DataValidation(type="list", formula1='"Sí,No"', allow_blank=True)
dv_medica.error ='Seleccione Sí o No'
dv_medica.errorTitle = 'Opción Inválida'
ws.add_data_validation(dv_medica)
dv_medica.add('M2:M1000') # Columna M es Condicion_Medica

# Datos de ejemplo
example_data = [
    ["A", "101", "Juan", "Pérez", "12345678-9", "juan@example.com", "+56912345678", "1980-05-20", "Chilena", "Español", "JEFE_HOGAR", "No", "No", "María Pérez", "+56987654321", ""],
    ["", "102", "Pedro", "Gómez", "9876543-2", "", "", "2015-08-10", "Chilena", "Español", "FAMILIAR_MENOR", "No", "Sí", "Ana Gómez", "+56911223344", "ana@example.com"],
]
for row in example_data:
    ws.append(row)

# Guardar en frontend/public
wb.save("frontend/public/plantilla_residentes.xlsx")
print("Plantilla avanzada creada exitosamente.")
