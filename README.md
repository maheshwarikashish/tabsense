  ## 🧠 TabSense — Smart Multitasking Tracker

## 🎯 Objective
**TabSense** is a lightweight web application designed to estimate user engagement by tracking browser tab focus and idle activity.  
It calculates a **Focus Ratio (%)** based on how much time a user spends actively on a tab versus being away or idle.  
The data is synced to **Firebase Realtime Database** and visualized through a live dashboard.

---

## ⚙️ Tech Stack
- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Firebase Realtime Database  
- **Visualization:** Chart.js  
- **Prototyping:** [Firebase Studio](https://firebase.studio)

---
## ✨ Features

* **📈 Focus Ratio Tracking**: Measures the percentage of time the web application tab is actively focused (not hidden/minimized).
* **👤 Anonymous Authentication**: Uses Firebase Anonymous Auth to assign a unique ID to each user.
* **📊 Historical Dashboard**: Visualizes the user's focus trends using a Chart.js line graph.# 🧠 TabSense Tracker — Smart Multitasking Monitor

 
---
## INTERNS and  Branch responsibilites 
 
activity-logger,Intern A,Implement tab focus/blur tracking and idle timer logic.

firebase-handler,Intern B,Configure Firebase and implement logic to push tab activity events to the database.

UI-dashboard,Intern C,Build the Chart.js dashboard for visualizing the focus ratio and session trend.
---
## 🚀 Getting Started

Follow these steps to set up and run **TabSense** on your local machine.

### Prerequisites

To run this project, you will need a basic development environment and an active **Firebase Project**.

* **Node.js** (for running and serving the files).
* A **Firebase Project** with the following services enabled:
    * **Realtime Database** (Used to store user session data).
    * **Anonymous Authentication** (Used to assign a unique ID to each user).

### Installation & Configuration

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/maheshwarikashish/tabsense.git](https://github.com/maheshwarikashish/tabsense.git)
    cd tabsense
    ```

2.  **Configure Firebase Credentials:**
    * Locate the `firebase.js` file.
    * **Crucially, replace the placeholder values** in the `firebaseConfig` object with your actual credentials from your own Firebase project (e.g., `apiKey`, `projectId`, `databaseURL`, etc.).

### Running the Application

Since this is a client-side web application, you only need a local web server to host the files.

1.  **Serve the files:**
    * **Option A: Using `live-server` (Recommended)**
        ```bash
        # Install globally if you don't have it
        npm install -g live-server
        
        # Run the server from the project root
        live-server
        ```
    * **Option B: Using Python's Simple HTTP Server**
        ```bash
        python -m http.server 8000
        ```

2.  The application will automatically open in your browser (e.g., `http://localhost:8080`). The tracking begins automatically upon successful anonymous sign-in.

---

## 🤝 Contributing

We welcome contributions! If you have suggestions or want to improve the tracker, please feel free to:

1.  **Fork** the repository.
2.  Create a new feature branch (`git checkout -b feature/NewDashboardMetric`).
3.  Commit your Changes (`git commit -m 'feat: Add new metric to dashboard'`).
4.  Submit a **Pull Request**.

---

## 📄 License

 This project is not licensed under an open-source license. **All Rights Reserved.**

This means that while the source code is visible, you may not copy, distribute, or modify the code without direct permission from the author.

Project Link: [https://github.com/maheshwarikashish/tabsense.git](https://github.com/maheshwarikashish/tabsense.git)
