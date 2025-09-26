from flask import Flask, render_template, session, redirect, url_for
from flask_cors import CORS
from routes.auth import auth_bp
# from routes.recommendation import recommendation_bp  # make sure blueprint is imported
from routes.farmer import farmer_bp

app = Flask(__name__, template_folder='templates')
app.secret_key = "supersecretkey"
CORS(app)

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(farmer_bp)
# app.register_blueprint(recommendation_bp)

@app.route('/')
def home():
    role = session.get("role")
    
    # Role-based redirects
    if role == 'admin':
        return redirect(url_for('admin.dashboard'))  # optional
    elif role == 'farmer':
        return redirect(url_for('farmer.dashboard'))  # optional
    elif role == 'old_customer':
        return redirect(url_for('recommendation.old_customer_recommendation'))
    elif role == 'new_customer':
        return redirect(url_for('recommendation.new_customer_recommendation'))
    else:
        return render_template('home.html', user=session.get("username"))

if __name__ == '__main__':
    app.run(debug=True, port=5001)