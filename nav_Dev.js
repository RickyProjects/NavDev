const input = document.getElementById("input-file");
const rawReport = document.getElementById("rawReport");
const solutionsText = document.getElementById("solutionsText");

function makeLogger() {
  let buffer = "";
  return {
    log(line) {
      buffer += line + "\n";
      rawReport.textContent = buffer;
      rawReport.scrollTop = rawReport.scrollHeight;
    },
    getText() {
      return buffer;
    }
  };
}

input.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  document.getElementById("conflictContainer").classList.add("jsonUploaded"); // FOR SHIFTING THE CONFLICT CONTAINER ELEMENTS UPWARD

  rawReport.textContent = "";
  solutionsText.innerHTML = "";

  const logger = makeLogger();

  try {
    logger.log(`Reading ${file.name}...`);
    const text = await file.text();
    const flightArray = JSON.parse(text);

    logger.log("Starting simulation in browser...");

    const result = await window.runInBrowser(flightArray, logger.log);

    logger.log("");
    logger.log("Done. Rendering summary...");

    // Display a simple summary on the right
    const lines = [];
    lines.push(`<h2>Summary</h2>`);
    lines.push(`<p><strong>Total flights:</strong> ${result.totalFlights}</p>`);
    lines.push(`<p><strong>Total conflicts:</strong> ${result.conflicts.length}</p>`);

    solutionsText.innerHTML = lines.join("");

  } catch (err) {
    rawReport.textContent = `Error: ${err.message}`;
    console.error(err);
  }
});
