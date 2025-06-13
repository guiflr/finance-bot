import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { server as mcpServer } from './mcp-server'

const app = express();
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Store active connections
const connections = new Map();

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    version: "1.0.0",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    connections: connections.size,
  });
});

// SSE connection establishment endpoint
app.get("/sse", async (req, res) => {
  // Instantiate SSE transport object
  const transport = new SSEServerTransport("/messages", res);
  // Get sessionId
  const sessionId = transport.sessionId;
  console.log(
    `[${new Date().toISOString()}] New SSE connection established: ${sessionId}`
  );

  // Register connection
  connections.set(sessionId, transport);

  // Connection interruption handling
  req.on("close", () => {
    console.log(
      `[${new Date().toISOString()}] SSE connection closed: ${sessionId}`
    );
    connections.delete(sessionId);
  });

  // Connect the transport object to the MCP server
  await mcpServer.connect(transport);
  console.log(
    `[${new Date().toISOString()}] MCP server connection successful: ${sessionId}`
  );
});

// Endpoint for receiving client messages
app.post("/messages", async (req: Request, res: Response) => {
  try {
    console.log(
      `[${new Date().toISOString()}] Received client message:`,
      req.query
    );
    const sessionId = req.query.sessionId as string;

    // Find the corresponding SSE connection and process the message
    if (connections.size > 0) {
      const transport: SSEServerTransport = connections.get(
        sessionId
      ) as SSEServerTransport;
      // Use transport to process messages
      if (transport) {
        await transport.handlePostMessage(req, res);
      } else {
        throw new Error("No active SSE connection");
      }
    } else {
      throw new Error("No active SSE connection");
    }
  } catch (error: any) {
    console.error(
      `[${new Date().toISOString()}] Failed to process client message:`,
      error
    );
    res
      .status(500)
      .json({ error: "Failed to process message", message: error.message });
  }
});

// Graceful shutdown of all connections
async function closeAllConnections() {
  console.log(
    `[${new Date().toISOString()}] Closing all connections (${
      connections.size
    }个)`
  );
  for (const [id, transport] of connections.entries()) {
    try {
      // Send shutdown event
      transport.res.write(
        'event: server_shutdown\ndata: {"reason": "Server is shutting down"}\n\n'
      );
      transport.res.end();
      console.log(`[${new Date().toISOString()}] Connection closed: ${id}`);
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Failed to close connection: ${id}`,
        error
      );
    }
  }
  connections.clear();
}

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${new Date().toISOString()}] Unhandled exception:`, err);
  res.status(500).json({ error: "Server internal error" });
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log(
    `[${new Date().toISOString()}] Received SIGTERM signal, preparing to close`
  );
  await closeAllConnections();
  server.close(() => {
    console.log(`[${new Date().toISOString()}] Server closed`);
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log(
    `[${new Date().toISOString()}] Received SIGINT signal, preparing to close`
  );
  await closeAllConnections();
  process.exit(0);
});

// Start server
const port = process.env.PORT || 8083;
const server = app.listen(port, () => {
  console.log(
    `[${new Date().toISOString()}] Smart shopping MCP SSE server started, address: http://localhost:${port}`
  );
  console.log(`- SSE connection endpoint: http://localhost:${port}/sse`);
  console.log(
    `- Message processing endpoint: http://localhost:${port}/messages`
  );
  console.log(`- Health check endpoint: http://localhost:${port}/health`);
});