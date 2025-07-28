# issues/admin.py
from django.contrib import admin
from .models import Issue

@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'owner', 'assigned_to', 'created_at', 'updated_at')
    list_filter = ('status', 'owner', 'assigned_to')
    search_fields = ('title', 'description')
    raw_id_fields = ('owner', 'assigned_to') # Use raw ID for ForeignKey lookups for better UX with many users
    
    fieldsets = (
        (None, {'fields': ('title', 'description', 'status')}),
        ('Assignment', {'fields': ('owner', 'assigned_to')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )
    readonly_fields = ('created_at', 'updated_at')