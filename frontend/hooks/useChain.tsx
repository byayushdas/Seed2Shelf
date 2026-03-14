import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers, BrowserProvider, Contract } from 'ethers';
import { CONTRACT_ADDRESSES, BatchRegistryABI, CustodyTransferABI, PaymentEscrowABI } from '../config/contracts';

export type StakeholderData = {
  address: string;
  name: string;
  timestamp: number;
  pricePerKg: number;
  remarks?: string;
};

export type Batch = {
  id: string; 
  cropType: string;
  weightKg: number;
  gpsCoordinates: string;
  farmer: StakeholderData;
  processor: StakeholderData | null;
  distributor: StakeholderData | null;
  retailer: StakeholderData | null;
  status: string;
};

export type WalletActivity = {
  id: string;
  type: string;
  batchId: string;
  timestamp: number;
  description: string;
  amount?: number;
};

interface ChainContextProps {
  account: string | null;
  provider: BrowserProvider | null;
  batches: Batch[];
  walletActivity: WalletActivity[];
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  getBatchById: (id: string) => Batch | undefined;
  logHarvestBatch: (cropType: string, weightKg: number, gps: string, price: number) => Promise<boolean>;
  transferCustody: (batchId: string, toAddress: string, price: number, remarks: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

const ChainContext = createContext<ChainContextProps>({} as ChainContextProps);

export function ChainProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [walletActivity, setWalletActivity] = useState<WalletActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const connectWallet = async () => {
     if (typeof window !== 'undefined' && (window as any).ethereum) {
       try {
         const web3Provider = new ethers.BrowserProvider((window as any).ethereum);
         const accounts = await web3Provider.send("eth_requestAccounts", []);
         setProvider(web3Provider);
         setAccount(accounts[0]);
         await fetchData(web3Provider, accounts[0]);
       } catch (error) {
         console.error("User rejected request", error);
       }
     } else {
         alert("Please install MetaMask!");
     }
  };

  const fetchData = async (web3Provider: BrowserProvider, currentAccount?: string) => {
    setIsLoading(true);
    try {
      const registry = new Contract(CONTRACT_ADDRESSES.BatchRegistry, BatchRegistryABI, web3Provider);
      const custody = new Contract(CONTRACT_ADDRESSES.CustodyTransfer, CustodyTransferABI, web3Provider);
      
      const filter = registry.filters.BatchRegistered();
      const events = await registry.queryFilter(filter, 0, 'latest');
      
      const parsedBatches: Batch[] = [];
      const activities: WalletActivity[] = [];

      for (const event of events) {
         const args = (event as any).args;
         const batchId = args[0];
         
         const b = await registry.getBatch(batchId);
         const handoffs = await custody.getHandoffs(batchId);

         const farmerData: StakeholderData = {
            address: b.farmer, name: "Verified Farmer", timestamp: Number(b.timestamp), pricePerKg: Number(b.farmGatePrice)
         };
         
         let processor = null, distributor = null, retailer = null;
         let status = "AT_FARM";

         for (const h of handoffs) {
             const role = Number(h.toRole);
             const sh = { address: h.to, name: role === 1 ? "Processor" : role === 2 ? "Distributor" : "Retailer", timestamp: Number(h.timestamp), pricePerKg: Number(h.price), remarks: h.remarks };
             if (role === 1) { processor = sh; status = "PROCESSED"; }
             if (role === 2) { distributor = sh; status = "IN_TRANSIT"; }
             if (role === 3) { retailer = sh; status = "ON_SHELF"; }
             
             if (currentAccount && (h.to.toLowerCase() === currentAccount.toLowerCase() || h.from.toLowerCase() === currentAccount.toLowerCase())) {
                 activities.push({
                     id: h.timestamp.toString(),
                     type: 'TRANSFER',
                     batchId: batchId,
                     timestamp: Number(h.timestamp),
                     description: `Custody transferred ${h.from.toLowerCase() === currentAccount.toLowerCase() ? 'from' : 'to'} you.`,
                     amount: Number(h.price)
                 });
             }
         }

         if (currentAccount && b.farmer.toLowerCase() === currentAccount.toLowerCase()) {
             activities.push({
                 id: b.timestamp.toString(),
                 type: 'REGISTER',
                 batchId: batchId,
                 timestamp: Number(b.timestamp),
                 description: `You logged a new ${b.cropType} batch at source.`,
             });
         }

         parsedBatches.push({
            id: batchId, cropType: b.cropType, weightKg: Number(b.weightKg), gpsCoordinates: b.gpsCoordinates,
            farmer: farmerData, processor, distributor, retailer, status
         });
      }
      
      setBatches(parsedBatches.reverse());
      setWalletActivity(activities.sort((a,b) => b.timestamp - a.timestamp));
    } catch(e) { 
      console.error(e); 
    }
    setIsLoading(false);
  };

  const refreshData = async () => {
     if (provider) await fetchData(provider, account || undefined);
  }

  useEffect(() => {
     const init = async () => {
         if (typeof window !== 'undefined' && (window as any).ethereum) {
             const web3Provider = new ethers.BrowserProvider((window as any).ethereum);
             const accounts = await web3Provider.listAccounts();
             if (accounts.length > 0) {
                 setProvider(web3Provider);
                 setAccount(accounts[0].address);
                 await fetchData(web3Provider, accounts[0].address);
             } else {
                 setIsLoading(false);
             }
         } else {
             setIsLoading(false);
         }
     }
     init();
  }, []);

  const getBatchById = (id: string): Batch | undefined => {
    return batches.find(b => b.id.toLowerCase() === id.toLowerCase());
  };

  const logHarvestBatch = async (cropType: string, weightKg: number, gps: string, price: number) => {
    if (!provider) return false;
    try {
        const signer = await provider.getSigner();
        const registry = new Contract(CONTRACT_ADDRESSES.BatchRegistry, BatchRegistryABI, signer);
        const tx = await registry.registerBatch(cropType, weightKg, gps, price);
        await tx.wait();
        await refreshData();
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
  };

  const transferCustody = async (batchId: string, toAddress: string, price: number, remarks: string) => {
    if (!provider) return false;
    try {
        const signer = await provider.getSigner();
        const custody = new Contract(CONTRACT_ADDRESSES.CustodyTransfer, CustodyTransferABI, signer);
        const tx = await custody.transferCustody(batchId, toAddress, price, remarks);
        await tx.wait();
        await refreshData();
        return true;
    } catch (e) {
         console.error(e);
         return false;
    }
  };

  return (
    <ChainContext.Provider value={{
        account, provider, batches, walletActivity, isLoading,
        connectWallet, getBatchById, logHarvestBatch, transferCustody, refreshData
    }}>
      {children}
    </ChainContext.Provider>
  );
}

export const useChain = () => useContext(ChainContext);
