import { fetchApi } from "../api";

export const shipmentService = {
  async getActiveShipments(sellerOrBuyerId: string) {
    const orders = await fetchApi("/orders");
    return orders.filter(
      (o: any) =>
        (o.sellerId === sellerOrBuyerId || o.buyerId === sellerOrBuyerId) &&
        (o.orderStatus === "ACCEPTED" || o.deliveryStatus === "SHIPPED")
    );
  },

  farmerApi: {
    async getShipments() {
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");
      const res = await fetch(`${baseUrl}/api/farmer/shipments`);
      if (!res.ok) throw new Error("Failed to fetch shipments");
      return res.json();
    },
    async createShipment(data: any) {
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");
      const res = await fetch(`${baseUrl}/api/farmer/shipments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to create shipment");
      return res.json();
    },
    async updateShipment(id: string, updates: any) {
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");
      const res = await fetch(`${baseUrl}/api/farmer/shipments`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates })
      });
      if (!res.ok) throw new Error("Failed to update shipment");
      return res.json();
    }
  },

  distributorApi: {
    async getShipments() {
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");
      const res = await fetch(`${baseUrl}/api/distributor/shipments`);
      if (!res.ok) throw new Error("Failed to fetch distributor shipments");
      return res.json();
    },
    async createShipment(data: any) {
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");
      const res = await fetch(`${baseUrl}/api/distributor/shipments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to create shipment");
      return res.json();
    }
  },

  processorApi: {
    async getShipments() {
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");
      const res = await fetch(`${baseUrl}/api/processor/shipments`);
      if (!res.ok) throw new Error("Failed to fetch processor shipments");
      return res.json();
    },
    async createShipment(data: any) {
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");
      const res = await fetch(`${baseUrl}/api/processor/shipments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to create shipment");
      return res.json();
    }
  },

  retailerApi: {
    async getShipments() {
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");
      const res = await fetch(`${baseUrl}/api/retailer/shipments`);
      if (!res.ok) throw new Error("Failed to fetch retailer shipments");
      return res.json();
    },
    async updateShipment(id: string, status: string) {
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");
      const res = await fetch(`${baseUrl}/api/retailer/shipments`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      if (!res.ok) throw new Error("Failed to update shipment");
      return res.json();
    }
  }
};
