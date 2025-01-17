"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeWarmPathCall = exports.isTradeWarmCall = exports.WarmPathEncoder = void 0;
const ethers_1 = require("ethers");
const constants_1 = require("../constants");
const price_1 = require("../utils/price");
const constants_2 = require("@ethersproject/constants");
class WarmPathEncoder {
    constructor(base, quote, poolIdx) {
        this.base = base;
        this.quote = quote;
        this.poolIdx = poolIdx;
        this.abiCoder = new ethers_1.ethers.utils.AbiCoder();
    }
    encodeMintConc(lowerTick, upperTick, qty, qtyIsBase, limitLow, limitHigh, useSurplus) {
        return this.encodeWarmPath(qtyIsBase ? MINT_CONC_BASE : MINT_CONC_QUOTE, lowerTick, upperTick, qty, limitLow, limitHigh, useSurplus);
    }
    encodeBurnConc(lowerTick, upperTick, liq, limitLow, limitHigh, useSurplus) {
        return this.encodeWarmPath(BURN_CONCENTRATED, lowerTick, upperTick, liq, limitLow, limitHigh, useSurplus);
    }
    encodeHarvestConc(lowerTick, upperTick, limitLow, limitHigh, useSurplus) {
        return this.encodeWarmPath(HARVEST_CONCENTRATED, lowerTick, upperTick, ethers_1.BigNumber.from(0), limitLow, limitHigh, useSurplus);
    }
    encodeMintAmbient(qty, qtyIsBase, limitLow, limitHigh, useSurplus) {
        return this.encodeWarmPath(qtyIsBase ? MINT_AMBIENT_BASE : MINT_AMBIENT_QUOTE, 0, 0, qty, limitLow, limitHigh, useSurplus);
    }
    encodeBurnAmbient(liq, limitLow, limitHigh, useSurplus) {
        return this.encodeWarmPath(BURN_AMBIENT, 0, 0, liq, limitLow, limitHigh, useSurplus);
    }
    encodeBurnAmbientAll(limitLow, limitHigh, useSurplus) {
        return this.encodeWarmPath(BURN_AMBIENT, 0, 0, constants_1.MAX_LIQ, limitLow, limitHigh, useSurplus);
    }
    encodeWarmPath(callCode, lowerTick, upperTick, qty, limitLow, limitHigh, useSurplus) {
        return this.abiCoder.encode(WARM_ARG_TYPES, [
            callCode,
            this.base,
            this.quote,
            this.poolIdx,
            lowerTick,
            upperTick,
            qty,
            (0, price_1.encodeCrocPrice)(limitLow),
            (0, price_1.encodeCrocPrice)(limitHigh),
            useSurplus,
            constants_2.AddressZero,
        ]);
    }
}
exports.WarmPathEncoder = WarmPathEncoder;
const MINT_CONCENTRATED = 1;
const MINT_CONC_BASE = 11;
const MINT_CONC_QUOTE = 12;
const BURN_CONCENTRATED = 2;
const MINT_AMBIENT = 3;
const MINT_AMBIENT_BASE = 31;
const MINT_AMBIENT_QUOTE = 32;
const BURN_AMBIENT = 4;
const HARVEST_CONCENTRATED = 5;
const WARM_ARG_TYPES = [
    "uint8",
    "address",
    "address",
    "uint24",
    "int24",
    "int24",
    "uint128",
    "uint128",
    "uint128",
    "uint8",
    "address", // deposit vault
];
function isTradeWarmCall(txData) {
    const USER_CMD_METHOD = "0xa15112f9";
    const LIQ_PATH = 2;
    const encoder = new ethers_1.ethers.utils.AbiCoder();
    if (txData.slice(0, 10) === USER_CMD_METHOD) {
        const result = encoder.decode(["uint16", "bytes"], "0x".concat(txData.slice(10)));
        return result[0] == LIQ_PATH;
    }
    return false;
}
exports.isTradeWarmCall = isTradeWarmCall;
function decodeWarmPathCall(txData) {
    const argData = "0x".concat(txData.slice(10 + 192));
    const encoder = new ethers_1.ethers.utils.AbiCoder();
    const result = encoder.decode(WARM_ARG_TYPES, argData);
    return {
        isMint: [MINT_AMBIENT, MINT_CONCENTRATED].includes(result[0]),
        isAmbient: [MINT_AMBIENT, BURN_AMBIENT].includes(result[0]),
        base: result[1],
        quote: result[2],
        poolIdx: result[3],
        lowerTick: result[4],
        upperTick: result[5],
        qty: result[6],
    };
}
exports.decodeWarmPathCall = decodeWarmPathCall;
//# sourceMappingURL=liquidity.js.map