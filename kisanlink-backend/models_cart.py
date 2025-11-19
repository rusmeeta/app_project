from db import db

class CartItem(db.Model):
    __tablename__ = "cart_items"
    __table_args__ = {"extend_existing": True}  # <--- add this

    id = db.Column(db.Integer, primary_key=True)
    consumer_id = db.Column(db.Integer, nullable=False)
    product_id = db.Column(db.Integer, nullable=False)
    quantity = db.Column(db.Integer, default=1)
