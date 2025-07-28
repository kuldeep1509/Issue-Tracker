# issues/models.py
from django.db import models
from django.contrib.auth import get_user_model # Best practice to get the active user model

User = get_user_model() # This will get Django's default User model

class Issue(models.Model):
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('IN_PROGRESS', 'In Progress'),
        ('CLOSED', 'Closed'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='OPEN'
    )
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='owned_issues',
        help_text='The user who created this issue.'
    )
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL, # If assigned user is deleted, assignment becomes null
        related_name='assigned_issues',#from user side if i have to access this field the i use user.assigned_issues.all()
        blank=True,
        null=True,
        help_text='The user assigned to this issue.'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at'] # Order by newest first

    def __str__(self):
        return self.title