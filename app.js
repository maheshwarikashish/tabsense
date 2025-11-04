// Global Timers and Variables
let startTime = Date.now();
let focusTime = 0;
let lastActive = Date.now();

// Intern A: Tab Focus Detection (Detect when user leaves the tab)
document.addEventListener("visibilitychange", () => {
  const statusElement = document.getElementById("status");

  if (document.hidden) {
    // User switched away (Tab Blur)
    focusTime += Date.now() - lastActive; // Add the time spent focused before switching
    statusElement.textContent = "Status: Away (Tracking paused)";
  } else {
    // User switched back (Tab Focus)
    lastActive = Date.now(); // Reset the last active time
    statusElement.textContent = "Status: Focused";
  }
});

// We'll add Idle Tracking logic (mouse/keyboard events) later if needed,
// but the visibilitychange is the core requirement.

// Ensure the focusTime is updated one last time before calculating the ratio
window.addEventListener("beforeunload", () => {
  if (!document.hidden) {
    // If the tab is focused when closing, update focusTime
    focusTime += Date.now() - lastActive;
  }

  const total = Date.now() - startTime;
  const focusRatio = ((focusTime / total) * 100).toFixed(2);

  console.log(`Focus Ratio: ${focusRatio}%`);

  // Intern B: Push to Firebase (using the global 'db' variable from firebase.js)
  db.ref("sessions").push({
    focusRatio: parseFloat(focusRatio), // Store as a number
    totalTime: total, // milliseconds
    timestamp: new Date().toISOString()
  }).then(() => {
      console.log("Session data saved to Firebase.");
  }).catch((error) => {
      console.error("Firebase write failed:", error);
  });
});



// --- Intern C: Dashboard Visualization Logic ---

// 1. Initialize Chart.js
const ctx = document.getElementById('focusRatioChart').getContext('2d');
let focusChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [], // Time labels will go here
        datasets: [{
            label: 'Focus Ratio (%)',
            data: [], // Focus ratios will go here
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                title: {
                    display: true,
                    text: 'Focus Ratio (%)'
                }
            }
        }
    }
});

// 2. Firebase Listener for Live Data
// Attach a listener to the 'sessions' node in your database.
// 'on' ensures the chart updates whenever a new session is pushed.
db.ref('sessions').on('value', (snapshot) => {
    const sessionsData = snapshot.val();

    // Clear old data
    focusChart.data.labels = [];
    focusChart.data.datasets[0].data = [];

    let latestRatio = 'N/A';
    let latestTotalTime = '0 seconds';

    if (sessionsData) {
        // Convert object of sessions into an array for easy sorting
        const sessionsArray = Object.keys(sessionsData).map(key => ({
            id: key,
            ...sessionsData[key]
        }));

        // Sort sessions by timestamp (oldest first for the trend chart)
        sessionsArray.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Process data for the chart and metrics
        sessionsArray.forEach((session, index) => {
            // For the Chart: Use session number or formatted time for the label
            focusChart.data.labels.push(`Session ${index + 1}`);
            focusChart.data.datasets[0].data.push(session.focusRatio);

            // Update latest metrics for display
            latestRatio = session.focusRatio + '%';
            // Convert totalTime (ms) to seconds for a friendly display
            latestTotalTime = (session.totalTime / 1000).toFixed(1) + ' seconds';
        });
    }

    // Update the metrics display in the HTML
    document.getElementById("focus-ratio").textContent = latestRatio;
    document.getElementById("total-time").textContent = latestTotalTime;

    // Update the chart
    focusChart.update();
});