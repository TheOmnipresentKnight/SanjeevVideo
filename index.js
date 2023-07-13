const fs = require("fs");
const express = require("express");

const app = express();
const port = 8000;
const videoPath = "sampleVideo.mp4";

// Serve the index.html file for the root path
app.get("/", (req, res) => {
  const filePath = __dirname + "/index.html";
  res.sendFile(filePath);
});

// Handle the video streaming request
app.get("/video", (req, res) => {
  const range = req.headers.range;

  if (!range) {
    // If the 'Range' header is missing, send a 400 response
    res.status(400).send("Range header is required");
    return;
  }

  const videoSize = fs.statSync(videoPath).size;

  // Parse the range header to determine the start and end positions
  // Example: "bytes=324242-"
  const CHUNK_SIZE = 10 ** 6;
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  const contentLength = end - start + 1;

  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // Send a partial content response (HTTP 206) with appropriate headers
  res.writeHead(206, headers);

  // Create a readable stream for the video file and pipe it to the response
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
