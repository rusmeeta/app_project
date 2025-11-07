from flask import Blueprint, request, jsonify
from db import get_db_connection

farmer_bp = Blueprint('farmer', __name__)

# ✅ Add Product
@farmer_bp.route('/add-product', methods=['POST'])
def add_product():
    data = request.get_json()
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        'INSERT INTO products (farmer_id, name, price, quantity, description, category) VALUES (%s, %s, %s, %s, %s, %s)',
        (data['farmer_id'], data['name'], data['price'], data['quantity'], data['description'], data['category'])
    )
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'message': 'Product added successfully'}), 201


# ✅ Get all products for a farmer
@farmer_bp.route('/get-products/<int:farmer_id>', methods=['GET'])
def get_products(farmer_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM products WHERE farmer_id = %s', (farmer_id,))
    products = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(products)


# ✅ Delete a product
@farmer_bp.route('/delete-product/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('DELETE FROM products WHERE id = %s', (product_id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'message': 'Product deleted successfully'})


# ✅ Update product
@farmer_bp.route('/update-product/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    data = request.get_json()
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        UPDATE products 
        SET name = %s, price = %s, quantity = %s, description = %s, category = %s 
        WHERE id = %s
    ''', (data['name'], data['price'], data['quantity'], data['description'], data['category'], product_id))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'message': 'Product updated successfully'})
