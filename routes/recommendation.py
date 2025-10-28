# routes/recommendation.py
from flask import Blueprint, render_template
from geopy.geocoders import Nominatim

recommendation_bp = Blueprint('recommendation', __name__, url_prefix='/recommendation')

# ------------------ GEOCODE FUNCTION ------------------
geolocator = Nominatim(user_agent="kisanlink_app")

def get_lat_lon(location_str):
    """
    Convert a location string to latitude and longitude.
    Returns (lat, lon) or (None, None) if not found.
    """
    try:
        loc = geolocator.geocode(location_str)
        if loc:
            return loc.latitude, loc.longitude
    except:
        pass
    return None, None

# ------------------ ROUTES ------------------
@recommendation_bp.route('/new_customer')
def new_customer_recommendation():
    return render_template('new_customer_recommendation.html')

@recommendation_bp.route('/old_customer')
def old_customer_recommendation():
    return render_template('old_customer_recommendation.html')
