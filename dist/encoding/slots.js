"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.concPosSlot = exports.ambientPosSlot = void 0;
const ethers_1 = require("ethers");
/* Determines the EVM storage slot for a given ambient liquidity postion. Can be used
* to uniquely identify LP positions.
*
* @param owner The owner of the ambient LP (usually msg.sender)
* @param base The address of the base token in the pool
* @param quote The address of the quote token in the pool
* @param poolType The pool type index number
* @return The EVM slot hash that the position is stored at in the contract.  */
function ambientPosSlot(owner, base, quote, poolType) {
    const encoder = new ethers_1.ethers.utils.AbiCoder();
    const poolHash = ethers_1.ethers.utils.keccak256(encoder.encode(["address", "address", "uint256"], [base, quote, poolType]));
    const posKey = ethers_1.ethers.utils.solidityKeccak256(["address", "bytes32"], [owner, poolHash]);
    return ethers_1.ethers.utils.solidityKeccak256(["bytes32", "uint256"], [posKey, AMBIENT_POS_SLOT]);
}
exports.ambientPosSlot = ambientPosSlot;
/* Determines the EVM storage slot for a given ambient liquidity postion. Can be used
* to uniquely identify LP positions.
*
* @param owner The owner of the ambient LP (usually msg.sender)
* @param base The address of the base token in the pool
* @param quote The address of the quote token in the pool
* @param poolType The pool type index number
* @return The EVM slot hash that the position is stored at in the contract.  */
function concPosSlot(owner, base, quote, lowerTick, upperTick, poolType) {
    const encoder = new ethers_1.ethers.utils.AbiCoder();
    const poolHash = ethers_1.ethers.utils.keccak256(encoder.encode(["address", "address", "uint256"], [base, quote, poolType]));
    const posKey = ethers_1.ethers.utils.solidityKeccak256(["address", "bytes32", "int24", "int24"], [owner, poolHash, lowerTick, upperTick]);
    return ethers_1.ethers.utils.solidityKeccak256(["bytes32", "uint256"], [posKey, CONC_POS_SLOT]);
}
exports.concPosSlot = concPosSlot;
// Based on the slots of the current contract layout
const AMBIENT_POS_SLOT = 65550;
const CONC_POS_SLOT = 65549;
//# sourceMappingURL=slots.js.map