from flask import Flask, send_from_directory
from flask_cors import CORS
from config import Config
from db import db
import os

# Import existing raw SQL routes
from routes.auth import auth_bp
from routes.farmer import farmer_bp
from routes.report import report_bp

# Import new SQLAlchemy routes
from routes.consumer import consumer_bp
from routes.order import order_bp
from routes.chat import chat_bp
from routes.recommend import recommend_bp

from routes.products import products_bp
app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")

@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

CORS(app, origins=["http://localhost:3000", "http://localhost:3001"])

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix="/auth")      # raw SQL
app.register_blueprint(farmer_bp, url_prefix="/farmer")  # raw SQL
app.register_blueprint(report_bp)

# New SQLAlchemy blueprints
app.register_blueprint(consumer_bp, url_prefix="/consumer")
app.register_blueprint(order_bp, url_prefix="/orders")
app.register_blueprint(chat_bp, url_prefix="/chat")
app.register_blueprint(recommend_bp, url_prefix="/recommend")

app.register_blueprint(products_bp, url_prefix="/products")


if __name__ == "__main__":
    with app.app_context():
        db.create_all()   # ONLY creates consumer-related tables
    app.run(debug=True, port=5001)
