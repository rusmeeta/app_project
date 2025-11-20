from flask import Flask, send_from_directory
from flask_cors import CORS
from config import Config
from db import db
import os
from extensions import db   # <

# Raw SQL routes
from routes.auth import auth_bp
from routes.farmer import farmer_bp
from routes.report import report_bp

# SQLAlchemy routes
from routes.consumer import consumer_bp
from routes.order import order_bp
from routes.chat import chat_bp
from routes.recommend import recommend_bp
from routes.products import products_bp
from routes.cart import cart_bp  # new
from routes.notifications import notifications_bp

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")

@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# Enable CORS
CORS(app, origins=["http://localhost:3000", "http://localhost:3001"], supports_credentials=True)

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(farmer_bp, url_prefix="/farmer")
app.register_blueprint(report_bp)

app.register_blueprint(consumer_bp, url_prefix="/consumer")
app.register_blueprint(order_bp, url_prefix="/orders")
app.register_blueprint(chat_bp, url_prefix="/chat")
app.register_blueprint(recommend_bp, url_prefix="/recommend")
app.register_blueprint(products_bp, url_prefix="/products")
app.register_blueprint(cart_bp, url_prefix="/cart") 
app.register_blueprint(notifications_bp) # new

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5001)