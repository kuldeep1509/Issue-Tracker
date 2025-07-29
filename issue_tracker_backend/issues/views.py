# issues/views.py
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q # Q object: Lets you use OR logic in queries
from .models import Issue
from .serializers import IssueSerializer, SimpleUserSerializer# Use SimpleUserSerializer for user lists
from .permissions import IsOwnerOrReadOnly
from django.contrib.auth import get_user_model

User = get_user_model()

class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly] # Apply permissions

    def get_queryset(self):
        """
        Custom queryset to filter issues based on user permissions and optional status.
        - Admins (is_staff) can see all issues.
        - Regular users can only see issues they own or are assigned to.
        - Can filter by 'status' query parameter (e.g., /issues/?status=OPEN).
        """
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status', None)

        if self.request.user.is_staff: # Admins see all issues
            if status_filter:
                queryset = queryset.filter(status__iexact=status_filter)
            return queryset
        else: # Regular users see only their owned or assigned issues
            user_specific_queryset = queryset.filter(
                Q(owner=self.request.user) | Q(assigned_to=self.request.user)
            ).distinct() # Use distinct to avoid duplicates if user is both owner and assignee

            if status_filter:
                user_specific_queryset = user_specific_queryset.filter(status__iexact=status_filter)
            return user_specific_queryset

    def perform_create(self, serializer):#if a user create an issue then this method sets that user to owner
        """
        Set the owner of the issue to the currently authenticated user automatically.
        """
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])#custom endpoint
    def my_issues(self, request):# This logic is responsible for returning a filtered list of issues that are either owned by or assigned to the current user — and it supports an optional status filter.
        """
        Custom endpoint to fetch issues owned by or assigned to the current user.
        This is essentially what get_queryset does for non-admins, but provided as a specific endpoint.
        """
        #Give me all issues where the owner is the current user OR the issue is assigned_to the current user.
        user_issues = Issue.objects.filter(
            Q(owner=request.user) | Q(assigned_to=request.user)
        ).distinct()
        
        status_filter = self.request.query_params.get('status', None) # GET STATUS FROM QUERY PARAMS, If status isn't passed, it defaults to None
        if status_filter:
            user_issues = user_issues.filter(status__iexact=status_filter)#If the user passed a status like "open", "Open", or "OPEN" — this will still match "OPEN" in DB
            
        serializer = self.get_serializer(user_issues, many=True)#sends issue object in json format m=true because it's a list of users
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def all_users(self, request):
        """
        Endpoint to get a list of all users. Accessible only by admins.
        This is useful for populating the "assigned_to" dropdown in the frontend.
        """
        users = User.objects.all().order_by('username') # Order for consistent display
        serializer = SimpleUserSerializer(users, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])# custom action applies to a single instance for paricular user like with id 5 in pk
    def assign(self, request, pk=None):
        """
        Assign an issue to a user.
        Only the owner of the issue or an admin can assign it.
        Expects 'assigned_to_id' in the request data.
        """
        issue = self.get_object() # Get the specific issue instance using pk

        # Check if the requesting user is the owner of the issue OR an admin
        if not (issue.owner == request.user or request.user.is_staff):
            return Response(
                {"detail": "You do not have permission to assign this issue."},
                status=status.HTTP_403_FORBIDDEN
            )

        assigned_to_id = request.data.get('assigned_to_id')#Expects frontend to send the assigned_to_id (user’s ID)

        if assigned_to_id is None: # Allow unassigning by sending null/empty string
            issue.assigned_to = None
        else:
            try:
                assigned_user = User.objects.get(id=assigned_to_id)
                issue.assigned_to = assigned_user
            except User.DoesNotExist:
                return Response({"detail": "Assigned user not found."}, status=status.HTTP_404_NOT_FOUND)

        issue.save()
        serializer = self.get_serializer(issue)
        return Response(serializer.data)