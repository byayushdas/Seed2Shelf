import { useState, useEffect } from 'react';
import batchesData from '../data/batches.json';

// Type definitions for the mock chain data
export type StakeholderData = {
  address: string;
  name: string;
  timestamp: number;
  pricePerKg: number;
  remarks?: string;
};

export type Batch = {
  id: number;
  cropType: string;
  weightKg: number;
  gpsCoordinates: string;
  farmer: StakeholderData;
  processor: StakeholderData | null;
  distributor: StakeholderData | null;
  retailer: StakeholderData | null;
  status: string;
};

export function useChain() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // In a real web3 app, this would connect to the provider, get the signer,
  // instantiate ethers.Contract blocks, and fetch data from the Sepolia Testnet.
  useEffect(() => {
    // Simulate network delay
    setTimeout(() => {
      setBatches(batchesData as Batch[]);
      setIsLoading(false);
    }, 800);
  }, []);

  const getBatchById = (id: number): Batch | undefined => {
    return batches.find(b => b.id === id);
  };

  const logHarvestBatch = async (data: any) => {
    console.log("Simulating contract call: registry.registerBatch()", data);
    return true;
  };

  const transferCustody = async (batchId: number, toAddress: string, price: number, remarks: string) => {
    console.log(`Simulating contract call: custodyTransfer.transferCustody(${batchId}, ${toAddress}, ${price})`, remarks);
    return true;
  };

  return {
    batches,
    isLoading,
    getBatchById,
    logHarvestBatch,
    transferCustody
  };
}
