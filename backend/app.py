from flask import Flask, render_template
from flask import request, redirect, url_for
import os
import json
from firebase_admin import credentials
import firebase_admin
from firebase_admin import credentials, firestore
import cloudinary
import cloudinary.uploader

firebase_json = os.environ.get("FIREBASE_KEY")

if not firebase_json:
    raise ValueError("FIREBASE_KEY not set")

cred_dict = json.loads(firebase_json)
cred = credentials.Certificate(cred_dict)

# 🔥 ADD THIS LINE
firebase_admin.initialize_app(cred)

db = firestore.client()

cloudinary.config(
    cloud_name="dci3ptl9x",
    api_key="324354639345435",
    api_secret="NkLemfGdS4QAxHXV6NJ75JMJ7Ec"
)


# Initialize Firebase





app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/services")
def services():
    return render_template("services.html")

@app.route('/gallery')
def gallery():
    docs = db.collection('gallery').stream()

    gallery_data = []
    for doc in docs:
        data = doc.to_dict()
        data['id'] = doc.id  # ✅ ADD THIS LINE
        gallery_data.append(data)

    return render_template('gallery.html', gallery_data=gallery_data)

@app.route("/booking")
def booking():
    return render_template("booking.html")

@app.route("/booking-check")
def booking_check():
    return render_template("booking-check.html")

@app.route("/quotation")
def quotation():
    return render_template("quotation.html")

@app.route("/contact")
def contact():
    return render_template("contact.html")

@app.route("/login")
def login():
    return render_template("login.html")

@app.route('/admin')
def admin():
    docs = db.collection('gallery').stream()

    gallery_data = []
    for doc in docs:
        data = doc.to_dict()
        data['id'] = doc.id  # ✅ ADD THIS LINE
        gallery_data.append(data)

    return render_template('admin.html', gallery_data=gallery_data)



@app.route('/upload-gallery', methods=['POST'])
def upload_gallery():
    file = request.files['image']
    title = request.form['title']
    description = request.form['description']

    result = cloudinary.uploader.upload(file)
    image_url = result['secure_url']

    db.collection('gallery').add({
        'title': title,
        'description': description,
        'image': image_url
    })

    return redirect('/admin')


@app.route('/delete-gallery', methods=['POST'])
def delete_gallery():
    image_url = request.form['image']

    docs = db.collection('gallery').stream()

    for doc in docs:
        if doc.to_dict().get('image') == image_url:
            db.collection('gallery').document(doc.id).delete()

    return redirect('/admin')



@app.route('/edit-gallery', methods=['POST'])
def edit_gallery():
    data = request.get_json()

    image_url = data['image']
    new_title = data['title']
    new_description = data['description']

    docs = db.collection('gallery').stream()

    for doc in docs:
        if doc.to_dict().get('image') == image_url:
            db.collection('gallery').document(doc.id).update({
                'title': new_title,
                'description': new_description
            })

    return {'status': 'success'}

if __name__ == "__main__":
    app.run(debug=True)