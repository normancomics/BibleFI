export function mcpAuthenticationError(userId) {
  if (typeof userId === "string" && userId.length > 0) return undefined;
  return {
    content: [{ type: "text", text: "Authentication required. Sign in to use BibleFi MCP tools." }],
    isError: true,
  };
}
