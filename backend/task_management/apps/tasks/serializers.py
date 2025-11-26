from django.contrib.auth.models import User
from django.db.models import Max
from django.utils import timezone
from rest_framework import serializers

from .models import Task, TaskRoleAssignment


class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff']
        read_only_fields = fields


class TaskSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    owner_email = serializers.CharField(source='owner.email', read_only=True)
    current_assignment = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'description',
            'status',
            'priority',
            'owner',
            'owner_username',
            'owner_email',
            'current_assignment',
            'position',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at', 'position']
    
    def create(self, validated_data):
        owner = validated_data.get('owner')
        request = self.context.get('request')
        if not owner and request:
            owner = request.user
            validated_data['owner'] = owner
        
        if not owner:
            raise serializers.ValidationError('Owner is required to create a task.')
        
        last_position = Task.objects.filter(owner=owner).aggregate(
            max_pos=Max('position')
        ).get('max_pos') or 0
        validated_data['position'] = last_position + 1
        return super().create(validated_data)

    def get_current_assignment(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        assignment = obj.role_assignments.filter(
            user=request.user,
            is_active=True
        ).first()
        if not assignment:
            return None
        return {
            'id': assignment.id,
            'assigned_role': assignment.assigned_role,
            'submission_deadline': assignment.submission_deadline,
            'feedback_notes': assignment.feedback_notes,
        }


class TaskSummarySerializer(serializers.Serializer):
    total_tasks = serializers.IntegerField()
    completed = serializers.IntegerField()
    pending = serializers.IntegerField()
    high_priority = serializers.IntegerField()


class TaskReorderSerializer(serializers.Serializer):
    task_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False
    )

    def validate_task_ids(self, value):
        if len(value) != len(set(value)):
            raise serializers.ValidationError('Task ids must be unique.')
        return value


class TaskRoleAssignmentSerializer(serializers.ModelSerializer):
    user = UserSummarySerializer(read_only=True)
    assigned_by = UserSummarySerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        source='user'
    )

    class Meta:
        model = TaskRoleAssignment
        fields = [
            'id',
            'task',
            'user',
            'user_id',
            'assigned_role',
            'submission_deadline',
            'feedback_notes',
            'assigned_by',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'task', 'user', 'assigned_by', 'created_at', 'updated_at']

    def validate_submission_deadline(self, value):
        if value and value <= timezone.now():
            raise serializers.ValidationError('Submission deadline must be in the future.')
        return value

    def validate_assigned_role(self, value):
        valid_roles = dict(TaskRoleAssignment.ROLE_CHOICES).keys()
        if value not in valid_roles:
            raise serializers.ValidationError('Invalid role selection.')
        return value

    def validate(self, attrs):
        task = self.context.get('task')
        user = attrs.get('user') or getattr(self.instance, 'user', None)
        if task and user:
            qs = TaskRoleAssignment.objects.filter(
                task=task,
                user=user,
                is_active=True
            )
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError('User already has a role on this task.')
        return super().validate(attrs)

    def create(self, validated_data):
        validated_data.setdefault('feedback_notes', '')
        return super().create(validated_data)