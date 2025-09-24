from flask import Blueprint, request, jsonify
from db import get_db_connection
from psycopg2.extras import RealDictCursor


products_bp = Blueprint('products', __name__)

@products_bp.route('/products', methods=['GET'])
def get_products():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute('''
        SELECT products.id, products.name, products.price, locations.name AS location
        FROM products LEFT JOIN locations ON products.location_id = locations.id
    ''')
    products = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(products)

@products_bp.route('/products', methods=['POST'])
def add_product():
    data = request.get_json()
    name = data.get('name')
    price = data.get('price')
    location_id = data.get('location_id')

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        'INSERT INTO products (name, price, location_id) VALUES (%s, %s, %s)',
        (name, price, location_id)
    )
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'message': 'Product added successfully'}), 201
