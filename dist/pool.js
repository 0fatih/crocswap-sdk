"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrocPoolView = void 0;
const tslib_1 = require("tslib");
const utils_1 = require("./utils");
const tokens_1 = require("./tokens");
const liquidity_1 = require("./encoding/liquidity");
const ethers_1 = require("ethers");
const constants_1 = require("@ethersproject/constants");
const init_1 = require("./encoding/init");
const flags_1 = require("./encoding/flags");
class CrocPoolView {
    constructor(quoteToken, baseToken, context) {
        [this.baseToken, this.quoteToken] =
            (0, tokens_1.sortBaseQuoteViews)(baseToken, quoteToken);
        this.context = context;
        this.baseDecimals = this.baseToken.decimals;
        this.quoteDecimals = this.quoteToken.decimals;
        this.useTrueBase = this.baseToken.tokenAddr === baseToken.tokenAddr;
    }
    isInit() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            return this.spotPrice()
                .then(p => p > 0);
        });
    }
    spotPrice(block) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            let txArgs = block ? { blockTag: block } : {};
            let sqrtPrice = (yield this.context).query.queryPrice(this.baseToken.tokenAddr, this.quoteToken.tokenAddr, (yield this.context).chain.poolIndex, txArgs);
            return (0, utils_1.decodeCrocPrice)(yield sqrtPrice);
        });
    }
    displayPrice(block) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            let spotPrice = this.spotPrice(block);
            return this.toDisplayPrice(yield spotPrice);
        });
    }
    spotTick(block) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            let txArgs = block ? { blockTag: block } : {};
            return (yield this.context).query.queryCurveTick(this.baseToken.tokenAddr, this.quoteToken.tokenAddr, (yield this.context).chain.poolIndex, txArgs);
        });
    }
    cumAmbientGrowth(block) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            let txArgs = block ? { blockTag: block } : {};
            const queryCurve = (yield this.context).query.queryCurve(this.baseToken.tokenAddr, this.quoteToken.tokenAddr, (yield this.context).chain.poolIndex, txArgs);
            const seedDeflator = (yield queryCurve).seedDeflator_;
            return seedDeflator / Math.pow(2, 48);
        });
    }
    toDisplayPrice(spotPrice) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            return (0, utils_1.toDisplayPrice)(spotPrice, yield this.baseDecimals, yield this.quoteDecimals, !this.useTrueBase);
        });
    }
    fromDisplayPrice(dispPrice) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            return (0, utils_1.fromDisplayPrice)(dispPrice, yield this.baseDecimals, yield this.quoteDecimals, !this.useTrueBase);
        });
    }
    displayToPinTick(dispPrice) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const spotPrice = yield this.fromDisplayPrice(dispPrice);
            const gridSize = (yield this.context).chain.gridSize;
            return [(0, utils_1.pinTickLower)(spotPrice, gridSize), (0, utils_1.pinTickUpper)(spotPrice, gridSize)];
        });
    }
    displayToNeighborTicks(dispPrice, nNeighbors = 3) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const spotPrice = yield this.fromDisplayPrice(dispPrice);
            const gridSize = (yield this.context).chain.gridSize;
            return (0, utils_1.neighborTicks)(spotPrice, gridSize, nNeighbors);
        });
    }
    displayToNeighborTickPrices(dispPrice, nNeighbors = 3) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const ticks = yield this.displayToNeighborTicks(dispPrice, nNeighbors);
            const toPriceFn = (tick) => this.toDisplayPrice((0, utils_1.tickToPrice)(tick));
            const belowPrices = Promise.all(ticks.below.map(toPriceFn));
            const abovePrices = Promise.all(ticks.above.map(toPriceFn));
            return this.useTrueBase ?
                { below: yield belowPrices, above: yield abovePrices } :
                { below: yield abovePrices, above: yield belowPrices };
        });
    }
    displayToOutsidePin(dispPrice) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const spotPrice = this.fromDisplayPrice(dispPrice);
            const gridSize = (yield this.context).chain.gridSize;
            const pinTick = (0, utils_1.pinTickOutside)(yield spotPrice, yield this.spotPrice(), gridSize);
            const pinPrice = this.toDisplayPrice((0, utils_1.tickToPrice)(pinTick.tick));
            return Object.assign(pinTick, { price: yield pinPrice,
                isPriceBelow: (yield pinPrice) < dispPrice });
        });
    }
    initPool(initPrice) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            // Very small amount of ETH in economic terms but more than sufficient for min init burn
            const ETH_INIT_BURN = ethers_1.BigNumber.from(10).pow(12);
            let txArgs = this.baseToken.tokenAddr === constants_1.AddressZero ? { value: ETH_INIT_BURN } : {};
            let encoder = new init_1.PoolInitEncoder(this.baseToken.tokenAddr, this.quoteToken.tokenAddr, (yield this.context).chain.poolIndex);
            let spotPrice = this.fromDisplayPrice(initPrice);
            let calldata = encoder.encodeInitialize(yield spotPrice);
            let cntx = yield this.context;
            return cntx.dex.userCmd(cntx.chain.proxyPaths.cold, calldata, txArgs);
        });
    }
    mintAmbientBase(qty, limits, opts) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            return this.mintAmbient(qty, this.useTrueBase, limits, opts);
        });
    }
    mintAmbientQuote(qty, limits, opts) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            return this.mintAmbient(qty, !this.useTrueBase, limits, opts);
        });
    }
    mintRangeBase(qty, range, limits, opts) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            return this.mintRange(qty, this.useTrueBase, range, yield limits, opts);
        });
    }
    mintRangeQuote(qty, range, limits, opts) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            return this.mintRange(qty, !this.useTrueBase, range, yield limits, opts);
        });
    }
    burnAmbientLiq(liq, limits, opts) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            let [lowerBound, upperBound] = yield this.transformLimits(limits);
            const calldata = (yield this.makeEncoder()).encodeBurnAmbient(liq, lowerBound, upperBound, this.maskSurplusFlag(opts));
            return this.sendCmd(calldata);
        });
    }
    burnAmbientAll(limits, opts) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            let [lowerBound, upperBound] = yield this.transformLimits(limits);
            const calldata = (yield this.makeEncoder()).encodeBurnAmbientAll(lowerBound, upperBound, this.maskSurplusFlag(opts));
            return this.sendCmd(calldata);
        });
    }
    burnRangeLiq(liq, range, limits, opts) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            let [lowerBound, upperBound] = yield this.transformLimits(limits);
            let roundLotLiq = (0, utils_1.roundForConcLiq)(liq);
            const calldata = (yield this.makeEncoder()).encodeBurnConc(range[0], range[1], roundLotLiq, lowerBound, upperBound, this.maskSurplusFlag(opts));
            return this.sendCmd(calldata);
        });
    }
    harvestRange(range, limits, opts) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            let [lowerBound, upperBound] = yield this.transformLimits(limits);
            const calldata = (yield this.makeEncoder()).encodeHarvestConc(range[0], range[1], lowerBound, upperBound, this.maskSurplusFlag(opts));
            return this.sendCmd(calldata);
        });
    }
    sendCmd(calldata, txArgs) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            let cntx = yield this.context;
            return txArgs ?
                cntx.dex.userCmd(cntx.chain.proxyPaths.liq, calldata, txArgs) :
                cntx.dex.userCmd(cntx.chain.proxyPaths.liq, calldata);
        });
    }
    mintAmbient(qty, isQtyBase, limits, opts) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            let msgVal = this.msgValAmbient(qty, isQtyBase, limits, opts);
            let weiQty = this.normQty(qty, isQtyBase);
            let [lowerBound, upperBound] = yield this.transformLimits(limits);
            const calldata = (yield this.makeEncoder()).encodeMintAmbient(yield weiQty, isQtyBase, lowerBound, upperBound, this.maskSurplusFlag(opts));
            return this.sendCmd(calldata, { value: yield msgVal });
        });
    }
    boundLimits(range, limits) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            let spotPrice = this.spotPrice();
            const [lowerPrice, upperPrice] = this.rangeToPrice(range);
            const [boundLower, boundUpper] = yield this.transformLimits(limits);
            const BOUND_PREC = 1.0001;
            let [amplifyLower, amplifyUpper] = [boundLower, boundUpper];
            if (upperPrice < (yield spotPrice)) {
                amplifyLower = upperPrice * BOUND_PREC;
            }
            else if (lowerPrice > (yield spotPrice)) {
                amplifyUpper = lowerPrice / BOUND_PREC;
            }
            else {
                // Generally assume we don't want to send more than 1% more than the floating side
                const MAX_AMPLICATION = 1.02;
                const slippageCap = 1 - Math.pow(1 - 1 / MAX_AMPLICATION, 2);
                amplifyLower = ((yield spotPrice) - lowerPrice) * slippageCap + lowerPrice;
                amplifyUpper = upperPrice - (upperPrice - (yield spotPrice)) * slippageCap;
            }
            return this.untransformLimits([Math.max(amplifyLower, boundLower), Math.min(amplifyUpper, boundUpper)]);
        });
    }
    rangeToPrice(range) {
        const lowerPrice = Math.pow(1.0001, range[0]);
        const upperPrice = Math.pow(1.0001, range[1]);
        return [lowerPrice, upperPrice];
    }
    transformLimits(limits) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            let left = this.fromDisplayPrice(limits[0]);
            let right = this.fromDisplayPrice(limits[1]);
            return ((yield left) < (yield right)) ?
                [yield left, yield right] :
                [yield right, yield left];
        });
    }
    untransformLimits(limits) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            let left = this.toDisplayPrice(limits[0]);
            let right = this.toDisplayPrice(limits[1]);
            return ((yield left) < (yield right)) ?
                [yield left, yield right] :
                [yield right, yield left];
        });
    }
    mintRange(qty, isQtyBase, range, limits, opts) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const saneLimits = yield this.boundLimits(range, limits);
            let msgVal = this.msgValRange(qty, isQtyBase, range, yield saneLimits, opts);
            let weiQty = this.normQty(qty, isQtyBase);
            let [lowerBound, upperBound] = yield this.transformLimits(yield saneLimits);
            const calldata = (yield this.makeEncoder()).encodeMintConc(range[0], range[1], yield weiQty, isQtyBase, lowerBound, upperBound, this.maskSurplusFlag(opts));
            return this.sendCmd(calldata, { value: yield msgVal });
        });
    }
    maskSurplusFlag(opts) {
        if (!opts || opts.surplus === undefined) {
            return this.maskSurplusFlag({ surplus: false });
        }
        return (0, flags_1.encodeSurplusArg)(opts.surplus, this.useTrueBase);
    }
    msgValAmbient(qty, isQtyBase, limits, opts) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            let ethQty = isQtyBase ? qty :
                this.ethForAmbientQuote(qty, limits);
            return this.ethToAttach(yield ethQty, opts);
        });
    }
    msgValRange(qty, isQtyBase, range, limits, opts) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            let ethQty = isQtyBase ? qty :
                this.ethForRangeQuote(qty, range, limits);
            return this.ethToAttach(yield ethQty, opts);
        });
    }
    ethToAttach(neededQty, opts) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (this.baseToken.tokenAddr !== constants_1.AddressZero) {
                return ethers_1.BigNumber.from(0);
            }
            const ethQty = yield this.normEth(neededQty);
            let useSurplus = (0, flags_1.decodeSurplusFlag)(this.maskSurplusFlag(opts))[0];
            if (useSurplus) {
                return new tokens_1.CrocEthView(this.context).msgValOverSurplus(ethQty);
            }
            else {
                return ethers_1.BigNumber.from(ethQty);
            }
        });
    }
    ethForAmbientQuote(quoteQty, limits) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const weiEth = this.calcEthInQuote(quoteQty, limits);
            return (0, utils_1.toDisplayQty)(yield weiEth, yield this.baseDecimals);
        });
    }
    calcEthInQuote(quoteQty, limits, precAdj = 1.001) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const weiQty = yield this.normQty(quoteQty, false);
            const [, boundPrice] = yield this.transformLimits(limits);
            return Math.round((0, utils_1.bigNumToFloat)(weiQty) * boundPrice * precAdj);
        });
    }
    ethForRangeQuote(quoteQty, range, limits) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const [, boundPrice] = yield this.transformLimits(limits);
            const [lowerPrice, upperPrice] = this.rangeToPrice(range);
            let skew = (0, utils_1.concDepositSkew)(boundPrice, lowerPrice, upperPrice);
            let ambiQty = this.calcEthInQuote(quoteQty, limits);
            let concQty = ambiQty.then(aq => Math.ceil(aq * skew));
            return (0, utils_1.toDisplayQty)(yield concQty, yield this.baseDecimals);
        });
    }
    normEth(ethQty) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            return this.normQty(ethQty, true); // ETH is always on base side
        });
    }
    normQty(qty, isBase) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            let token = isBase ? this.baseToken : this.quoteToken;
            return token.normQty(qty);
        });
    }
    makeEncoder() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            return new liquidity_1.WarmPathEncoder(this.baseToken.tokenAddr, this.quoteToken.tokenAddr, (yield this.context).chain.poolIndex);
        });
    }
}
exports.CrocPoolView = CrocPoolView;
//# sourceMappingURL=pool.js.map