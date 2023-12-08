from flask import Flask, jsonify, render_template, Response
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/reunionevent')
def get_reunion_event():
    url = "http://127.0.0.1:5000/reunionevent"
    api_key = "OB8Pbh3aEK3sGUoFayUrzYnV0wMP13fO7kMQQzMV"
    payload = {}
    
    headers = {
        "X-API-Key": api_key
    }

    response = requests.get(url, headers=headers, data=payload)

    if response.status_code == 200:
        data = response.json()
        print("Data:", data)
        return jsonify(data)
    else:
        return jsonify({"error": f"Error: {response.status_code}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
