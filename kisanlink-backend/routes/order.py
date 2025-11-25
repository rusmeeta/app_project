from flask import Blueprint, request, jsonify
from models_consumer import Order, OrderItem, Notification
from db import db

order_bp = Blueprint("order", __name__)

@order_bp.route("/create", methods=["POST"])
def create_order():
    data = request.json

    order = Order(
        consumer_id=data["consumer_id"],
        farmer_id=data["farmer_id"]
    )
    db.session.add(order)
    db.session.commit()

    for item in data["items"]:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item["product_id"],
            quantity=item["quantity"]
        )
        db.session.add(order_item)

    notification = Notification(
        user_id=data["farmer_id"],
        message=f"New order received from customer {data['consumer_id']}"
    )
    db.session.add(notification)

    db.session.commit()

    return jsonify({"message": "Order placed"})