from flask import Blueprint, render_template, session
from geopy.geocoders import Nominatim
from .recommenders import recommend_nearby_farmers, recommend_based_on_history

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
    user_lat = session.get('latitude')
    user_lon = session.get('longitude')
    farmers = []
    if user_lat and user_lon:
        from .recommenders import recommend_nearby_farmers
        farmers = recommend_nearby_farmers(user_lat, user_lon)
    return render_template('new_customer_recommendation.html', farmers=farmers)

@recommendation_bp.route('/old_customer')
def old_customer_recommendation():
    user_id = session.get('user_id')
    products = []
    if user_id:
        from .recommenders import recommend_based_on_history
        products = recommend_based_on_history(user_id)
    return render_template('old_customer_recommendation.html', products=products)
