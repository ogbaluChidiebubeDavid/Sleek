import { ethers } from "ethers";

// Default to Base Sepolia public RPC
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org";
const PAYMENT_ROUTER_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_ROUTER_ADDRESS || "0x9c32A15535C578c7F2B75A57CD7E44243F7BEc5e";

// Simple mapping for Currency to ETH rate (1 ETH = 3,500,000 NGN or ~2,300 USD)
const ETH_RATE_NGN = 3500000;

export function getProvider() {
  return new ethers.JsonRpcProvider(RPC_URL);
}

export function createNewWallet() {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}

export async function getWalletBalance(address: string): Promise<string> {
  try {
    const provider = getProvider();
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error("[Blockchain] Error getting balance:", error);
    return "0.0";
  }
}

// Convert NGN amount to ETH equivalent for on-chain payments
export function convertNgnToEth(ngnAmount: number): string {
  const ethValue = ngnAmount / ETH_RATE_NGN;
  // Format to 6 decimal places to prevent transaction rounding issues
  return ethValue.toFixed(6);
}

// ABI for the PaymentRouter contract
export const PAYMENT_ROUTER_ABI = [
  "function pay(address payable vendor, string calldata orderId) external payable",
  "event PaymentRouted(address indexed buyer, address indexed vendor, uint256 totalAmount, uint256 platformFee, uint256 vendorAmount, string orderId)"
];

// Faucet funding for user wallet during demo/testnet run
export async function fundWallet(targetAddress: string, amountEth = "0.01"): Promise<string | null> {
  const faucetKey = process.env.FAUCET_PRIVATE_KEY;
  if (!faucetKey) {
    console.warn("[Blockchain] FAUCET_PRIVATE_KEY is not configured in .env. Faucet transfer skipped.");
    return null;
  }

  try {
    const provider = getProvider();
    const faucetWallet = new ethers.Wallet(faucetKey, provider);
    
    console.log(`[Blockchain] Faucet sending ${amountEth} ETH to ${targetAddress}...`);
    const tx = await faucetWallet.sendTransaction({
      to: targetAddress,
      value: ethers.parseEther(amountEth),
    });
    
    await tx.wait();
    console.log(`[Blockchain] Faucet transfer successful: ${tx.hash}`);
    return tx.hash;
  } catch (error) {
    console.error("[Blockchain] Faucet drip failed:", error);
    return null;
  }
}

// Execute the payment split transaction
export async function executeSplitPayment(
  userPrivateKey: string,
  vendorAddress: string,
  amountEth: string,
  orderId: string
): Promise<{ txHash: string; receipt: any }> {
  const provider = getProvider();
  const userWallet = new ethers.Wallet(userPrivateKey, provider);
  
  const contract = new ethers.Contract(PAYMENT_ROUTER_ADDRESS, PAYMENT_ROUTER_ABI, userWallet);
  
  console.log(`[Blockchain] Sending payment for order ${orderId}: ${amountEth} ETH to vendor ${vendorAddress}`);
  
  const tx = await contract.pay(vendorAddress, orderId, {
    value: ethers.parseEther(amountEth),
  });
  
  const receipt = await tx.wait();
  console.log(`[Blockchain] Payment routed successfully. Tx Hash: ${tx.hash}`);
  
  return {
    txHash: tx.hash,
    receipt,
  };
}
