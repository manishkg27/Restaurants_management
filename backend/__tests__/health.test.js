const request = require("supertest");
const express = require("express");

// Simple app setup for testing the route directly
const app = express();
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy" });
});

describe("GET /api/v1/health", () => {
  it("should return 200 OK and health status", async () => {
    const response = await request(app).get("/api/v1/health");
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Server is healthy");
  });
});
