from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, TaskRoleAssignmentViewSet

router = DefaultRouter()
router.register(r'', TaskViewSet, basename='task')

urlpatterns = [
    path('', include(router.urls)),
    path(
        '<int:task_pk>/roles/',
        TaskRoleAssignmentViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='task-role-assignment-list'
    ),
    path(
        '<int:task_pk>/roles/<int:pk>/',
        TaskRoleAssignmentViewSet.as_view({
            'get': 'retrieve',
            'patch': 'partial_update',
            'delete': 'destroy'
        }),
        name='task-role-assignment-detail'
    ),
]

