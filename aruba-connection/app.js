// Import dependencies
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const bodyParser = require("body-parser");
const { Telemetry, IotSbMessage } =
  require("./aruba_iot_proto_MODIFIED.js").aruba_telemetry;
require("log-timestamp");

// Constants
const aruba_ws_clients = new Map();
const port = 3001;
const MAX_CONNECTIONS = 100;
let msg_counter = 0;
let socket_response = {};

// Create Express app
const app = express();
const httpServer = http.createServer(app);
httpServer.maxConnections = MAX_CONNECTIONS;

// WebSocket Server
const ws = new WebSocket.Server({ server: httpServer, clientTracking: true });

// Express Middleware
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Start HTTP server
httpServer.listen(port, () => {
  console.log(`Server started on port ${httpServer.address().port}`);
});

// REST Endpoints

// Handle POST /sb_api
app.post("/sb_api", (req, res) => {
  try {
    const { receiver } = req.body;
    const recv_apMac = Buffer.from(receiver.apMac, "base64").toString("hex");

    if (!aruba_ws_clients.has(recv_apMac)) {
      throw new Error(`FAIL: AP MAC ${recv_apMac} not found`);
    }

    const conn_id = aruba_ws_clients.get(recv_apMac).aruba_ws_conn_id;

    if (!conn_id) {
      throw new Error(`FAIL: Connection ID not found for AP MAC ${recv_apMac}`);
    }

    const reply = IotSbMessage.fromObject(req.body);
    const payload = IotSbMessage.encode(reply).finish();

    ws.clients.forEach((client) => {
      if (client.aruba_conn_id === conn_id) {
        client.send(payload);
      }
    });

    res.json({ status: "SUCCESS: AP MAC found" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: error.message });
  }
});

// Handle POST /ap_info
app.post("/ap_info", (req, res) => {
  res.json(Object.fromEntries(aruba_ws_clients));
});

// Handle POST /ap_topo
app.post("/ap_topo", (req, res) => {
  const topo = [];
  ws.clients.forEach((client) => {
    const ap_arr = [...aruba_ws_clients.keys()].filter(
      (apMac) =>
        aruba_ws_clients.get(apMac).aruba_ws_conn_id === client.aruba_conn_id
    );

    topo.push({
      aruba_ws_connection_id: client.aruba_conn_id,
      aruba_ws_peer_address: client._socket._peername.address,
      aruba_aps: ap_arr,
    });
  });
  res.json(topo);
});

// SSE Endpoint
app.get("/sse", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Function to send SSE messages
  function sendSSE(data) {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  // Example of sending SSE messages periodically
  const intervalId = setInterval(() => {
    sendSSE(socket_response);
  }, 1000);

  req.on("close", () => {
    clearInterval(intervalId);
    console.log("SSE connection closed");
  });
});

// WebSocket Connection Handler
ws.on("connection", (wsc, req) => {
  console.log(
    "WebSocket connection Established!! From: " + req.socket.remoteAddress
  );
  wsc.aruba_conn_id = req.headers["sec-websocket-key"];

  wsc.on("error", console.error);

  wsc.on("close", () => {
    console.log(
      "WebSocket connection Closed!! From: " + req.socket.remoteAddress
    );
    console.log("WebSocket id: " + wsc.aruba_conn_id);
    clear_aruba_ws_clients(wsc.aruba_conn_id);
  });

  wsc.on("message", (msg) => {
    try {
      msg_counter++;
      if (typeof msg === "string") {
        update_aruba_ws_clients(msg, wsc.aruba_conn_id, false);
      } else {
        handle_aruba_telemetry_proto_meg(msg, wsc.aruba_conn_id);
      }
    } catch (error) {
      console.error("Error: " + error);
    }
  });
});

// Helper Functions

function clear_aruba_ws_clients(aruba_conn_id) {
  for (const [apMac, client] of aruba_ws_clients.entries()) {
    if (client.aruba_ws_conn_id === aruba_conn_id) {
      aruba_ws_clients.delete(apMac);
    }
  }
}

function update_aruba_ws_clients(msg, aruba_conn_id, msgIsJSON) {
  try {
    const json_obj = msgIsJSON ? msg : JSON.parse(msg);

    if (json_obj.reporter) {
      if (!aruba_ws_clients.has(json_obj.reporter.mac)) {
        aruba_ws_clients.set(json_obj.reporter.mac, {
          reporter: json_obj.reporter,
          aruba_ws_conn_id: aruba_conn_id,
        });
      }
    }
  } catch (error) {
    console.error(error);
    console.log(`Invalid Msg: ${msg}`);
    return false;
  }
}

function handle_aruba_telemetry_proto_meg(msg, aruba_conn_id) {
  try {
    const reqBody = Telemetry.decode(msg).toJSON();
    update_aruba_ws_clients(reqBody, aruba_conn_id, true);
    msg_counter++;
    socket_response = reqBody;
    console.log(JSON.stringify(reqBody, null, 2));
    console.log(`MSG COUNT: ${msg_counter}\n`);
  } catch (error) {
    console.error(error);
  }
}
