// dashboard/dashboard.js
import { db } from "../firebase.js";
import { ref, onValue, onChildAdded } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

/*
  Data format expected in Firebase:
    push(ref(db, "events"), { type: "focus"|"idle"|"blur"|"active", timestamp: Date.now() });
  The tracker should create timestamped events. This dashboard computes durations
  between adjacent events and attributes each time-slice to the earlier event's type.
*/

// DOM
const lastUpdatedEl = document.getElementById("lastUpdated");
const focusCanvas = document.getElementById("focusRatioChart");
const trendCanvas = document.getElementById("sessionTrendChart");
const focusCtx = focusCanvas.getContext("2d");
const trendCtx = trendCanvas.getContext("2d");

// --- Focus Ratio doughnut ---
const focusChart = new Chart(focusCtx, {
  type: "doughnut",
  data: {
    labels: ["Focused", "Idle/Away"],
    datasets: [{
      data: [0, 100],
      backgroundColor: ["#16a34a", "#ef4444"],
      hoverOffset: 8,
    }]
  },
  options: {
    cutout: "62%",
    plugins: {
      legend: { position: "bottom" },
      tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed}%` } }
    }
  }
});

// --- Session Trend line (last 20 ratios) ---
const gradient = trendCtx.createLinearGradient(0, 0, 0, 300);
gradient.addColorStop(0, "rgba(59,130,246,0.9)");
gradient.addColorStop(1, "rgba(165,180,252,0.15)");

const trendChart = new Chart(trendCtx, {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "Focus Ratio (%)",
      data: [],
      borderColor: "rgba(59,130,246,1)",
      backgroundColor: gradient,
      fill: true,
      tension: 0.35,
      pointRadius: 3,
      pointHoverRadius: 5
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true, max: 100, ticks: { stepSize: 10 } },
      x: { ticks: { maxRotation: 0, minRotation: 0 } }
    },
    plugins: { legend: { display: false } }
  }
});

// --- Utility: compute durations & focus ratio from events array ---
function computeFocusRatioFromEvents(events) {
  if (!events || events.length === 0) return { ratio: 0, points: [] };

  // Normalize & sort
  const normalized = events
    .map(e => ({ type: String(e.type || "idle"), timestamp: Number(e.timestamp || 0) }))
    .sort((a, b) => a.timestamp - b.timestamp);

  // accumulate durations attributed to the earlier event
  let focusMs = 0;
  let idleMs = 0;
  for (let i = 0; i < normalized.length; i++) {
    const cur = normalized[i];
    const next = normalized[i + 1];
    const endTs = next ? next.timestamp : Date.now();
    const dt = Math.max(0, endTs - cur.timestamp);
    const ttype = (cur.type.toLowerCase().includes("focus") || cur.type.toLowerCase().includes("active")) ? "focus" : "idle";
    if (ttype === "focus") focusMs += dt; else idleMs += dt;
  }

  const total = focusMs + idleMs || 1;
  const ratio = (focusMs / total) * 100;

  // Produce time-labelled points for trend: take a sliding window of last N events and compute ratios per event boundary
  const points = [];
  const N = Math.min(normalized.length, 50);
  for (let i = Math.max(0, normalized.length - N); i < normalized.length; i++) {
    // compute ratio up to this event (from start to this event)
    const slice = normalized.slice(0, i + 1);
    let sFocus = 0, sIdle = 0;
    for (let j = 0; j < slice.length; j++) {
      const cur = slice[j];
      const next = slice[j + 1];
      const endTs = next ? next.timestamp : Date.now();
      const dt = Math.max(0, endTs - cur.timestamp);
      const ttype = (cur.type.toLowerCase().includes("focus") || cur.type.toLowerCase().includes("active")) ? "focus" : "idle";
      if (ttype === "focus") sFocus += dt; else sIdle += dt;
    }
    const ttotal = sFocus + sIdle || 1;
    points.push({
      ts: slice[slice.length - 1].timestamp,
      ratio: +( (sFocus / ttotal) * 100 ).toFixed(1)
    });
  }

  return { ratio: +ratio.toFixed(1), points };
}

// --- Update charts with new computed values ---
function updateUI(ratio, points) {
  // doughnut
  focusChart.data.datasets[0].data = [ratio, Math.max(0, 100 - ratio)];
  focusChart.update();

  // trend: show last 20 points (timestamp label -> HH:MM:SS)
  const lastPoints = points.slice(-20);
  trendChart.data.labels = lastPoints.map(p => new Date(p.ts).toLocaleTimeString());
  trendChart.data.datasets[0].data = lastPoints.map(p => p.ratio);
  trendChart.update();

  // last updated label
  lastUpdatedEl.textContent = `Last updated: ${new Date().toLocaleString()}`;
}

// --- Firebase listeners ---
// Initial load + any changes: use onValue to recompute full state
const eventsRef = ref(db, "events");
onValue(eventsRef, (snap) => {
  const data = snap.val();
  const events = data ? Object.values(data) : [];
  const { ratio, points } = computeFocusRatioFromEvents(events);
  updateUI(ratio, points);
});

// For responsiveness to new pushes (optional, helps keep trend smooth)
// onChildAdded listens for new pushed events and we can append locally if needed
onChildAdded(eventsRef, (snap) => {
  // we already handle updates via onValue; this hook can be used to add micro-animations or notification
  // keep minimal to avoid duplicate computation
});
