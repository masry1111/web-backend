const express = require("express");
const path = require("path");

const app = express();

// Serve the frontend folder
app.use(express.static(path.join(__dirname, "frontend")));

app.listen(5500, () => {
    console.log("Frontend running at: http://localhost:5500");
});
