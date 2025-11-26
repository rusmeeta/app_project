from flask import Blueprint, jsonify, session
from models_notification import Notification

notifications_bp = Blueprint("notifications", __name__)

@notifications_bp.route("/", methods=["GET"])
def get_notifications():
    if "user_id" not in session:
        return jsonify({"status": "error", "message": "Not logged in"}), 401
    notifications = Notification.query.filter_by(user_id=session["user_id"]).all()
    return jsonify({
        "status": "success",
        "notifications": [
            {"message": n.message, "timestamp": n.created_at.isoformat()} for n in notifications
        ]
    })

