import django.db.models.deletion
from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('catastro', '0002_alter_unidad_unique_together_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Notificacion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('titulo', models.CharField(max_length=255)),
                ('mensaje', models.TextField()),
                ('tipo', models.CharField(default='Alerta', max_length=100)),
                ('fecha', models.DateTimeField(auto_now_add=True)),
                ('estado', models.CharField(default='Pendiente', max_length=50)),
                ('condominio', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='notificaciones', to='catastro.condominio')),
                ('unidad', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='notificaciones', to='catastro.unidad')),
            ],
        ),
    ]
