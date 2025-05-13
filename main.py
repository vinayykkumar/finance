from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client

app = Flask(__name__)
CORS(app)

# Replace with your actual Supabase project credentials
SUPABASE_URL = "https://hzrercpzwhouwineyowt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6cmVyY3B6d2hvdXdpbmV5b3d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4NzI3NTEsImV4cCI6MjA2MjQ0ODc1MX0.yuq_r74blN2PSMxHfKii-jQ_-AOpF55rX0nmrLK7PQI"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.route("/", methods=["GET"])
def home():
    return "✅ Finance Tracker API is running."

@app.route("/add", methods=["POST"])
def add_transaction():
    data = request.json
    print("📦 Received data from frontend:", data)

    try:
        result = supabase.table("transactions").insert(data).execute()
        print("✅ Insert result:", result)
        return jsonify(result.data)
    except Exception as e:
        print("❌ Insert error:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/list", methods=["GET"])
def list_transactions():
    try:
        result = supabase.table("transactions").select("*").order("date", desc=True).limit(100).execute()
        return jsonify(result.data)
    except Exception as e:
        print("❌ Fetch error:", e)
        return jsonify({"error": str(e)}), 500

@app.errorhandler(404)
def page_not_found(e):
    return "🚫 This route does not exist.", 404

if __name__ == "__main__":
    app.run(debug=True)