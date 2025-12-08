# app.py
# Simple Flask backend for Task Manager
# - Stores tasks in data/tasks.json
# - Provides REST endpoints for tasks
# - Beginner-friendly, with comments

from flask import Flask, jsonify, request, send_from_directory, render_template, abort
import os
import json
import threading
from datetime import datetime

app = Flask(__name__, static_folder='static', template_folder='templates')

# Path to the JSON data file
DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'tasks.json')

# A lock to ensure only one thread writes to the JSON file at a time
file_lock = threading.Lock()

def read_tasks():
    """Read tasks from the JSON file and return as a Python list."""
    # Ensure file exists
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump([], f)
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        try:
            tasks = json.load(f)
            if not isinstance(tasks, list):
                # If the file got corrupted or has wrong structure, reset to empty list
                return []
            return tasks
        except json.JSONDecodeError:
            return []

def write_tasks(tasks):
    """Write the list of tasks to the JSON file safely."""
    with file_lock:
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(tasks, f, indent=2, ensure_ascii=False)

def generate_new_id(tasks):
    """Generate a new integer ID based on existing tasks."""
    if not tasks:
        return 1
    max_id = max(task.get('id', 0) for task in tasks)
    return max_id + 1

@app.route('/')
def index():
    """Serve the single-page frontend."""
    return render_template('index.html')

# ----------------- API Endpoints -----------------

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Return the list of tasks."""
    tasks = read_tasks()
    return jsonify(tasks), 200

@app.route('/api/tasks', methods=['POST'])
def add_task():
    """Create a new task.
    Expected JSON body:
    {
      "title": "Task title",
      "description": "Optional description",
      "priority": "Low"|"Medium"|"High",
      "deadline": "YYYY-MM-DDTHH:MM" (optional),
      "status": "incomplete"|"in_progress"|"completed" (optional)
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    title = data.get('title', '').strip()
    if not title:
        return jsonify({"error": "Title is required"}), 400

    description = data.get('description', '').strip()
    priority = data.get('priority', 'Low')
    if priority not in ['Low', 'Medium', 'High']:
        priority = 'Low'

    deadline = data.get('deadline')  # optional
    status = data.get('status', 'incomplete')
    if status not in ['incomplete', 'in_progress', 'completed']:
        status = 'incomplete'

    tasks = read_tasks()
    new_id = generate_new_id(tasks)

    new_task = {
        'id': new_id,
        'title': title,
        'description': description,
        'priority': priority,
        'deadline': deadline,
        'status': status,
        'created_at': datetime.utcnow().isoformat() + 'Z'
    }

    tasks.append(new_task)
    write_tasks(tasks)
    return jsonify(new_task), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Replace the whole task with new data (title required)."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    title = data.get('title', '').strip()
    if not title:
        return jsonify({"error": "Title is required"}), 400

    description = data.get('description', '').strip()
    priority = data.get('priority', 'Low')
    if priority not in ['Low', 'Medium', 'High']:
        priority = 'Low'

    deadline = data.get('deadline')  # optional
    status = data.get('status', 'incomplete')
    if status not in ['incomplete', 'in_progress', 'completed']:
        status = 'incomplete'

    tasks = read_tasks()
    found = False
    for i, t in enumerate(tasks):
        if t.get('id') == task_id:
            tasks[i] = {
                'id': task_id,
                'title': title,
                'description': description,
                'priority': priority,
                'deadline': deadline,
                'status': status,
                'created_at': t.get('created_at')  # keep original created time
            }
            found = True
            break

    if not found:
        return jsonify({"error": "Task not found"}), 404

    write_tasks(tasks)
    return jsonify(tasks[i]), 200

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task by ID."""
    tasks = read_tasks()
    new_tasks = [t for t in tasks if t.get('id') != task_id]
    if len(new_tasks) == len(tasks):
        return jsonify({"error": "Task not found"}), 404
    write_tasks(new_tasks)
    return jsonify({"message": "Deleted"}), 200

@app.route('/api/tasks/<int:task_id>/status', methods=['PATCH'])
def patch_task_status(task_id):
    """Change only the status of a task. Request body: {"status": "..."}"""
    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({"error": "Missing status in request body"}), 400

    status = data['status']
    if status not in ['incomplete', 'in_progress', 'completed']:
        return jsonify({"error": "Invalid status value"}), 400

    tasks = read_tasks()
    found = False
    for t in tasks:
        if t.get('id') == task_id:
            t['status'] = status
            found = True
            updated_task = t
            break

    if not found:
        return jsonify({"error": "Task not found"}), 404

    write_tasks(tasks)
    return jsonify(updated_task), 200

# ----------------- Static file helpers (optional) -----------------
# Flask serves static files from "static" folder automatically. Template folder is "templates".

if __name__ == '__main__':
    # Run development server
    app.run(debug=True, host='0.0.0.0', port=5000)
