const express = require("express");
const multer = require("multer");
const { runSimulation } = require("./testRunner");


const app = express();
const upload = multer({ storage: multer.memoryStorage() });


app.post("/run", upload.single("file"), async (req, res) => {
 try {
   const json = JSON.parse(req.file.buffer.toString("utf8"));
   const result = await runSimulation(json);
   res.json(result);
 } catch (err) {
   res.status(400).json({ error: err.message });
 }
});


app.listen(3000);
