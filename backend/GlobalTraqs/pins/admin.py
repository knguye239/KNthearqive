from django.contrib import admin
from .models import pin, categoryType

from django import forms

class PinAdminForm(forms.ModelForm):
	class Meta:
		model = pin
		fields = '__all__'
		widgets = {
			'title': forms.TextInput(attrs={'required': False}),
			'description': forms.Textarea(attrs={'required': False}),
			'latitude': forms.NumberInput(attrs={'required': False}),
			'longitude': forms.NumberInput(attrs={'required': False}),
			'category': forms.Select(attrs={'required': False}),
			'upVotes': forms.NumberInput(attrs={'required': False}),
			'startDate': forms.DateInput(attrs={'required': False}),
			'endDate': forms.DateInput(attrs={'required': False}),
			'is_anonymous_pin': forms.CheckboxInput(attrs={'required': False}),
			'postDate': forms.DateInput(attrs={'required': False}),
			'lastEditDate': forms.DateInput(attrs={'required': False}),
			'lastPersonEdit': forms.Select(attrs={'required': False}),
			'postCode': forms.TextInput(attrs={'required': False}),
			'locality': forms.TextInput(attrs={'required': False}),
			'region': forms.TextInput(attrs={'required': False}),
			'country': forms.TextInput(attrs={'required': False}),
			'address': forms.TextInput(attrs={'required': False}),
		}


def make_community(modeladmin, request, queryset):
	# Assumes community category has id=4
	queryset.update(category=4)
make_community.short_description = "Change category to Community"

@admin.register(categoryType)
class CategoryTypeAdmin(admin.ModelAdmin):
    list_display = ('categoryName', 'image_url')
    search_fields = ('categoryName',)
from django.db import models
from .models import pin
import requests

def geocode_address(address):
	url = 'https://nominatim.openstreetmap.org/search'
	params = {
		'q': address,
		'format': 'json',
		'limit': 1
	}
	headers = {'User-Agent': 'arqive-admin-geocoder/1.0'}
	try:
		resp = requests.get(url, params=params, headers=headers, timeout=10)
		resp.raise_for_status()
		data = resp.json()
		if data:
			return float(data[0]['lat']), float(data[0]['lon'])
	except Exception:
		pass
	return None, None

def check_address_vs_coordinates(modeladmin, request, queryset):
	mismatches = []
	debug_info = []
	for p in queryset:
		address = ', '.join(filter(None, [p.address, p.locality, p.region, p.country]))
		if not address:
			debug_info.append(f"{p.title} (ID {p.id}): No address provided.")
			continue
		geo_lat, geo_lon = geocode_address(address)
		debug_info.append(
			f"{p.title} (ID {p.id}):\n  Address: '{address}'\n  Pin coords: ({p.latitude}, {p.longitude})\n  Geocoded coords: ({geo_lat}, {geo_lon})\n  Lat diff: {abs(float(p.latitude) - geo_lat) if geo_lat is not None else 'N/A'}\n  Lon diff: {abs(float(p.longitude) - geo_lon) if geo_lon is not None else 'N/A'}"
		)
		if geo_lat is None or geo_lon is None:
			continue
		# Allow a small margin (0.01 deg ~1km)
		if (abs(float(p.latitude) - geo_lat) > 0.01) or (abs(float(p.longitude) - geo_lon) > 0.01):
			mismatches.append(f"{p.title} (ID {p.id}): Address '{address}' → ({geo_lat:.5f}, {geo_lon:.5f}), Pin ({p.latitude}, {p.longitude})")
	if mismatches:
		modeladmin.message_user(request, "Mismatches found:\n" + '\n'.join(mismatches) + "\n\nDebug info:\n" + '\n'.join(debug_info), level='WARNING')
	else:
		modeladmin.message_user(request, "All selected pins match their geocoded address coordinates.\n\nDebug info:\n" + '\n'.join(debug_info))
check_address_vs_coordinates.short_description = "Check address vs coordinates"

class SuspiciousPinFilter(admin.SimpleListFilter):
	title = 'Suspicious'
	parameter_name = 'suspicious'

	def lookups(self, request, model_admin):
		return (
			('yes', 'Suspicious'),
			('no', 'Not Suspicious'),
		)

	def queryset(self, request, queryset):
		if self.value() == 'yes':
			return queryset.filter(
				models.Q(latitude__lt=-90) | models.Q(latitude__gt=90) |
				models.Q(longitude__lt=-180) | models.Q(longitude__gt=180) |
				models.Q(latitude__isnull=True) | models.Q(longitude__isnull=True)
			)
		elif self.value() == 'no':
			return queryset.exclude(
				models.Q(latitude__lt=-90) | models.Q(latitude__gt=90) |
				models.Q(longitude__lt=-180) | models.Q(longitude__gt=180) |
				models.Q(latitude__isnull=True) | models.Q(longitude__isnull=True)
			)
		return queryset


class PinAdmin(admin.ModelAdmin):
	form = PinAdminForm
	list_display = ('title', 'latitude', 'longitude', 'owner', 'category', 'upVotes', 'postDate', 'lastEditDate')
	search_fields = ('title', 'description', 'owner__username')
	list_filter = ('category', 'is_anonymous_pin', 'postDate', 'lastEditDate', SuspiciousPinFilter,)
	actions = [make_community, check_address_vs_coordinates]

admin.site.register(pin, PinAdmin)
