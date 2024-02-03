import { BytesLike } from "ethers";
export declare function ambientPosSlot(owner: string, base: string, quote: string, poolType: number): BytesLike;
export declare function concPosSlot(owner: string, base: string, quote: string, lowerTick: number, upperTick: number, poolType: number): BytesLike;
