export function getApiBaseUrl() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL must be configured with the deployed API URL.");
  }
  return apiBaseUrl.replace(/\/+$/, "");
}
