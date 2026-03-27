from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework import filters
from knox.models import AuthToken
from django_filters.rest_framework import DjangoFilterBackend
from users.models import User
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer, UserProfileSerializer
import django_filters
from django_filters import FilterSet, Filter
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework_api_key.permissions import HasAPIKey
# from django.contrib.auth.models import User

from rest_framework import status
from django.db import transaction
from pins.models import pin

# Register API


class RegisterAPI(generics.GenericAPIView):
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "token": AuthToken.objects.create(user)[1]
        })


# Login API


class LoginAPI(generics.GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "token": AuthToken.objects.create(user)[1]
        })


# Get User API
class UserAPI(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [
        permissions.IsAuthenticated,
        HasAPIKey
    ]

    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        """
        Delete the user with options deleteaLL, keep all, keep selected
        Request  example: { "storyMode": "keep_selected", "keepStoryIds": [1,2,3] }
        """
        user = request.user

        story_mode = request.data.get("storyMode", "delete_all")
        keep_ids = request.data.get("keepStoryIds", []) or []

        try:
            keep_ids = [int(i) for i in keep_ids]
        except Exception:
            keep_ids = []

        user_pins_qs = pin.objects.filter(owner=user)

        if story_mode == "keep_all":
            user_pins_qs.update(owner=None, is_anonymous_pin=True)

        elif story_mode == "keep_selected":
            if keep_ids:
                user_pins_qs.exclude(id__in=keep_ids).delete() #we delete not selected and make anonoumus rest
                user_pins_qs.filter(id__in=keep_ids).update(owner=None, is_anonymous_pin=True)
            else:
                user_pins_qs.delete() #no pins
        else:
            user_pins_qs.delete() #we default to deleting all

        user.delete()

        return Response({"detail": "user deleted"}, status=status.HTTP_200_OK)



class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 1000


class UsersViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()
    pagination_class = StandardResultsSetPagination


# filter_backends = [DjangoFilterBackend]
# filterset_fields = '__all__'


class UserSearchViewSet(viewsets.ModelViewSet):

    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['username']


class UserViewProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()

    serializer_class = UserProfileSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    filterset_fields = ['username']
    search_fields = ['username']
