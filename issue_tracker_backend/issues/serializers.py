# issues/serializers.py
from rest_framework import serializers #Comes from DRF. Used to convert models to JSON and vice versa.
from django.contrib.auth import get_user_model
from .models import Issue
from djoser.serializers import UserSerializer as DjoserUserSerializer #  Default user serializer provided by Djoser for API responses.

User = get_user_model()

class CustomCurrentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'is_staff', 'is_superuser') # Include is_staff and is_superuser!
        read_only_fields = ('username', 'email', 'is_staff', 'is_superuser')

# This serializer is for displaying user details within IssueSerializer.
# We are using Djoser's default for simplicity, as configured in settings.py.
class SimpleUserSerializer(DjoserUserSerializer):
    '''
    Used inside the IssueSerializer to show user details of owner and assigned_to.

    Inherits from Djoser’s default UserSerializer for consistency.

    Shows only id, username, and email. 
    '''
    class Meta(DjoserUserSerializer.Meta):
        model = User
        fields = ('id', 'username', 'email') # Expose basic user info

# Issue Serializer
class IssueSerializer(serializers.ModelSerializer): #handles reading and writing issues.
    owner = SimpleUserSerializer(read_only=True) # Display owner's details, read-only
    assigned_to = SimpleUserSerializer(read_only=True) # Display assigned_to details, read-only
    
    # This field is for accepting assigned_to user ID in write operations (create/update)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), #we write this beacuse user id is present in User model
        source='assigned_to', # Maps to the 'assigned_to' model field
        write_only=True,     # Only used for writing data, not reading
        allow_null=True,     # Allow setting assigned_to to null
        required=False       # Not required for creating an issue
    )

    class Meta:
        model = Issue
        fields = ['id', 'title', 'description', 'status', 'owner', 'assigned_to', 'assigned_to_id', 'created_at', 'updated_at']
        read_only_fields = ['owner', 'created_at', 'updated_at'] # Owner is set automatically by the view

    def create(self, validated_data):
        # The owner is automatically set by the view's perform_create method
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # If assigned_to_id is provided, update the assigned_to field
        # The 'source' argument in PrimaryKeyRelatedField handles mapping 'assigned_to_id' to 'assigned_to'
        return super().update(instance, validated_data)