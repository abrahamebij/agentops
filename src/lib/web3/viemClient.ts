import { createWalletClient, custom, createPublicClient, http, formatEther } from "viem";
import { sepolia } from "viem/chains";

export function getViemPublicClient() {
  return createPublicClient({
    chain: sepolia,
    transport: http(),
  });
}

export async function connectViemWallet(): Promise<{
  address: `0x${string}`;
  chainId: number;
  balanceEth: string;
}> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No EIP-1193 Web3 wallet (MetaMask / Coinbase Wallet) detected in browser.");
  }

  const walletClient = createWalletClient({
    chain: sepolia,
    transport: custom(window.ethereum),
  });

  const [address] = await walletClient.requestAddresses();
  const chainId = await walletClient.getChainId();

  const publicClient = getViemPublicClient();
  const balanceWei = await publicClient.getBalance({ address });
  const balanceEth = formatEther(balanceWei);

  return {
    address,
    chainId,
    balanceEth,
  };
}
