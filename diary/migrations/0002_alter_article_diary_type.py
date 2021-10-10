# Generated by Django 3.2.7 on 2021-10-06 16:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('diary', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='article',
            name='diary_type',
            field=models.SmallIntegerField(choices=[(0, '메모장'), (1, '원고지'), (2, '어린이 일기장')], default=0),
        ),
    ]