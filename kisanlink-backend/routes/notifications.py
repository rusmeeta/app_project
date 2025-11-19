from flask import Blueprint, jsonify

notifications_bp = Blueprint("notifications", __name__)

@notifications_bp.route("/notifications", methods=["GET"])
def get_notifications():
    # Example notifications
    data = [
        {"message": "Your order has been shipped."},
        {"message": "New product available."}
    ]
    return jsonify(data), 200
