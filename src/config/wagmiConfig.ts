// Make sure to import `createConfig` from `@privy-io/wagmi`, not `wagmi`
import { createConfig } from "@privy-io/wagmi";
import { liskSepolia } from "viem/chains";
import { http } from "wagmi";

// Replace this with your app's required chains
export const config = createConfig({
  chains: [liskSepolia], // Pass your required chains as an array
  transports: {
    [liskSepolia.id]: http(),
    // For each of your required chains, add an entry to `transports` with
    // a key of the chain's `id` and a value of `http()`
  },
});
