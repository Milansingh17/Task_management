from django.db.models.signals import post_save, pre_delete, pre_save, post_delete
from django.dispatch import receiver
from .models import Task
from apps.audit.models import AuditLog
import json
from .realtime import (
    broadcast_task_payload,
    broadcast_task_summary,
    broadcast_generic_event,
)

@receiver(pre_save, sender=Task)
def task_pre_save(sender, instance, **kwargs):
    """Store the old instance data before save"""
    if instance.pk:
        try:
            instance._old_instance = Task.objects.get(pk=instance.pk)
        except Task.DoesNotExist:
            instance._old_instance = None
    else:
        instance._old_instance = None


@receiver(post_save, sender=Task)
def task_post_save(sender, instance, created, **kwargs):
    """Create audit log after task save"""
    if created:
        # Task Created
        AuditLog.objects.create(
            user=instance.owner,
            task=instance,
            action='Task Created',
            changed_data=json.dumps({
                'title': instance.title,
                'description': instance.description,
                'status': instance.status,
                'priority': instance.priority,
            })
        )
        broadcast_task_payload(instance, 'task_created')
    else:
        # Task Updated
        changes = {}
        old_instance = getattr(instance, '_old_instance', None)
        
        if old_instance:
            # Check for changes
            if old_instance.title != instance.title:
                changes['title'] = {
                    'old': old_instance.title,
                    'new': instance.title
                }
            if old_instance.description != instance.description:
                changes['description'] = {
                    'old': old_instance.description,
                    'new': instance.description
                }
            if old_instance.status != instance.status:
                changes['status'] = {
                    'old': old_instance.status,
                    'new': instance.status
                }
                # Special log for status change
                AuditLog.objects.create(
                    user=instance.owner,
                    task=instance,
                    action='Status Changed',
                    changed_data=json.dumps(changes['status'])
                )
            if old_instance.priority != instance.priority:
                changes['priority'] = {
                    'old': old_instance.priority,
                    'new': instance.priority
                }
                # Special log for priority change
                AuditLog.objects.create(
                    user=instance.owner,
                    task=instance,
                    action='Priority Changed',
                    changed_data=json.dumps(changes['priority'])
                )
            
            if changes:
                AuditLog.objects.create(
                    user=instance.owner,
                    task=instance,
                    action='Task Updated',
                    changed_data=json.dumps(changes)
                )
        broadcast_task_payload(instance, 'task_updated')

    broadcast_task_summary(instance.owner_id)


@receiver(pre_delete, sender=Task)
def task_pre_delete(sender, instance, **kwargs):
    """Create audit log before task deletion"""
    AuditLog.objects.create(
        user=instance.owner,
        task=None,  # Task will be deleted
        action='Task Deleted',
        changed_data=json.dumps({
            'task_id': instance.id,
            'title': instance.title,
            'description': instance.description,
            'status': instance.status,
            'priority': instance.priority,
        })
    )
    broadcast_generic_event(
        instance.owner_id,
        'task_deleted',
        {'id': instance.id}
    )


@receiver(post_delete, sender=Task)
def task_post_delete(sender, instance, **kwargs):
    broadcast_task_summary(instance.owner_id)