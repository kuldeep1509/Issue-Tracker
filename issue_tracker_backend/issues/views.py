# issues/views.py
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth import get_user_model

from .models import Issue, Team
from .serializers import IssueSerializer, SimpleUserSerializer, TeamSerializer
from .permissions import IsOwnerOrReadOnly

User = get_user_model()


class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        """
        Admins see everything.
        Regular users see:
        - issues they own
        - issues assigned to them
        - issues assigned to a team they belong to
        """
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status', None)

        if self.request.user.is_staff:
            if status_filter:
                queryset = queryset.filter(status__iexact=status_filter)
            return queryset

        user_teams = Team.objects.filter(members=self.request.user)
        user_specific_queryset = queryset.filter(
            Q(owner=self.request.user) |
            Q(assigned_to=self.request.user) |
            Q(assigned_team__in=user_teams)
        ).distinct()

        if status_filter:
            user_specific_queryset = user_specific_queryset.filter(status__iexact=status_filter)

        return user_specific_queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_issues(self, request):
        user_teams = Team.objects.filter(members=request.user)
        user_issues = Issue.objects.filter(
            Q(owner=request.user) |
            Q(assigned_to=request.user) |
            Q(assigned_team__in=user_teams)
        ).distinct()

        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            user_issues = user_issues.filter(status__iexact=status_filter)

        serializer = self.get_serializer(user_issues, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])  # Changed from IsAdminUser
    def all_users(self, request):
        users = User.objects.exclude(id=request.user.id).order_by('username')
        serializer = SimpleUserSerializer(users, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def assign(self, request, pk=None):
        issue = self.get_object()

        user_teams = Team.objects.filter(members=request.user)

        if not (issue.owner == request.user or request.user.is_staff or issue.assigned_team in user_teams):
            return Response(
        {"detail": "You do not have permission to assign this issue."},
        status=status.HTTP_403_FORBIDDEN
    )

        assigned_to_id = request.data.get('assigned_to_id')
        assigned_team_id = request.data.get('assigned_team_id')

        # Handle both user and team assignment — but not both
        if assigned_to_id and assigned_team_id:
            return Response({"detail": "Cannot assign issue to both user and team."},
                            status=status.HTTP_400_BAD_REQUEST)

        if assigned_to_id:
            try:
                assigned_user = User.objects.get(id=assigned_to_id)
                issue.assigned_to = assigned_user
                issue.assigned_team = None
            except User.DoesNotExist:
                return Response({"detail": "Assigned user not found."}, status=status.HTTP_404_NOT_FOUND)

        elif assigned_team_id:
            try:
                team = Team.objects.get(id=assigned_team_id)
                if request.user not in team.members.all() and not request.user.is_staff:
                    return Response({"detail": "You are not a member of this team."},
                                    status=status.HTTP_403_FORBIDDEN)
                issue.assigned_team = team
                issue.assigned_to = None
            except Team.DoesNotExist:
                return Response({"detail": "Team not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
            issue.assigned_to = None
            issue.assigned_team = None

        issue.save()
        serializer = self.get_serializer(issue)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        issue = self.get_object()

    # Let all authenticated users assign issues
        assigned_to_id = request.data.get('assigned_to_id')
        if assigned_to_id is not None:
            if assigned_to_id == 'NONE':
                issue.assigned_to = None
            else:
                try:
                    assigned_user = User.objects.get(id=assigned_to_id)
                    issue.assigned_to = assigned_user
                except User.DoesNotExist:
                    return Response({"detail": "Assigned user not found."}, status=status.HTTP_404_NOT_FOUND)
        issue.save()

    # Now check if the user has permission to edit other fields (IsOwnerOrReadOnly)
        if issue.owner == request.user or request.user.is_staff:
            return super().update(request, *args, **kwargs)

    # If not owner or admin, just return the updated issue (assigned only)
        serializer = self.get_serializer(issue)
        return Response(serializer.data)

    




class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # User can see only teams they are part of
        # This filter is correct if the creator is also added as a member.
        return Team.objects.filter(members=self.request.user).distinct() # Added .distinct() for good measure

    def perform_create(self, serializer):
        # Save the team instance first, associating it with the creator
        team = serializer.save(created_by=self.request.user)
        # --- CRITICAL FIX: Add the creator to the team's members ---
        team.members.add(self.request.user)
        # ----------------------------------------------------------

