from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models import Count, Q

from .models import Task
from .serializers import TaskSerializer


def _broadcast(user_id, event, data):
    if not user_id:
        return

    channel_layer = get_channel_layer()
    if not channel_layer:
        return

    async_to_sync(channel_layer.group_send)(
        f'user_tasks_{user_id}',
        {
            'type': 'task_event',
            'event': event,
            'data': data,
        }
    )


def get_user_task_summary(user_id):
    if not user_id:
        return {
            'total_tasks': 0,
            'completed': 0,
            'pending': 0,
            'high_priority': 0,
        }

    summary = Task.objects.filter(owner_id=user_id).aggregate(
        total_tasks=Count('id'),
        completed=Count('id', filter=Q(status='Completed')),
        pending=Count('id', filter=Q(status='Pending')),
        high_priority=Count('id', filter=Q(priority='High')),
    )
    return {key: summary.get(key, 0) or 0 for key in ['total_tasks', 'completed', 'pending', 'high_priority']}


def broadcast_task_summary(user_id):
    summary = get_user_task_summary(user_id)
    _broadcast(user_id, 'task_summary', summary)
    return summary


def broadcast_task_payload(task, event):
    if not task or not task.owner_id:
        return
    serialized = TaskSerializer(task).data
    _broadcast(task.owner_id, event, serialized)


def broadcast_full_task_list(user_id):
    if not user_id:
        return
    tasks = Task.objects.filter(owner_id=user_id).order_by('-position', '-created_at')
    serialized = TaskSerializer(tasks, many=True).data
    _broadcast(user_id, 'tasks_reordered', serialized)


def broadcast_generic_event(user_id, event, data):
    _broadcast(user_id, event, data)

