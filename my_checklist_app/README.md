# Daily Checklist Web Application

## Overview
This is a simple web-based daily checklist application built with Flask. It allows users to:
- Add new tasks to their daily checklist.
- Mark tasks as completed or incomplete.
- View the current day's tasks, categorized by pending, completed, and incomplete.
- Save the current day's checklist to a historical record, clearing the daily tasks for a new day.
- View historical checklists for previous dates.

## Setup
To set up the project, follow these steps:
1. Clone the repository (if applicable) or ensure you have all project files in a directory.
2. Ensure you have Python installed (version 3.7+ is recommended).
3. Navigate to the project directory in your terminal.
4. Install the required Python packages using pip:
   ```bash
   pip install -r requirements.txt
   ```

## How to Run
After setting up the project, you can run the Flask application:
1. Open your terminal or command prompt.
2. Navigate to the project directory.
3. Run the application:
   ```bash
   python your_app_file_name.py
   ```
   (Note: In a Colab environment, the Flask app is typically started via a specific cell execution.)
4. Once the server starts, it will provide a URL (e.g., `http://127.0.0.1:5000/` or a public Colab URL). Open this URL in your web browser.

## Usage
### Current Day's Checklist (Home Page `/`)
- **Add New Task**: Enter a task in the input field and click 'Add Task'. The task will appear under 'Today's Tasks'.
- **Mark Tasks**: Next to each task under 'Today's Tasks', click 'Complete' or 'Incomplete' to move it to the respective 'Current Status' section.
- **View Current Status**: See tasks categorized as 'Completed Tasks' or 'Incomplete Tasks' for the current day.
- **Save Day & Clear**: Click this button to archive all current day's tasks into historical records and clear the daily lists, preparing for a new day. This button is crucial for saving your daily progress.

### Historical Checklists (`/history`)
- Click 'View Historical Checklists' from the home page to navigate to the history view.
- **Select Date**: Use the date picker to choose a date for which you want to view the checklist. Click 'View'.
- The page will display the completed and incomplete tasks for the selected historical date.
- Click 'Back to Current Daily Checklist' to return to the main page.