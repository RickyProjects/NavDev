const input = document.getElementById("input-file");
const emptySimText = document.getElementById("emptySimText");
const simulationText = document.getElementById("simulationText");

const solutionsPendingImg = document.getElementById("solutionsPending");
const noSolutionsImg = document.getElementById("noSolutionsAnimation");

function setSolutionState(state) {
  // state: "pending" | "running" | "noSolutions" | "hasConflicts"
  if (solutionsPendingImg) {
    solutionsPendingImg.style.display =(state === "pending") ? "block": "none";
  }
  if (noSolutionsImg) {
    noSolutionsImg.style.display = (state === "noSolutions") ? "block": "none";
  }

  // If you want text hidden in pending state, you can do:
  if (simulationText) {
    simulationText.style.display = (state === "pending") ? "none": "block";
  }
}

setSolutionState("pending"); // default solutions image

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
  setSolutionState("running");

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
      simulationText.innerHTML = `
        <p><strong>Total flights:</strong> ${result.totalFlights}</p>
        <p><strong>Total conflicts:</strong> 0</p>
      `;
    } else {
      setSolutionState("hasConflicts");
      simulationText.innerHTML = `
        <h2>Summary</h2>
        <p><strong>Total flights:</strong> ${result.totalFlights}</p>
        <p><strong>Total conflicts:</strong> ${result.conflicts.length}</p>
      `;
    }

  } catch (err) {
    emptySimText.textContent = `Error: ${err.message}`;
    console.error(err);
  }
});
