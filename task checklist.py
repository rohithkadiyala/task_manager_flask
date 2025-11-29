pip install streamlit

import streamlit as st
import datetime

st.set_page_config(page_title="Daily Task Organizer", layout="wide")
st.title("Daily Task Organizer")

# Step 1: Enter your checklist for the day
st.header("Add Your Tasks")
n = st.number_input("How many tasks are on your checklist today?", min_value=1, max_value=50, value=5)

checklist = []
for i in range(int(n)):
    task = st.text_input(f"Enter task {i+1}:")
    if task:
        checklist.append(task)

# Step 2: Review tasks at end of day
st.header("End of Day Review")
completed_tasks = []
incomplete_tasks = []

if checklist:
    for task in checklist:
        done = st.checkbox(f"Did you complete '{task}'?")
        if done:
            completed_tasks.append(task)
        else:
            incomplete_tasks.append(task)

# Step 3: Display results
if st.button("Show Summary"):
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("✓ Completed Tasks")
        for task in completed_tasks:
            st.write(f"- {task}")
    
    with col2:
        st.subheader("✗ Incomplete Tasks")
        for task in incomplete_tasks:
            st.write(f"- {task}")
    
    # Calculate statistics
    if len(checklist) > 0:
        completion_percentage = (len(completed_tasks) / len(checklist)) * 100
        st.metric("Completion Rate", f"{completion_percentage:.1f}%")