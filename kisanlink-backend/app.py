from flask import Flask
from flask_cors import CORS
from routes.auth import auth_bp

app = Flask(__name__)
app.secret_key = "supersecretkey"
CORS(app)  # allow React to call this API

app.register_blueprint(auth_bp)
@app.route('/')
def home():
    return "Flask server is running!"


if __name__ == "__main__":
    app.run(debug=True, port=5001)
