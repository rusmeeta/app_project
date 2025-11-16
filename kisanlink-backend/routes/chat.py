from flask import Blueprint, request, jsonify
from models_consumer import Message
from db import db

chat_bp = Blueprint("chat", __name__)

@chat_bp.route("/send", methods=["POST"])
def send_message():
    data = request.json

    msg = Message(
        sender_id=data["sender_id"],
        receiver_id=data["receiver_id"],
        content=data["content"]
    )
    db.session.add(msg)
    db.session.commit()

    return jsonify({"message": "sent"})
