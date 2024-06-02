from flask import Flask, jsonify
import mysql.connector
from flask_cors import CORS  # Import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains on all routes


@app.route('/api/food')
def get_food_items():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT id, name, price, image_url FROM FoodItems ORDER BY name')
    food_items = cursor.fetchall()
    cursor.close()  
    conn.close()
    return jsonify(food_items)

if __name__ == '__main__':
    app.run(debug=True)
