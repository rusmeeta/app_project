from flask import Blueprint, request, jsonify, session
from extensions import db
from models_cart import CartItem
from models_farmer_items import FarmerItem
from models_user import User

cart_bp = Blueprint("cart", __name__)

DELIVERY_PER_FARMER = 50

# -----------------------------
# Get cart items
# -----------------------------
@cart_bp.route("/", methods=["GET"])
def get_cart_items():
    if "user_id" not in session:
        return jsonify({"status": "error", "message": "Not logged in"}), 401

    consumer_id = session["user_id"]

    items = (
        db.session.query(
            CartItem.id.label("cart_id"),
            CartItem.product_id,
            CartItem.quantity,
            FarmerItem.item_name,
            FarmerItem.price,
            FarmerItem.available_stock,
            FarmerItem.photo_path,
            User.fullname.label("farmer_name"),
        )
        .join(FarmerItem, CartItem.product_id == FarmerItem.id)
        .join(User, FarmerItem.farmer_id == User.id)
        .filter(CartItem.consumer_id == consumer_id)
        .all()
    )

    cart_data = []
    for i in items:
        cart_data.append(
            {
                "id": i.cart_id,
                "product_id": i.product_id,
                "item_name": i.item_name,
                "farmer_name": i.farmer_name or "Unknown",
                "price": float(i.price),
                "available_stock": i.available_stock,
                "quantity": i.quantity,
                "photo_path": i.photo_path,
            }
        )
    return jsonify(cart_data)


# -----------------------------
# Add item to cart
# -----------------------------
@cart_bp.route("/", methods=["POST"])
def add_to_cart():
    if "user_id" not in session:
        return jsonify({"status": "error", "message": "Not logged in"}), 401

    data = request.get_json()
    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)
    consumer_id = session["user_id"]

    if not product_id:
        return jsonify({"status": "error", "message": "Product ID is required"}), 400

    item = CartItem.query.filter_by(consumer_id=consumer_id, product_id=product_id).first()
    if item:
        item.quantity += quantity
    else:
        item = CartItem(consumer_id=consumer_id, product_id=product_id, quantity=quantity)
        db.session.add(item)

    db.session.commit()
    return jsonify({"status": "success", "message": "Item added to cart"})


# -----------------------------
# Update quantity
# -----------------------------
@cart_bp.route("/<int:item_id>", methods=["PUT"])
def update_cart_item(item_id):
    if "user_id" not in session:
        return jsonify({"status": "error", "message": "Not logged in"}), 401

    data = request.get_json()
    quantity = data.get("quantity")
    if quantity is None:
        return jsonify({"status": "error", "message": "Quantity is required"}), 400

    item = CartItem.query.get(item_id)
    if not item or item.consumer_id != session["user_id"]:
        return jsonify({"status": "error", "message": "Item not found"}), 404

    item.quantity = quantity
    db.session.commit()
    return jsonify({"status": "success", "message": "Quantity updated"})


# -----------------------------
# Remove item
# -----------------------------
@cart_bp.route("/<int:item_id>", methods=["DELETE"])
def remove_cart_item(item_id):
    if "user_id" not in session:
        return jsonify({"status": "error", "message": "Not logged in"}), 401

    item = CartItem.query.get(item_id)
    if not item or item.consumer_id != session["user_id"]:
        return jsonify({"status": "error", "message": "Item not found"}), 404

    db.session.delete(item)
    db.session.commit()
    return jsonify({"status": "success", "message": "Item removed"})


# -----------------------------
# Checkout
# -----------------------------
@cart_bp.route("/checkout", methods=["POST"])
def checkout():
    if "user_id" not in session:
        return jsonify({"status": "error", "message": "Not logged in"}), 401

    consumer_id = session["user_id"]
    CartItem.query.filter_by(consumer_id=consumer_id).delete()
    db.session.commit()
    return jsonify({"status": "success", "message": "Order placed successfully"})
