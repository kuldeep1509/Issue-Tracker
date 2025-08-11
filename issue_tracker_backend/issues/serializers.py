# issues/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Issue, Team
from djoser.serializers import UserSerializer as DjoserUserSerializer, UserCreateSerializer as DjoserUserCreateSerializer

User = get_user_model()

# New: Custom UserCreateSerializer to set is_staff=True
class CustomUserCreateSerializer(DjoserUserCreateSerializer):
    class Meta(DjoserUserCreateSerializer.Meta):
        model = User
        # Include 'is_staff' in fields to ensure it's handled,
        # but make it read_only as we're setting it programmatically.
        fields = ('id', 'username', 'email', 'password', 'is_staff')
        read_only_fields = ('is_staff',) # Make it read-only for creation, as we'll set it in create method

    def create(self, validated_data):
        # Always set is_staff True for new users
        validated_data['is_staff'] = True
        user = super().create(validated_data)
        if not user.is_staff:
            user.is_staff = True
            user.save(update_fields=["is_staff"])
        return user

class CustomCurrentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'is_staff', 'is_superuser')
        read_only_fields = ('username', 'email', 'is_staff', 'is_superuser')

class SimpleUserSerializer(DjoserUserSerializer):
    class Meta(DjoserUserSerializer.Meta):
        model = User
        fields = ('id', 'username', 'email')

class TeamSerializer(serializers.ModelSerializer):
    created_by = SimpleUserSerializer(read_only=True)
    members = SimpleUserSerializer(many=True, read_only=True)
    member_ids = serializers.PrimaryKeyRelatedField( #maps with members field and used to set and get the members field by using members id
        many=True,
        queryset=User.objects.all(),
        write_only=True,
        source='members'
    )

    class Meta:
        model = Team
        fields = ['id', 'name', 'description', 'created_by', 'members', 'member_ids', 'created_at']
        read_only_fields = ['created_by', 'created_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class IssueSerializer(serializers.ModelSerializer):
    owner = SimpleUserSerializer(read_only=True)
    assigned_to = SimpleUserSerializer(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='assigned_to',
        write_only=True,
        allow_null=True,
        required=False
    )
    assigned_team = TeamSerializer(read_only=True)
    assigned_team_id = serializers.PrimaryKeyRelatedField(
        queryset=Team.objects.all(),
        source='assigned_team',
        write_only=True,
        allow_null=True,
        required=False
    )

    class Meta:
        model = Issue
        fields = ['id', 'title', 'description', 'status', 'owner', 'assigned_to', 'assigned_to_id', 'assigned_team', 'assigned_team_id', 'created_at', 'updated_at']
        read_only_fields = ['owner', 'created_at', 'updated_at', 'assigned_team']

    def validate(self, data):
        if data.get('assigned_to') and data.get('assigned_team'):
            raise serializers.ValidationError("Issue can't be assigned to both a user and a team.")
        return data
