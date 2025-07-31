# issues/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Issue, Team
from djoser.serializers import UserSerializer as DjoserUserSerializer

User = get_user_model()

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
    member_ids = serializers.PrimaryKeyRelatedField(
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
    assigned_team = serializers.PrimaryKeyRelatedField(
        queryset=Team.objects.all(),
        allow_null=True,
        required=False
    )

    class Meta:
        model = Issue
        fields = ['id', 'title', 'description', 'status', 'owner', 'assigned_to', 'assigned_to_id', 'assigned_team', 'created_at', 'updated_at']
        read_only_fields = ['owner', 'created_at', 'updated_at']

    def validate(self, data):
        if data.get('assigned_to') and data.get('assigned_team'):
            raise serializers.ValidationError("Issue can't be assigned to both a user and a team.")
        return data