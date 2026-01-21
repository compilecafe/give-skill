import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const record = internalMutation({
  args: {
    command: v.string(),
    timestamp: v.number(),
    osPlatform: v.string(),
    osArch: v.string(),
    nodeVersion: v.string(),
    cliVersion: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("telemetryEvents", args);
    return null;
  },
});
