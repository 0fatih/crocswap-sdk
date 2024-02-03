import { BigNumber } from "ethers";
declare type ChainAddress = string;
declare type ChainId = string;
export interface ChainSpec {
    nodeUrl: string;
    wsUrl?: string;
    poolIndex: number;
    addrs: {
        dex: ChainAddress;
        query: ChainAddress;
        impact: ChainAddress;
    };
    isTestNet: boolean;
    chainId: ChainId;
    gridSize: number;
    proxyPaths: {
        cold: number;
        liq: number;
        long: number;
    };
    blockExplorer?: string;
    displayName: string;
    logoUrl?: string;
}
export declare const CHAIN_SPECS: {
    [chainId: string]: ChainSpec;
};
export declare const MIN_TICK = -665454;
export declare const MAX_TICK = 831818;
export declare const MAX_SQRT_PRICE: BigNumber;
export declare const MIN_SQRT_PRICE: BigNumber;
export declare const MAX_LIQ: BigNumber;
export {};
