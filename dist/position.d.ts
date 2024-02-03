import { CrocPoolView } from './pool';
declare type Address = string;
declare type BlockTag = number | string;
export declare class CrocPositionView {
    constructor(pool: CrocPoolView, owner: Address);
    queryRangePos(lowerTick: number, upperTick: number, block?: BlockTag): Promise<any>;
    queryAmbient(block?: BlockTag): Promise<any>;
    queryKnockoutLivePos(isBid: boolean, lowerTick: number, upperTick: number, block?: BlockTag): Promise<any>;
    queryRewards(lowerTick: number, upperTick: number, block?: BlockTag): Promise<any>;
    readonly owner: Address;
    readonly pool: CrocPoolView;
}
export {};
