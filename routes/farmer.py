from flask import Blueprint, render_template, request, redirect, session, flash
from db import get_db_connection

farmer_bp = Blueprint('farmer', __name__, url_prefix='/farmer')

@farmer_bp.route('/dashboard')
def dashboard():
    if session.get('role') != 'farmer':
        return redirect('/login')
    return render_template('farmer_dashboard.html')

@farmer_bp.route('/add-product', methods=['GET', 'POST'])
def add_product():
    if session.get('role') != 'farmer':
        return redirect('/login')
    
    if request.method == 'POST':
        name = request.form.get('name')
        price = request.form.get('price')
        quantity = request.form.get('quantity')
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute(
                'INSERT INTO products (name, price, quantity, farmer_id) VALUES (%s,%s,%s,%s)',
                (name, price, quantity, session['user_id'])
            )
            conn.commit()
        conn.close()
        flash("Product added successfully!", "success")
        return redirect('/farmer/dashboard')

    return render_template('add_product.html')
