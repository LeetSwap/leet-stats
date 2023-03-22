import type { PonderConfig } from "@ponder/core";

export const config: PonderConfig = {
    networks: [
        { name: "canto", chainId: 7700, rpcUrl: process.env.PONDER_RPC_URL_1 },
    ],
    contracts: [
        {
            name: "LeetNotePair",
            network: "canto",
            address: "0x8018280c012a4462c6e3622FA88af7b842dC4654",
            abi: "./abis/LeetSwapV2Pair.json",
            startBlock: 3436300,
            blockLimit: 5500,
        },
    ],
};
