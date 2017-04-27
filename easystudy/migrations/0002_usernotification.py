# -*- coding: utf-8 -*-
# Generated by Django 1.10.2 on 2017-04-24 10:50
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('easystudy', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserNotification',
            fields=[
                ('idUserNotification', models.AutoField(primary_key=True, serialize=False)),
                ('message', models.TextField(blank=True, null=True)),
                ('severityLevel', models.CharField(choices=[('I', 'Info'), ('D', 'Danger'), ('W', 'Warning')], default='I', max_length=1)),
                ('username', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
