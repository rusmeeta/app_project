from flask import Blueprint, jsonify, send_file
from flask import current_app as app
import psycopg2
import io
from reportlab.pdfgen import canvas

report_bp = Blueprint('report_bp', __name__)

# Database connection helper
def get_db_connection():
    conn = psycopg2.connect(
        host="localhost",
        database="kisanlink_db",
        user="kisanlink_user",
        password="password123"
    )
    return conn

# --------- Endpoint: Get report data as JSON ----------
@report_bp.route('/api/farmer/report/<int:farmer_id>', methods=['GET'])
def get_report(farmer_id):
    conn = get_db_connection()
    cur = conn.cursor()

    # Total Revenue
    cur.execute("""
        SELECT COALESCE(SUM(total_price),0) 
        FROM orders 
        WHERE farmer_id=%s;
    """, (farmer_id,))
    total_revenue = cur.fetchone()[0]

    # Total Orders
    cur.execute("""
        SELECT COUNT(*) 
        FROM orders 
        WHERE farmer_id=%s;
    """, (farmer_id,))
    total_orders = cur.fetchone()[0]

    # Most Sold Product
    cur.execute("""
        SELECT fi.item_name, SUM(o.quantity) AS total_sold
        FROM orders o
        JOIN farmer_items fi ON o.item_id = fi.id
        WHERE o.farmer_id=%s
        GROUP BY fi.item_name
        ORDER BY total_sold DESC
        LIMIT 1;
    """, (farmer_id,))
    most_sold = cur.fetchone()
    most_sold_product = most_sold[0] if most_sold else "N/A"

    # Low Stock Items
    cur.execute("""
        SELECT item_name, available_stock
        FROM farmer_items
        WHERE farmer_id=%s AND available_stock < 15;
    """, (farmer_id,))
    low_stock_items = cur.fetchall()
    low_stock_count = len(low_stock_items)

    # Sales Trend (Line chart)
    cur.execute("""
        SELECT DATE(order_date) AS date, COALESCE(SUM(total_price),0) AS revenue
        FROM orders
        WHERE farmer_id=%s
        GROUP BY DATE(order_date)
        ORDER BY date;
    """, (farmer_id,))
    sales_trend = [{"date": str(r[0]), "sales": float(r[1])} for r in cur.fetchall()]

    # Revenue Breakdown (Pie chart)
    cur.execute("""
        SELECT fi.item_name, COALESCE(SUM(o.total_price),0) AS revenue
        FROM orders o
        JOIN farmer_items fi ON o.item_id = fi.id
        WHERE o.farmer_id=%s
        GROUP BY fi.item_name;
    """, (farmer_id,))
    revenue_breakdown = [{"product": r[0], "value": float(r[1])} for r in cur.fetchall()]

    # Inventory Table
    cur.execute("""
        SELECT item_name, available_stock
        FROM farmer_items
        WHERE farmer_id=%s;
    """, (farmer_id,))
    inventory_table = [{"product": r[0], "stock": r[1]} for r in cur.fetchall()]

    cur.close()
    conn.close()

    return jsonify({
        "summary": {
            "totalRevenue": float(total_revenue),
            "totalOrders": total_orders,
            "mostSoldProduct": most_sold_product,
            "lowStock": low_stock_count
        },
        "salesTrend": sales_trend,
        "revenueBreakdown": revenue_breakdown,
        "inventoryTable": inventory_table
    })


# --------- Endpoint: Download PDF ----------
@report_bp.route('/api/farmer/report/pdf/<int:farmer_id>', methods=['GET'])
def download_report_pdf(farmer_id):
    conn = get_db_connection()
    cur = conn.cursor()

    # Fetch summary
    cur.execute("""
        SELECT COALESCE(SUM(total_price),0), COUNT(*)
        FROM orders
        WHERE farmer_id=%s;
    """, (farmer_id,))
    total_revenue, total_orders = cur.fetchone()

    cur.execute("""
        SELECT fi.item_name, SUM(o.quantity) AS total_sold
        FROM orders o
        JOIN farmer_items fi ON o.item_id = fi.id
        WHERE o.farmer_id=%s
        GROUP BY fi.item_name
        ORDER BY total_sold DESC
        LIMIT 1;
    """, (farmer_id,))
    most_sold = cur.fetchone()
    most_sold_product = most_sold[0] if most_sold else "N/A"

    cur.execute("""
        SELECT item_name, available_stock
        FROM farmer_items
        WHERE farmer_id=%s;
    """, (farmer_id,))
    inventory = cur.fetchall()

    cur.close()
    conn.close()

    # Generate PDF
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer)
    pdf.setTitle("Farmer Report")

    pdf.setFont("Helvetica-Bold", 20)
    pdf.drawString(50, 800, "KisanLink Farmer Report")

    pdf.setFont("Helvetica", 14)
    pdf.drawString(50, 760, f"Total Revenue: Rs. {total_revenue}")
    pdf.drawString(50, 740, f"Total Orders: {total_orders}")
    pdf.drawString(50, 720, f"Most Sold Product: {most_sold_product}")

    pdf.drawString(50, 690, "Inventory:")
    y = 670
    for item_name, stock in inventory:
        pdf.drawString(60, y, f"{item_name} - Stock: {stock}")
        y -= 20

    pdf.save()
    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name="farmer_report.pdf", mimetype="application/pdf")
