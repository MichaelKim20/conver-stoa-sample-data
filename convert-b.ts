import {
    Block,
    Hash,
    hashFull,
    hashMulti,
    KeyPair,
    Lock,
    LockType,
    makeUTXOKey,
    Pair,
    PublicKey,
    Scalar,
    Schnorr,
    Signature,
    SodiumHelper,
    Transaction,
    TxInput,
    TxOutput, OutputType,
    Unlock,
    JSBI
} from 'boa-sdk-ts';

import {WK} from './WK';

import * as fs from 'fs';

import { old_key } from "./old_key";
import { new_key } from "./new_key";
import {BOASodium} from "boa-sodium-ts";

let key_map: Map<string, string> = new Map<string, string>();
for (let idx = 0; idx < old_key.length && idx < new_key.length; idx++)
    key_map.set(old_key[idx], new_key[idx]);

console.log("ts-node convert.ts Blocks Lookup");

if (process.argv.length < 4) {
    console.log("블록파일이 없습니다.");
    console.log("UTXO Lookup파일이 없습니다.");
    process.abort();
}

let old_blocks:Array<any> = JSON.parse(fs.readFileSync(process.argv[2], 'utf-8'));
let utxo_lookup:Array<any> = JSON.parse(fs.readFileSync(process.argv[3], 'utf-8'));
if (!Array.isArray(old_blocks))
{
    console.log("블록파일은 배열형태여야 합니다.");
    process.abort();
}

if (!Array.isArray(utxo_lookup))
{
    console.log("UTXO Look up 은 배열형태여야 합니다.");
    process.abort();
}

function buildMerkleTree (merkle_tree: Array<Hash>): Array<Hash> {
    let j = 0;
    for (let length = merkle_tree.length; length > 1; length = Math.floor((length + 1) / 2)) {
        for (let i = 0; i < length; i += 2) {
            let i2 = Math.min(i + 1, length - 1);
            merkle_tree.push(hashMulti(merkle_tree[j + i].data, merkle_tree[j + i2].data));
        }
        j += length;
    }
    return merkle_tree;
}

let findByUTXO = (hash: string) => {
    return utxo_lookup.find(n => (n.hash === hash))
}

(async () => {
    SodiumHelper.assign(new BOASodium());
    await SodiumHelper.init();

    let blocks: Block[] = [];
    for (let block of old_blocks) {
        for (let elem of block.header.enrollments) {
            delete elem.cycle_length;
        }
        blocks.push(Block.reviver("", block));
    }

    // Block Hash
    let block_hash = new Hash(Buffer.alloc(Hash.Width));
    for (let block of blocks) {
        block.header.prev_block = block_hash;
        block_hash = hashFull(block.header);
    }

    console.log(JSON.stringify(blocks));
})();
