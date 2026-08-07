export const traceService = {
  async getTraceabilityData(id: string) {
    const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");
    const res = await fetch(`${baseUrl}/api/trace/${id}`);
    if (!res.ok) throw new Error("Failed to fetch traceability data");
    return res.json();
  }
};
