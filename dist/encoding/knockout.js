"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnockoutEncoder = void 0;
const ethers_1 = require("ethers");
class KnockoutEncoder {
    constructor(base, quote, poolIdx) {
        this.base = base;
        this.quote = quote;
        this.poolIdx = poolIdx;
        this.abiCoder = new ethers_1.ethers.utils.AbiCoder();
    }
    encodeKnockoutMint(qty, lowerTick, upperTick, isBid, useSurplusFlags) {
        const MINT_SUBCMD = 91;
        const suppArgs = this.abiCoder.encode(["uint128", "bool"], [qty, false]);
        return this.encodeCommonArgs(MINT_SUBCMD, lowerTick, upperTick, isBid, useSurplusFlags, suppArgs);
    }
    encodeKnockoutBurnQty(qty, lowerTick, upperTick, isBid, useSurplusFlags) {
        const BURN_SUBCMD = 92;
        const suppArgs = this.abiCoder.encode(["uint128", "bool", "bool"], [qty, false, false]);
        return this.encodeCommonArgs(BURN_SUBCMD, lowerTick, upperTick, isBid, useSurplusFlags, suppArgs);
    }
    encodeKnockoutBurnLiq(liq, lowerTick, upperTick, isBid, useSurplusFlags) {
        const BURN_SUBCMD = 92;
        const suppArgs = this.abiCoder.encode(["uint128", "bool", "bool"], [liq, true, false]);
        return this.encodeCommonArgs(BURN_SUBCMD, lowerTick, upperTick, isBid, useSurplusFlags, suppArgs);
    }
    encodeKnockoutRecover(pivotTime, lowerTick, upperTick, isBid, useSurplusFlags) {
        const BURN_SUBCMD = 94;
        const suppArgs = this.abiCoder.encode(["uint32"], [pivotTime]);
        return this.encodeCommonArgs(BURN_SUBCMD, lowerTick, upperTick, isBid, useSurplusFlags, suppArgs);
    }
    encodeCommonArgs(subcmd, lowerTick, upperTick, isBid, useSurplusFlags, suppArgs) {
        return this.abiCoder.encode(KNOCKOUT_ARG_TYPES, [subcmd, this.base, this.quote, this.poolIdx,
            lowerTick, upperTick, isBid,
            useSurplusFlags, suppArgs]);
    }
}
exports.KnockoutEncoder = KnockoutEncoder;
const KNOCKOUT_ARG_TYPES = [
    "uint8",
    "address",
    "address",
    "uint24",
    "int24",
    "int24",
    "bool",
    "uint8",
    "bytes", // subcmd args
];
//# sourceMappingURL=knockout.js.map