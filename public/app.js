// Global Timers and Variables
let startTime = Date.now();
let focusTime = 0;
let lastActive = Date.now();
let currentUserId = null; // New variable to store the unique ID

// 1. Sign in Anonymously
// NOTE: 'auth' object must be defined in firebase.js (e.g., const auth = firebase.auth();)
auth.signInAnonymously()
    .then((userCredential) => {
        currentUserId = userCredential.user.uid; // Store the unique ID
        console.log("Signed in anonymously with UID:", currentUserId);
        
        // **CRITICAL:** Start the dashboard listener ONLY after we have the UID
        setupDashboardListener(currentUserId);
    })
    .catch((error) => {
        console.error("Authentication Failed:", error);
        // Handle error (e.g., alert the user that tracking won't work)
    });

// --- Session Tracking and Saving Logic ---

window.addEventListener("beforeunload", () => {
  if (!document.hidden) {
    // If the tab is focused when closing, update focusTime
    focusTime += Date.now() - lastActive;
  }

  const total = Date.now() - startTime;
  const focusRatio = ((focusTime / total) * 100).toFixed(2);

  console.log(`Focus Ratio: ${focusRatio}%`);

  // Check if we have a user ID before writing
  if (!currentUserId) {
      console.error("Cannot save data: User not authenticated yet.");
      return; 
  }

  // 1. Updated Data Path: Save data under 'users/[uid]/sessions'
  db.ref("users")
    .child(currentUserId)  // Go into the user's private folder
    .child("sessions")     // Store sessions in a subcollection
    .push({
      focusRatio: parseFloat(focusRatio), // Store as a number
      totalTime: total, // milliseconds
      timestamp: new Date().toISOString()
    }).then(() => {
        console.log("Session data saved to Firebase under user ID:", currentUserId);
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

// 2. Firebase Listener Function (Runs ONLY after authentication)
function setupDashboardListener(userId) {
  // Attach a listener to the user's PRIVATE 'sessions' node
  db.ref(`users/${userId}/sessions`).on('value', (snapshot) => { // <-- CHANGED PATH
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
}