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