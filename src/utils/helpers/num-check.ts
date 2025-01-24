import { useReadContract } from "wagmi";
import { Address, isAddress } from "viem";
import nftAbi from "@/abis/MomoNFT.json";

const NFT_CONTRACT_ADDRESS = "0x063EC4E9d7C55A572d3f24d600e1970df75e84cA";

/**
 * Hook to check if a mobile number is linked to an NFT
 * @param mobileNumber - The normalized mobile number
 * @returns {boolean | undefined} - `true` if the NFT exists, `false` if not, `undefined` if loading
 */
export function useCheckNFTByMobile(mobileNumber: string) {
  const { data, isLoading, isError } = useReadContract({
    address: NFT_CONTRACT_ADDRESS as Address,
    abi: nftAbi.abi,
    functionName: "getWalletByMobile",
    args: [mobileNumber],
  });

  if (isLoading) return undefined;
  if (isError || !data || !isAddress(data as string)) return false;

  return (
    (data as string).toLowerCase() !==
    "0x0000000000000000000000000000000000000000"
  );
}
