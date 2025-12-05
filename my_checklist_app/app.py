import os
from flask import Flask, request, redirect, render_template
from datetime import date, timedelta

# Global lists to simulate the backend data storage
# In a real application, this would be a database or persistent storage.
daily_tasks = []
completed_tasks = []
incomplete_tasks = []
historical_checklists = {}

# Create an instance of the Flask application
app = Flask(__name__)

# Create directories if they don't exist (for local execution consistency)
app_dir = os.getcwd()
templates_dir = os.path.join(app_dir, 'templates')
static_dir = os.path.join(app_dir, 'static')

for directory in [templates_dir, static_dir]:
    if not os.path.exists(directory):
        os.makedirs(directory)

@app.route('/')
def index():
    return render_template('index.html', daily_tasks=daily_tasks, completed_tasks=completed_tasks, incomplete_tasks=incomplete_tasks)

@app.route('/add_task', methods=['POST'])
def add_task_route():
    task = request.form.get('task')
    if task:
        daily_tasks.append(task)
    return redirect('/')

@app.route('/mark_task', methods=['POST'])
def mark_task_route():
    task_to_mark = request.form.get('task')
    status = request.form.get('status')

    if task_to_mark in daily_tasks:
        daily_tasks.remove(task_to_mark)
        if status == 'completed':
            completed_tasks.append(task_to_mark)
        elif status == 'incomplete':
            incomplete_tasks.append(task_to_mark)
    return redirect('/')

@app.route('/save_day', methods=['POST'])
def save_day_route():
    current_date = date.today().strftime("%Y-%m-%d")

    if not completed_tasks and not incomplete_tasks and not daily_tasks:
        print(f"No tasks to save for {current_date}. Daily lists remain unchanged.")
        return redirect('/')

    daily_checklist_record = {
        'completed': completed_tasks[:],
        'incomplete': incomplete_tasks[:]
    }

    historical_checklists[current_date] = daily_checklist_record

    daily_tasks.clear()
    completed_tasks.clear()
    incomplete_tasks.clear()

    print(f"Checklist for {current_date} saved to history. Daily lists cleared.")
    return redirect('/')

@app.route('/history', methods=['GET'])
def history_route():
    selected_date = None
    historical_record = None

    if request.method == 'GET' and 'view_date' in request.args:
        selected_date = request.args.get('view_date')
        if selected_date in historical_checklists:
            historical_record = historical_checklists[selected_date]

    return render_template('history.html',
                           historical_checklists=historical_checklists,
                           selected_date=selected_date,
                           historical_record=historical_record)

# This part is for running the app directly if this file is executed
if __name__ == '__main__':
    # For demonstration purposes, pre-populate some historical data
    # to ensure the history view has something to show initially.
    today = date.today().strftime("%Y-%m-%d")
    yesterday = (date.today() - timedelta(days=1)).strftime("%Y-%m-%d")
    two_days_ago = (date.today() - timedelta(days=2)).strftime("%Y-%m-%d")

    if today not in historical_checklists:
        historical_checklists[today] = {
            'completed': ['Existing Completed Task A'],
            'incomplete': ['Existing Incomplete Task B']
        }

    if yesterday not in historical_checklists:
        historical_checklists[yesterday] = {
            'completed': ['Historical Task 1 (Completed)'],
            'incomplete': ['Historical Task 2 (Incomplete)']
        }
    if two_days_ago not in historical_checklists:
        historical_checklists[two_days_ago] = {
            'completed': ['Older Task Alpha'],
            'incomplete': []
        }

    app.run(debug=True, host='0.0.0.0', port=5000)