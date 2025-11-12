// server.js
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Webhook endpoint
app.post("/webhook/paystack", (req, res) => {
    console.log("💡 Webhook received:", req.body);

    // Important: Always respond quickly to Paystack
    res.sendStatus(200);
});

app.listen(3000, () => console.log("🚀 Webhook server running on port 3000"));

// var http = require("http");

// http.createServer(function (request, response) {
//     // Send the HTTP header
//     // HTTP Status: 200 : OK
//     // Content Type: text/plain
//     response.writeHead(200, {'Content-Type': 'text/plain'});

//     // Send the response body as "Hello World"
//     response.end('Hello World\n');
// }).listen(3000);

// // Console will print the message
// console.log('Server running at http://127.0.0.1:3000/');
