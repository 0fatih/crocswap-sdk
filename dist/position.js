"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrocPositionView = void 0;
const tslib_1 = require("tslib");
class CrocPositionView {
    constructor(pool, owner) {
        this.pool = pool;
        this.owner = owner;
    }
    queryRangePos(lowerTick, upperTick, block) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            let blockArg = toCallArg(block);
            let context = yield this.pool.context;
            return context.query.queryRangePosition(this.owner, this.pool.baseToken.tokenAddr, this.pool.quoteToken.tokenAddr, context.chain.poolIndex, lowerTick, upperTick, blockArg);
        });
    }
    queryAmbient(block) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            let blockArg = toCallArg(block);
            let context = yield this.pool.context;
            return context.query.queryAmbientPosition(this.owner, this.pool.baseToken.tokenAddr, this.pool.quoteToken.tokenAddr, context.chain.poolIndex, blockArg);
        });
    }
    queryKnockoutLivePos(isBid, lowerTick, upperTick, block) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            let blockArg = toCallArg(block);
            let context = yield this.pool.context;
            let pivotTick = isBid ? lowerTick : upperTick;
            const pivotTime = (yield context.query.queryKnockoutPivot(this.pool.baseToken.tokenAddr, this.pool.quoteToken.tokenAddr, context.chain.poolIndex, isBid, pivotTick, blockArg)).pivot;
            return context.query.queryKnockoutTokens(this.owner, this.pool.baseToken.tokenAddr, this.pool.quoteToken.tokenAddr, context.chain.poolIndex, pivotTime, isBid, lowerTick, upperTick, blockArg);
        });
    }
    queryRewards(lowerTick, upperTick, block) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            let blockArg = toCallArg(block);
            let context = yield this.pool.context;
            return (yield context.query.queryConcRewards(this.owner, this.pool.baseToken.tokenAddr, this.pool.quoteToken.tokenAddr, context.chain.poolIndex, lowerTick, upperTick, blockArg));
        });
    }
}
exports.CrocPositionView = CrocPositionView;
function toCallArg(block) {
    return block ? { blockTag: block } : {};
}
//# sourceMappingURL=position.js.map