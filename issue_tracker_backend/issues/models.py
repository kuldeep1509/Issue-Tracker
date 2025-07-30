# issues/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Team(models.Model):
    """
    Represents a team within the issue tracker.
    Teams can own issues or have issues assigned to them.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    # The user who created this team
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='owned_teams')
    # Members of the team (many-to-many relationship)
    members = models.ManyToManyField(User, related_name='teams', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name'] # Order teams by name by default

    def __str__(self):
        return self.name

class Issue(models.Model):
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('IN_PROGRESS', 'In Progress'),
        ('CLOSED', 'Closed'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    # The user who created the issue
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_issues')
    # The user currently assigned to the issue (can be null)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_issues')
    # NEW: The team currently assigned to the issue (can be null)
    assigned_team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_issues_to_team')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at'] # Order issues by creation date, newest first

    def __str__(self):
        return self.title