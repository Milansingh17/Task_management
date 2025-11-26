from django.db import models
from django.contrib.auth.models import User


class Task(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
    ]
    
    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    position = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['-position', '-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['owner']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['-position']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.owner.username}"


class TaskRoleAssignment(models.Model):
    ROLE_MEMBER = 'Member'
    ROLE_REVIEWER = 'Reviewer'
    ROLE_CONTRIBUTOR = 'Contributor'

    ROLE_CHOICES = [
        (ROLE_MEMBER, 'Member'),
        (ROLE_REVIEWER, 'Reviewer'),
        (ROLE_CONTRIBUTOR, 'Contributor'),
    ]

    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='role_assignments'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='task_roles'
    )
    assigned_role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    submission_deadline = models.DateTimeField(null=True, blank=True)
    feedback_notes = models.TextField(blank=True)
    assigned_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='assigned_task_roles'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('task', 'user')
        ordering = ['-created_at']
        permissions = [
            (
                'task_manage',
                'Can assign roles and manage task collaboration'
            ),
        ]

    def __str__(self):
        return f"{self.task_id}:{self.user.username} -> {self.assigned_role}"