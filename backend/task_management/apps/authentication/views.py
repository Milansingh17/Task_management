from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth.models import User
from .serializers import (
    UserRegistrationSerializer, 
    UserSerializer
)

class UserRegistrationView(generics.CreateAPIView):
    """
    User Registration Endpoint
    POST /api/auth/register/
    """
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    """
    User Login Endpoint
    POST /api/auth/login/
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            user = User.objects.get(username=request.data['username'])
            return Response({
                'access': response.data['access'],
                'refresh': response.data['refresh'],
                'user': UserSerializer(user).data,
                'message': 'Login successful'
            })
        return response


class LogoutView(APIView):
    """
    User Logout Endpoint
    POST /api/auth/logout/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                try:
                    # Try to blacklist the token if token_blacklist app is installed
                    token.blacklist()
                except AttributeError:
                    # If blacklist is not available, just proceed without it
                    pass
                return Response({
                    'message': 'Logout successful'
                }, status=status.HTTP_205_RESET_CONTENT)
            else:
                return Response({
                    'error': 'Refresh token is required'
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Get/Update User Profile
    GET/PUT/PATCH /api/auth/profile/
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class UserSearchView(generics.ListAPIView):
    """
    Search registered users (Admins/Owners only)
    GET /api/auth/users/?search=<username>
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    pagination_class = None
    MAX_RESULTS = 25

    def _can_search(self, user):
        if not user or not user.is_authenticated:
            return False
        return user.is_superuser or user.has_perm('tasks.task_manage')

    def get_queryset(self):
        search_term = self.request.query_params.get('search', '').strip()
        queryset = User.objects.filter(is_active=True).order_by('username')
        if search_term:
            queryset = queryset.filter(username__icontains=search_term)
        return queryset[: self.MAX_RESULTS]

    def list(self, request, *args, **kwargs):
        if not self._can_search(request.user):
            raise PermissionDenied('You are not allowed to search users.')
        return super().list(request, *args, **kwargs)