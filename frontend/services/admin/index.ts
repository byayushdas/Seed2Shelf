// Use relative paths if hitting Next.js API Routes in the same server, 
// or BACKEND_URL if hosted separately.
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Client-side
    return "";
  }
  // Server-side
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
};

export const adminService = {
  async getUsers(roleFilter = "ALL", statusFilter = "ALL", search = "") {
    const res = await fetch(`${getBaseUrl()}/api/admin/users?role=${roleFilter}&status=${statusFilter}&search=${encodeURIComponent(search)}`);
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
  },

  async updateUserStatus(userId: string, status: string, reason?: string) {
    const res = await fetch(`${getBaseUrl()}/api/admin/users`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status, reason }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to update user status");
    }
    return res.json();
  },

  async getAuditLogs() {
    const res = await fetch(`${getBaseUrl()}/api/admin/audit-logs`);
    if (!res.ok) throw new Error("Failed to fetch audit logs");
    return res.json();
  },

  async getAnalytics() {
    const res = await fetch(`${getBaseUrl()}/api/admin/analytics`);
    if (!res.ok) throw new Error("Failed to fetch analytics");
    return res.json();
  },

  async getOrders(statusFilter = "ALL") {
    const res = await fetch(`${getBaseUrl()}/api/admin/orders?status=${statusFilter}`);
    if (!res.ok) throw new Error("Failed to fetch orders");
    return res.json();
  },

  async getPayments(statusFilter = "ALL") {
    const res = await fetch(`${getBaseUrl()}/api/admin/payments?status=${statusFilter}`);
    if (!res.ok) throw new Error("Failed to fetch payments");
    return res.json();
  },

  async getReports(statusFilter = "ALL") {
    const res = await fetch(`${getBaseUrl()}/api/admin/reports?status=${statusFilter}`);
    if (!res.ok) throw new Error("Failed to fetch reports");
    return res.json();
  }
};
