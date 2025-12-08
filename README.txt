Task Manager (Flask + JSON) - README
===================================

What this project is:
- A single-page Task Manager web app.
- Backend: Flask (Python).
- Persistence: JSON file at data/tasks.json.
- Frontend: plain HTML/CSS/JS in templates/ and static/.
- Easy to run locally and deploy to Render.

Files:
- app.py               -> Flask backend (REST API + serves frontend)
- requirements.txt     -> Python packages
- Procfile             -> For Render/Gunicorn
- data/tasks.json      -> JSON storage (initially [])
- templates/index.html -> Frontend HTML page
- static/styles.css    -> Styles
- static/app.js        -> Frontend JavaScript
- README.txt           -> This file

Local run quick steps:
1. Ensure Python 3.8+ is installed.
2. Create project folder and put files exactly as listed.
3. Open terminal and create virtual environment:
   - Windows:
     python -m venv venv
     venv\Scripts\activate
   - Mac/Linux:
     python3 -m venv venv
     source venv/bin/activate
4. Install dependencies:
   pip install -r requirements.txt
5. Run Flask:
   flask run
6. Open browser at http://127.0.0.1:5000

Deploy to Render:
1. Push your code to a GitHub repo.
2. Create Render account and "New" -> "Web Service".
3. Connect GitHub and choose your repo.
4. Set Build Command: pip install -r requirements.txt
5. Set Start Command: gunicorn app:app
6. Deploy and visit the given URL.

Notes:
- Title is required for every task.
- The app uses a simple file lock to prevent write conflicts.
- If tasks.json is corrupted, the app will recover to an empty list.

If you find any bug or have questions, open the file 'app.py' and read the comments — it's written to be beginner-friendly.

Enjoy! 🚀
