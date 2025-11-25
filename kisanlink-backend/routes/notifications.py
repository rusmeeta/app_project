from flask import Blueprint, request, jsonify
from extensions import db
from models_notifications import Notification

notifications_bp = Blueprint("notifications", __name__)

@notifications_bp.route("/notifications", methods=["GET"])
def get_notifications():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    try:
        notifications = Notification.query.filter_by(user_id=int(user_id)).order_by(Notification.created_at.desc()).all()
        result = [
            {"id": n.id, "message": n.message, "created_at": n.created_at.strftime("%Y-%m-%d %H:%M:%S")}
            for n in notifications
        ]
        return jsonify(result), 200
    except Exception as e:
        print("ERROR fetching notifications:", e)
        return jsonify({"error": str(e)}), 500
