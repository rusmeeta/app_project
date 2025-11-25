# kisanlink-backend/models_user.py
from extensions import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    total_revenue = db.Column(db.Float, default=0)  # for farmers

    # Optional: add relationships if needed
    # orders = db.relationship("Order", backref="consumer", lazy=True)
    # cart_items = db.relationship("CartItem", backref="consumer", lazy=True)
