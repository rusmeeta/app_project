# routes/chat.py
from flask import Blueprint, request, jsonify

# ✅ Define blueprint first
chat_bp = Blueprint("chat", __name__)

# Example: fetch messages for a consumer
@chat_bp.route("/messages/<int:consumer_id>", methods=["GET"])
def get_messages(consumer_id):
    # Example static messages
    messages = [
        {"from": "Farmer A", "message": "Your order is ready."},
        {"from": "Farmer B", "message": "New product available."}
    ]
    return jsonify(messages), 200

# Example: send a message
@chat_bp.route("/messages", methods=["POST"])
def send_message():
    data = request.json
    # Here you can save to database later
    return jsonify({"status": "Message sent", "data": data}), 201
