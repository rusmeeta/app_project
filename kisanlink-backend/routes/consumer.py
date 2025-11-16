from flask import Blueprint, request, jsonify
from models_consumer import Consumer
from db import db

consumer_bp = Blueprint("consumer", __name__)

@consumer_bp.route("/register", methods=["POST"])
def register_consumer():
    data = request.json
    consumer = Consumer(
        fullname=data["fullname"],
        email=data["email"],
        latitude=data["latitude"],
        longitude=data["longitude"],
        login_count=1
    )
    db.session.add(consumer)
    db.session.commit()
    return jsonify({"message": "Consumer registered"}), 201
