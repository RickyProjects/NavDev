const input = document.getElementById("input-file");
const emptySimText = document.getElementById("emptySimText");
const simulationText = document.getElementById("simulationText");

const solutionsPendingImg = document.getElementById("solutionsPending");
const noSolutionsImg = document.getElementById("noSolutionsAnimation");
const loadingSolutionsImg = document.getElementById("LoadingSolutionsAnimation");

// there are three different solution image transitions: pending (which is the default), noSolutions, and loading (animated)
function setSolutionState(state) {
  if (solutionsPendingImg) {
    solutionsPendingImg.style.display =(state === "pending") ? "block": "none";
  }
  if (noSolutionsImg) {
    noSolutionsImg.style.display = (state === "noSolutions") ? "block": "none";
  }
  if (loadingSolutionsImg) {
    loadingSolutionsImg.style.display = (state === "loading") ? "block": "none";
  }

  // in solutions container, hiding text while pending
  if (simulationText) {
    simulationText.style.display = (state === "pending") ? "none": "block";
  }
}
setSolutionState("pending"); // default solutions image


// ========== HELPER FUNCITONS ===============
function makeLogger() {
  let buffer = "";
  return {
    log(line) {
      buffer += line + "\n";
      emptySimText.textContent = buffer;
      emptySimText.scrollTop = emptySimText.scrollHeight;
    },
    getText() {
      return buffer;
    }
  };
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderSolutions(result) {
  if (!result || !result.solutions || result.solutions.length === 0) {
    return `<p style="opacity:0.9;">No structured solutions to display.</p>`;
  }
  const groups = new Map();
  for (const sol of result.solutions) {
    const key = sol.fix?.flightToChange || "Other";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(sol);
  }

  let html = `<h2 style="margin-top: 16px;">Hmmmm...What Could We Fix?</h2>`;

  for (const [flightId, sols] of groups.entries()) {
    html += `
      <div style="margin: 12px 0; padding: 12px; border-radius: 10px; background: rgba(255,255,255,0.12);">
        <h3 style="margin: 0 0 8px 0;">${flightId === "Other" ? "Other fixes" : `Conflict for  ${escapeHtml(flightId)}`}</h3>
        <div style="display: grid; gap: 10px;">
    `;

    for (const s of sols) {
      const a = s.flightA;
      const b = s.flightB;

      const routeA = a ? `${a.fromIcao} (${a.fromCity}) → ${a.toIcao} (${a.toCity})` : "? → ?";
      const routeB = b ? `${b.fromIcao} (${b.fromCity}) → ${b.toIcao} (${b.toCity})` : "? → ?";

      let fixLine = "";
      if (s.fix?.type === "altitude") {
        fixLine = `
          <div style="margin-top: 6px;">
            ALTITUDE SOLUTION: <strong>Altitude change</strong> for <strong>${escapeHtml(s.fix.flightToChange)}</strong>:
            ${escapeHtml(s.fix.fromAlt)} → ${escapeHtml(s.fix.toAlt)} ft
            <div style="opacity: 0.9; font-size: 13px; margin-top: 2px;">
              Aircraft: ${escapeHtml(s.fix.aircraftType)} (optimal ${escapeHtml(s.fix.optimalMin)}-${escapeHtml(s.fix.optimalMax)})
            </div>
          </div>
        `;
      } else if (s.fix?.type === "delay") {
        fixLine = `
          <div style="margin-top: 6px;">
           DELAY SOLUTION <strong>Delay</strong> one flight by <strong>${escapeHtml(s.fix.delaySeconds)}</strong>s
          </div>
        `;
      }

      html += `
        <div style="padding: 10px; border-radius: 10px; background: rgba(0,0,0,0.15);">
          <div style="font-weight: 600;">
            ${escapeHtml(s.planeA)} (${escapeHtml(routeA)}) and ${escapeHtml(s.planeB)} (${escapeHtml(routeB)})
          </div>
          <div style="opacity: 0.9; font-size: 14px; margin-top: 2px;">
            Conflict: ${formatTime(s.startTime)} → ${formatTime(s.endTime)} (duration ${escapeHtml(s.duration)}s)
          </div>
          ${fixLine}
        </div>
      `;
    }

    html += `</div></div>`;
  }

  return html;
}

input.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) {
    return;
  }
  // shift elements upward after upload
  document.getElementById("conflictContainer").classList.add("jsonUploaded");

  // clear UI
  emptySimText.textContent = "";
  simulationText.innerHTML = "";

  // update right-side state while running
  setSolutionState("loading");

  const logger = makeLogger();

  try {
    logger.log(`Reading ${file.name}...`);
    const text = await file.text();
    const flightReadIn = JSON.parse(text);

    logger.log("Starting simulation in browser...");

    const result = await window.runInBrowser(flightReadIn, logger.log);
    logger.log("\n"+ "Okay, Simulation Complete!");

  //solutions messages (images and animations)
    if (result.conflicts.length === 0) {
      setSolutionState("noSolutions");
    } else {
      setSolutionState("loading");
      simulationText.innerHTML = `
        <h2>Data Overview</h2>
        <p>We went through ${result.totalFlights} flights</p>
        <p>We found ${result.conflicts.length} conflicts</p>
      `;

      if (loadingSolutionsImg) loadingSolutionsImg.style.display = "none";
      simulationText.innerHTML += `<hr style="opacity:0.3; margin: 12px 0;">` + renderSolutions(result);
    }

  } catch (err) {
    emptySimText.textContent = `Error: ${err.message}`;
    console.error(err);
  }
});
