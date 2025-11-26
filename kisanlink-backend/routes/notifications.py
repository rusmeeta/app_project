from flask import Blueprint, jsonify, session
from models_notification import Notification

notifications_bp = Blueprint("notifications", __name__)

@notifications_bp.route("/notifications", methods=["GET"])
def get_notifications():
    if "user_id" not in session:
        return jsonify({"status": "error", "message": "Not logged in"}), 401

    user_id = session["user_id"]
    notes = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()

    return jsonify([
        {
            "id": n.id,
            "message": n.message,
            "is_read": n.is_read,
            "created_at": n.created_at.strftime("%Y-%m-%d %H:%M:%S")
        } for n in notes
    ])
