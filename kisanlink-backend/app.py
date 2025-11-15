from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from routes.auth import auth_bp
from routes.farmer import farmer_bp
import os

app = Flask(__name__)
app.secret_key = "supersecretkey"
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")

@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# Allow CORS for your frontend
CORS(app, origins=["http://localhost:3000", "http://localhost:3001"])

app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(farmer_bp, url_prefix="/farmer")

if __name__ == "__main__":
    app.run(debug=True, port=5001)
