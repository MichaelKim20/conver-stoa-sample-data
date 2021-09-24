import { Block, Hash, hashFull, hashMulti, makeUTXOKey, SodiumHelper, JSBI, PublicKey } from "boa-sdk-ts";

import * as fs from "fs";
import { BOASodium } from "boa-sodium-ts";

console.log("ts-node make-utxo-lookup.ts Block files");

if (process.argv.length < 3) {
    console.log("블록파일이 없습니다.");
    process.abort();
}

let blocks = JSON.parse(fs.readFileSync(process.argv[2], "utf-8"));
if (!Array.isArray(blocks)) {
    console.log("블록파일은 배열형태여야 합니다.");
    process.abort();
}

let block_idx = 0;
let block_hashs: { block_idx: number; hash: Hash; merkle_tree: Hash[] }[] = [];
let ts_hashs: { block_idx: number; tx_idx: number; hash: Hash }[] = [];
let utxo_hashs: { block_idx: number; tx_idx: number; out_idx: number; hash: Hash; address: string; amount: string }[] =
    [];

function buildMerkleTree(merkle_tree: Array<Hash>): Array<Hash> {
    let j = 0;
    for (let length = merkle_tree.length; length > 1; length = Math.floor((length + 1) / 2)) {
        for (let i = 0; i < length; i += 2) {
            let i2 = Math.min(i + 1, length - 1);
            merkle_tree.push(hashMulti(merkle_tree[j + i], merkle_tree[j + i2]));
        }
        j += length;
    }
    return merkle_tree;
}

let print = (block: Block) => {
    let tx_idx = 0;
    let merkle_tree: Array<Hash> = [];
    for (let tx of block.txs) {
        let tx_hash = hashFull(tx);
        merkle_tree.push(tx_hash);
        ts_hashs.push({
            block_idx: block_idx,
            tx_idx: tx_idx,
            hash: tx_hash,
        });
        let idx = 0;
        for (let output of tx.outputs) {
            let utxo_hash = makeUTXOKey(tx_hash, JSBI.BigInt(idx));
            let address = new PublicKey(output.lock.bytes);
            utxo_hashs.push({
                block_idx: block_idx,
                tx_idx: tx_idx,
                out_idx: idx,
                hash: utxo_hash,
                address: address.toString(),
                amount: output.value.toString(),
            });
            idx++;
        }
        tx_idx++;
    }
    buildMerkleTree(merkle_tree);
    block_hashs.push({
        block_idx: block_idx,
        hash: hashFull(block.header),
        merkle_tree: merkle_tree,
    });
    block_idx++;
};

(async () => {
    if (!SodiumHelper.isAssigned()) SodiumHelper.assign(new BOASodium());
    await SodiumHelper.init();
    for (let b of blocks) {
        let block = Block.reviver("", b);
        print(block);
    }
    //console.log(`block_hashs = ${JSON.stringify(block_hashs)}`)
    //console.log(`ts_hashs = ${JSON.stringify(ts_hashs)}`)
    console.log(`utxo_lookup = ${JSON.stringify(utxo_hashs)}`);
})();
