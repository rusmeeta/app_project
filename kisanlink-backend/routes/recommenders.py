from db import get_db_connection
from math import radians, cos, sin, asin, sqrt

# ------------------ DISTANCE CALCULATION ------------------
def haversine(lat1, lon1, lat2, lon2):
    """Calculate the great-circle distance in km between two points"""
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1)*cos(lat2)*sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    r = 6371  # Earth radius in km
    return c * r

# ------------------ NEW CUSTOMER ------------------
def recommend_nearby_farmers(user_lat, user_lon, max_distance_km=10):
    """
    Returns a list of farmers within max_distance_km of the user.
    Each farmer is a dict: {id, name, location, latitude, longitude, distance_km}
    """
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, fullname, location, latitude, longitude
        FROM users
        WHERE user_type='farmer' AND latitude IS NOT NULL AND longitude IS NOT NULL
    """)
    farmers = cur.fetchall()
    cur.close()
    conn.close()

    nearby_farmers = []
    for f in farmers:
        fid, name, loc, flat, flon = f
        distance = haversine(user_lat, user_lon, flat, flon)
        if distance <= max_distance_km:
            nearby_farmers.append({
                'id': fid,
                'name': name,
                'location': loc,
                'latitude': flat,
                'longitude': flon,
                'distance_km': round(distance, 2)
            })

    # Sort by distance
    nearby_farmers.sort(key=lambda x: x['distance_km'])
    return nearby_farmers

# ------------------ OLD CUSTOMER ------------------
def recommend_based_on_history(user_id, limit=10):
    """
    Returns products that the user usually buys based on purchase history.
    Each product is a dict: {id, name, price, farmer_id}
    """
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT p.id, p.name, p.price, p.farmer_id
        FROM purchases pu
        JOIN products p ON pu.product_id = p.id
        WHERE pu.user_id = %s
        GROUP BY p.id, p.name, p.price, p.farmer_id
        ORDER BY COUNT(*) DESC
        LIMIT %s
    """, (user_id, limit))
    products = cur.fetchall()
    cur.close()
    conn.close()

    return [
        {'id': pid, 'name': name, 'price': price, 'farmer_id': fid}
        for pid, name, price, fid in products
    ]
