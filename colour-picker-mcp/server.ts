import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult, ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

// Works both from source (server.ts) and compiled (dist/server.js)
const DIST_DIR = import.meta.filename.endsWith(".ts")
  ? path.join(import.meta.dirname, "dist")
  : import.meta.dirname;

/**
 * Creates a new MCP server instance with tools and resources registered.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: "Colour Picker MCP Server",
    version: "1.0.0",
  });

  const resourceUri = "ui://pick-colour/mcp-app.html";

  // Register the colour picker tool
  registerAppTool(
    server,
    "pick-colour",
    {
      title: "Pick Colour",
      description: "Opens an interactive colour picker UI to select a colour. Returns the selected colour in hex, RGB, and HSL formats.",
      inputSchema: z.object({
        initialColour: z
          .string()
          .optional()
          .describe("Initial colour to display (hex format, e.g. #ff0000). Defaults to #3b82f6 if not provided."),
      }),
      _meta: { ui: { resourceUri } },
    },
    async (args: { initialColour?: string }): Promise<CallToolResult> => {
      const colour = args.initialColour ?? "#3b82f6";
      
      // Parse hex to RGB
      const hex = colour.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      // Convert RGB to HSL
      const rNorm = r / 255;
      const gNorm = g / 255;
      const bNorm = b / 255;
      const max = Math.max(rNorm, gNorm, bNorm);
      const min = Math.min(rNorm, gNorm, bNorm);
      const l = (max + min) / 2;
      
      let h = 0, s = 0;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case rNorm: h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6; break;
          case gNorm: h = ((bNorm - rNorm) / d + 2) / 6; break;
          case bNorm: h = ((rNorm - gNorm) / d + 4) / 6; break;
        }
      }
      
      const result = {
        hex: colour,
        rgb: { r, g, b },
        hsl: { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) },
      };
      
      return {
        content: [
          { type: "text", text: `Selected colour: ${colour} | RGB(${r}, ${g}, ${b}) | HSL(${result.hsl.h}°, ${result.hsl.s}%, ${result.hsl.l}%)` },
        ],
        structuredContent: result,
      };
    },
  );

  // Register the resource serving the bundled HTML
  registerAppResource(
    server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async (): Promise<ReadResourceResult> => {
      const html = await fs.readFile(path.join(DIST_DIR, "mcp-app.html"), "utf-8");
      return {
        contents: [{ uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html }],
      };
    },
  );

  return server;
}
