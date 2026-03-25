from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/services")
def services():
    return render_template("services.html")

@app.route("/gallery")
def gallery():
    return render_template("gallery.html")

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

@app.route("/admin")
def admin():
    return render_template("admin.html")

if __name__ == "__main__":
    app.run(debug=True)