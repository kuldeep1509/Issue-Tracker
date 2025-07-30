from rest_framework import serializers
from django.contrib.auth import get_user_model
# Import Djoser's base serializers for extension
from djoser.serializers import UserSerializer as DjoserUserSerializer, UserCreateSerializer as DjoserUserCreateSerializer
from .models import Issue, Team

User = get_user_model()

# This serializer is used by Djoser for the /auth/users/me/ endpoint
# and for /auth/users/ endpoints, as configured in settings.py.
# It aligns with 'issues.serializers.CustomCurrentUserSerializer' from your DJOSER settings.
class CustomCurrentUserSerializer(DjoserUserSerializer):
    class Meta(DjoserUserSerializer.Meta):
        model = User
        # Expose all fields you want for the current user's profile.
        # Ensure 'id', 'username', 'email' exist on your User model.
        fields = ('id', 'username', 'email')
        # If your custom user model has other fields like 'first_name', 'last_name',
        # and you want to expose them via /me/, add them here.
        # Example: fields = ('id', 'username', 'email', 'first_name', 'last_name')


# This serializer is used for nested representations (e.g., inside Issue or Team serializers)
# where you only need basic user info.
class SimpleUserSerializer(DjoserUserSerializer):
    class Meta(DjoserUserSerializer.Meta):
        model = User
        fields = ('id', 'username', 'email')

# If you use a custom user creation serializer with Djoser, configure it in settings.py
# and it should look something like this.
class CustomUserCreateSerializer(DjoserUserCreateSerializer):
    class Meta(DjoserUserCreateSerializer.Meta):
        model = User
        fields = ('id', 'username', 'email', 'password') # Basic fields for user creation


class TeamSerializer(serializers.ModelSerializer):
    """
    Serializer for the Team model.
    Includes owner and members for display.
    """
    owner = SimpleUserSerializer(read_only=True) # Display owner details
    members = SimpleUserSerializer(many=True, read_only=True)
    member_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source='members' # Maps to the 'members' ManyToMany field
    )

    class Meta:
        model = Team
        fields = ['id', 'name', 'description', 'owner', 'members', 'member_ids', 'created_at', 'updated_at']
        read_only_fields = ['owner', 'created_at', 'updated_at'] # Owner is set automatically

    def create(self, validated_data):
        member_ids = validated_data.pop('members', []) # Pop 'members' (from source='members')
        team = Team.objects.create(**validated_data)
        team.members.set(member_ids) # Set members after team creation
        return team

    def update(self, instance, validated_data):
        member_ids = validated_data.pop('members', None) # Pop 'members'

        # Update basic fields
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.save()

        # Update members if provided
        if member_ids is not None:
            instance.members.set(member_ids)

        return instance


class IssueSerializer(serializers.ModelSerializer):
    owner = SimpleUserSerializer(read_only=True) # Display owner details
    assigned_to = SimpleUserSerializer(read_only=True) # Display assigned user details
    assigned_team = TeamSerializer(read_only=True) # NEW: Display assigned team details

    # For writing (input) - using IDs for assigned_to and assigned_team
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='assigned_to',
        write_only=True,
        allow_null=True,
        required=False
    )
    # NEW: For writing (input) - using ID for assigned_team
    assigned_team_id = serializers.PrimaryKeyRelatedField(
        queryset=Team.objects.all(), # Query against Team model
        source='assigned_team',
        write_only=True,
        allow_null=True,
        required=False
    )

    class Meta:
        model = Issue
        # Include new fields for both input (ids) and output (nested serializers)
        fields = ['id', 'title', 'description', 'status', 'owner', 'assigned_to', 'assigned_team', 'assigned_to_id', 'assigned_team_id', 'created_at', 'updated_at']
        read_only_fields = ['owner', 'created_at', 'updated_at'] # Owner is set automatically

    def create(self, validated_data):
        # The owner is set based on the request.user in the view
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)