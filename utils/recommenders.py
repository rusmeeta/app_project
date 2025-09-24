from db import get_db_connection

# Determine customer type
def get_customer_type(user_id):
    conn = get_db_connection()
    with conn.cursor() as cur:
        cur.execute('SELECT 1 FROM orders WHERE customer_id = %s LIMIT 1', (user_id,))
        result = cur.fetchone()
    conn.close()
    if result:
        return 'old_customer'
    else:
        return 'new_customer'

# Content-based recommendation for old customer
def content_based_recommend(user_id):
    # Fetch user's past products
    # Compute similarity with all products
    # Return top N recommended products
    return []

# Distance-based recommendation for new customer
def distance_based_recommend(customer_location):
    # Fetch farmers and their products
    # Sort by nearest distance to customer
    return []
