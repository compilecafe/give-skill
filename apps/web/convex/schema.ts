import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  telemetryEvents: defineTable({
    command: v.string(),
    timestamp: v.number(),
    osPlatform: v.string(),
    osArch: v.string(),
    nodeVersion: v.string(),
    cliVersion: v.string(),
  })
    .index("by_command", ["command"])
    .index("by_timestamp", ["timestamp"]),
});
