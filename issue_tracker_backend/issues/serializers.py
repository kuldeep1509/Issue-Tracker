# issues/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from djoser.serializers import UserSerializer as DjoserUserSerializer
from .models import Issue, Team # Import Team model

User = get_user_model()

class SimpleUserSerializer(DjoserUserSerializer):
    '''
    Used inside the IssueSerializer to show user details of owner and assigned_to.
    Shows only id, username, and email.
    '''
    class Meta(DjoserUserSerializer.Meta):
        model = User
        fields = ('id', 'username', 'email') # Expose basic user info

class TeamSerializer(serializers.ModelSerializer):
    """
    Serializer for the Team model.
    Includes owner and members for display.
    """
    owner = SimpleUserSerializer(read_only=True) # Display owner details
    # For members, we'll use PrimaryKeyRelatedField for writing (input)
    # and SimpleUserSerializer for reading (output)
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
        # Handle members separately if 'member_ids' is in validated_data
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