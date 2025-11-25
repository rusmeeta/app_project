# models_product.py
from extensions import db

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    item_name = db.Column(db.String(200))
    farmer_name = db.Column(db.String(100))
    price = db.Column(db.Float)
    available_stock = db.Column(db.Integer)
    photo_path = db.Column(db.String(200))
