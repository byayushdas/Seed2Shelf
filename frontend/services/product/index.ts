import { fetchApi } from "../api";

export interface ProductData {
  cropName: string;
  quantity: number;
  unit?: string;
  pricePerUnit: number;
  harvestDate: string;
  location?: string;
  currentOwnerId: string;
  currentOwnerRole: string;
  description?: string;
}

export const productService = {
  async getAllProducts() {
    return fetchApi("/products");
  },

  async getProductsByOwner(ownerId: string) {
    const products = await fetchApi("/products");
    return products.filter((p: any) => p.currentOwnerId === ownerId);
  },

  async addHarvest(data: ProductData) {
    return fetchApi("/products", {
      method: "POST",
      body: JSON.stringify({
        unit: "kg",
        location: "Farm Location",
        description: "Fresh harvest logged from dashboard",
        ...data,
      }),
    });
  },

  async updateProduct(id: string, updates: Partial<ProductData> & { isListed?: boolean }) {
    return fetchApi(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  async toggleListing(id: string, currentStatus: boolean) {
    return fetchApi(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify({ isListed: !currentStatus }),
    });
  },

  async deleteProduct(id: string) {
    return fetchApi(`/products/${id}`, {
      method: "DELETE",
    });
  },

  farmerApi: {
    async getCrops() {
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");
      const res = await fetch(`${baseUrl}/api/farmer/crops`);
      if (!res.ok) throw new Error("Failed to fetch crops");
      return res.json();
    },
    async createCrop(data: any) {
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");
      const res = await fetch(`${baseUrl}/api/farmer/crops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to create crop");
      return res.json();
    },
    async updateCrop(id: string, updates: any) {
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");
      const res = await fetch(`${baseUrl}/api/farmer/crops`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates })
      });
      if (!res.ok) throw new Error("Failed to update crop");
      return res.json();
    }
  },

  distributorApi: {
    async getMarketplace(search?: string) {
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");
      const url = search ? `${baseUrl}/api/distributor/marketplace?search=${search}` : `${baseUrl}/api/distributor/marketplace`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch marketplace crops");
      return res.json();
    },
    async getSupplyHub() {
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");
      const res = await fetch(`${baseUrl}/api/distributor/supplyHub`);
      if (!res.ok) throw new Error("Failed to fetch supply hub");
      return res.json();
    }
  },

  processorApi: {
    async getMarketplace(search?: string) {
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");
      const url = search ? `${baseUrl}/api/processor/marketplace?search=${search}` : `${baseUrl}/api/processor/marketplace`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch processor marketplace");
      return res.json();
    },
    async getInventory() {
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");
      const res = await fetch(`${baseUrl}/api/processor/processedInventory`);
      if (!res.ok) throw new Error("Failed to fetch processed inventory");
      return res.json();
    },
    async createProcessedProduct(data: any) {
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");
      const res = await fetch(`${baseUrl}/api/processor/processedInventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to create processed product");
      return res.json();
    }
  },

  retailerApi: {
    async getMarketplace(search?: string) {
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");
      const url = search ? `${baseUrl}/api/retailer/marketplace?search=${search}` : `${baseUrl}/api/retailer/marketplace`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch retailer marketplace");
      return res.json();
    },
    async getRetailHub() {
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");
      const res = await fetch(`${baseUrl}/api/retailer/retailHub`);
      if (!res.ok) throw new Error("Failed to fetch retail hub");
      return res.json();
    }
  }
};
