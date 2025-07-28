# issues/permissions.py
from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit or delete it.
    Read-only access is allowed for any authenticated user.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD means return headers like 200 oK content-type and etc, or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the issue.
        # Check if the requesting user is the owner OR an admin (is_staff)
        # Admins can manage all issues.
        return obj.owner == request.user or request.user.is_staff