# issues/views.py
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Issue, Team
from .serializers import IssueSerializer, TeamSerializer, SimpleUserSerializer
from .permissions import IsOwnerOrReadOnly

User = get_user_model()

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated] # Any authenticated user can create/list teams

    def get_queryset(self):
        # Allow any authenticated user to see all teams
        # In a more complex app, you might restrict this to teams they are a member of
        return Team.objects.all()

    def perform_create(self, serializer):
        # Set the owner of the team to the current requesting user
        # And automatically add the owner as a member of the team
        team = serializer.save(owner=self.request.user)
        team.members.add(self.request.user) # Owner is automatically a member

    def perform_update(self, serializer):
        # Ensure only owner or admin can update the team
        if self.request.user == serializer.instance.owner or self.request.user.is_staff:
            serializer.save()
        else:
            return Response(
                {"detail": "You do not have permission to edit this team."},
                status=status.HTTP_403_FORBIDDEN
            )

    def perform_destroy(self, instance):
        # Ensure only owner or admin can delete the team
        if self.request.user == instance.owner or self.request.user.is_staff:
            instance.delete()
        else:
            return Response(
                {"detail": "You do not have permission to delete this team."},
                status=status.HTTP_403_FORBIDDEN
            )

    # NEW: Endpoint to add a member to a team (only owner/admin)
    # Example: POST /api/teams/{team_id}/add_member/ {"user_id": 1}
    # Using @action decorator for custom actions
    from rest_framework.decorators import action
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_member(self, request, pk=None):
        team = self.get_object()
        # Check if requesting user is owner or admin
        if request.user != team.owner and not request.user.is_staff:
            return Response(
                {"detail": "You do not have permission to add members to this team."},
                status=status.HTTP_403_FORBIDDEN
            )

        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {"detail": "User ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            user_to_add = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        team.members.add(user_to_add)
        return Response(
            {"detail": f"{user_to_add.username} added to team {team.name}."},
            status=status.HTTP_200_OK
        )

    # NEW: Endpoint to remove a member from a team (only owner/admin)
    # Example: POST /api/teams/{team_id}/remove_member/ {"user_id": 1}
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def remove_member(self, request, pk=None):
        team = self.get_object()
        # Check if requesting user is owner or admin
        if request.user != team.owner and not request.user.is_staff:
            return Response(
                {"detail": "You do not have permission to remove members from this team."},
                status=status.HTTP_403_FORBIDDEN
            )

        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {"detail": "User ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            user_to_remove = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        team.members.remove(user_to_remove)
        return Response(
            {"detail": f"{user_to_remove.username} removed from team {team.name}."},
            status=status.HTTP_200_OK
        )

    # Existing all_users endpoint
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def all_users(self, request):
        # Only staff users can see the full list of all users
        if not request.user.is_staff:
            return Response(
                {"detail": "You do not have permission to view all users."},
                status=status.HTTP_403_FORBIDDEN
            )
        users = User.objects.all()
        serializer = SimpleUserSerializer(users, many=True)
        return Response(serializer.data)


class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        # For now, let's allow authenticated users to see all issues.
        # In a more complex app, you might filter issues based on
        # user ownership, assignment, or team membership.
        return Issue.objects.all()

    def perform_create(self, serializer):
        # Set the owner of the issue to the current requesting user
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        # IsOwnerOrReadOnly handles basic permissions.
        # Additional logic if needed, but it's usually handled by the permission class.
        serializer.save()