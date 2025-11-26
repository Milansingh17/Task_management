from django.contrib import admin
from .models import Task, TaskRoleAssignment


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'status', 'priority', 'owner', 'created_at', 'updated_at']
    list_filter = ['status', 'priority', 'created_at']
    search_fields = ['title', 'description', 'owner__username']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Task Information', {
            'fields': ('title', 'description', 'owner')
        }),
        ('Task Details', {
            'fields': ('status', 'priority')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TaskRoleAssignment)
class TaskRoleAssignmentAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'task',
        'user',
        'assigned_role',
        'submission_deadline',
        'assigned_by',
        'is_active',
        'created_at',
    ]
    list_filter = ['assigned_role', 'is_active', 'created_at']
    search_fields = ['task__title', 'user__username', 'assigned_by__username']
    autocomplete_fields = ['task', 'user', 'assigned_by']