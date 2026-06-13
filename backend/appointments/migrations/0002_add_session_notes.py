# Generated migration for session_notes field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('appointments', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='appointment',
            name='session_notes',
            field=models.TextField(blank=True, null=True),
        ),
    ]
