export interface FarmerHarvestItem {
  id: string;
  cropName: string;
  category: string;
  quantity: number;
  pricePerUnit: number;
  farmerId: string;
  location?: string;
  harvestDate?: string;
  image?: string;
  imageUrl?: string;
  hasQrCode?: boolean;
  batchId: string;
  farmerLocation: string;
  unit: string;
  pricePerKg: string;
  farmerName: string;
}

export interface RawMaterialStock {
  id: string;
  batchId?: string;
  productName?: string;
  quantity?: number;
  unit?: string;
  supplierFarmer?: string;
  purchaseDate?: string;
  status?: string;
}

export interface ProcessedProductItem {
  id: string;
  processedBatchId?: string;
  productName?: string;
  name?: string;
  category?: string;
  quantity?: number;
  unit?: string;
  pricePerUnit?: number;
  parentRawBatchId?: string;
  qrCodeUrl?: string;
  processingDate?: string;
  description?: string;
  imageUrl?: string;
}

export interface ProcessorCompany {
  id: string;
  companyName?: string;
  verificationStatus?: string;
  processorId?: string;
  factoryLocation?: string;
  factoryCapacity?: string;
  coordinates?: string;
}

export interface CartItem {
  harvestItem: FarmerHarvestItem;
  selectedQuantity: number;
  crop?: any;
  qty?: number;
}
