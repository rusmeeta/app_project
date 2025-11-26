from extensions import db

class FarmerItem(db.Model):
    __tablename__ = "farmer_items"

    id = db.Column(db.Integer, primary_key=True)
    farmer_id = db.Column(db.Integer, nullable=False)
    item_name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    photo_path = db.Column(db.String(255))
    location = db.Column(db.String(255))
    min_order_qty = db.Column(db.Integer, default=1)
    available_stock = db.Column(db.Integer, default=0)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
