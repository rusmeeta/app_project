from extensions import db
from datetime import datetime

class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    message = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)

    @staticmethod
    def add_notification(user_id, message):
        from extensions import db
        n = Notification(user_id=user_id, message=message)
        db.session.add(n)
        db.session.commit()
        return n
