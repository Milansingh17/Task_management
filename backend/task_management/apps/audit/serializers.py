from rest_framework import serializers
from .models import AuditLog
import json

class AuditLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    task_title = serializers.SerializerMethodField()
    changed_data_json = serializers.SerializerMethodField()
    
    class Meta:
        model = AuditLog
        fields = [
            'id',
            'user',
            'username',
            'task',
            'task_title',
            'action',
            'changed_data',
            'changed_data_json',
            'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']
    
    def get_task_title(self, obj):
        return obj.task.title if obj.task else 'Deleted Task'
    
    def get_changed_data_json(self, obj):
        try:
            return json.loads(obj.changed_data)
        except:
            return obj.changed_data