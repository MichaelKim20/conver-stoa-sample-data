import {
    Block,
    Hash,
    Signature,
    hashFull,
    hashMulti,
    makeUTXOKey,
    PublicKey,
    Lock,
    Unlock,
    SodiumHelper,
    Transaction,
    TxInput,
    TxOutput,
    JSBI,
    TxPayloadFee,
} from "boa-sdk-ts";

import { WK } from "./WK";

import * as fs from "fs";

import { old_key } from "./old_key";
import { new_key } from "./new_key";
import { BOASodium } from "boa-sodium-ts";

let key_map: Map<string, string> = new Map<string, string>();
for (let idx = 0; idx < old_key.length && idx < new_key.length; idx++) key_map.set(old_key[idx], new_key[idx]);

console.log("ts-node convert-preimages.ts Blocks Lookup Pre-images");

if (process.argv.length < 5) {
    console.log("블록파일이 없습니다.");
    console.log("UTXO Lookup파일이 없습니다.");
    console.log("Pre-images 파일이 없습니다.");
    process.abort();
}

let old_blocks: Array<any> = JSON.parse(fs.readFileSync(process.argv[2], "utf-8"));
let utxo_lookup: Array<any> = JSON.parse(fs.readFileSync(process.argv[3], "utf-8"));
let pre_images: Array<any> = JSON.parse(fs.readFileSync(process.argv[4], "utf-8"));

if (!Array.isArray(old_blocks)) {
    console.log("블록파일은 배열형태여야 합니다.");
    process.abort();
}

if (!Array.isArray(utxo_lookup)) {
    console.log("UTXO Look up 은 배열형태여야 합니다.");
    process.abort();
}

if (!Array.isArray(pre_images)) {
    console.log("pre_images 은 배열형태여야 합니다.");
    process.abort();
}

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

let findByUTXO = (hash: string) => {
    return utxo_lookup.find((n) => n.hash === hash);
};

function getFee(tx_size: number): JSBI {
    let size = JSBI.BigInt(tx_size);
    let factor = JSBI.BigInt(200);
    let minimum = JSBI.BigInt(100_000); // 0.01BOA
    let medium = JSBI.multiply(size, factor);
    if (JSBI.lessThan(medium, minimum)) medium = JSBI.BigInt(minimum);
    /*
        let disparity = Math.random() * 200_00 - 100_00;

        medium = JSBI.add(medium, JSBI.BigInt(disparity));
        if (JSBI.lessThan(medium, minimum))
            medium = JSBI.BigInt(minimum);
    */
    return medium;
}

let new_block_data: Array<any> = [];

(async () => {
    if (!SodiumHelper.isAssigned()) SodiumHelper.assign(new BOASodium());
    await SodiumHelper.init();

    // Replace Transaction
    {
        let block_idx = 0;
        for (let block of old_blocks) {
            let new_block = JSON.parse(JSON.stringify(block));
            let txs = new Array<Transaction>();
            let merkle_tree: Array<Hash> = [];
            for (let tx of block.txs) {
                let inputs = new Array<TxInput>();
                let outputs = new Array<TxOutput>();
                for (let input of tx.inputs) {
                    let utxo = new Hash(input.utxo);
                    inputs.push(new TxInput(utxo, Unlock.reviver("", input.unlock)));
                }

                for (let output of tx.outputs) {
                    let type = output.type;
                    let value = JSBI.BigInt(output.value);
                    let lock = Lock.reviver("", output.lock);
                    let o = new TxOutput(type, value, lock);
                    outputs.push(o);
                }
                let new_tx = new Transaction(inputs, outputs, tx.payload);
                txs.push(new_tx);
                merkle_tree.push(hashFull(new_tx));
            }
            buildMerkleTree(merkle_tree);
            new_block.merkle_tree = merkle_tree.map((n) => n.toString());
            new_block.txs = txs.map((n) => JSON.parse(JSON.stringify(n)));
            if (new_block.header.height == "0") {
                new_block.header.validators = "[0]";
                new_block.header.random_seed = new Hash(Buffer.alloc(Hash.Width)).toString();
            } else {
                new_block.header.validators = "[252]";
                new_block.header.random_seed = hashFull(block_idx).toString();
            }
            delete new_block.header.timestamp;
            new_block.header.time_offset = 0;
            new_block_data.push(new_block);
            block_idx++;
        }
    }

    let blocks: Array<Block>;

    // Create Block Instance
    blocks = new_block_data.map((n) => Block.reviver("", n));

    // Fix values
    //  Transaction Input
    for (let block of blocks) {
        if (JSBI.lessThan(block.header.height.value, JSBI.BigInt(1))) continue;

        for (let tx of block.txs) {
            let in_sum = JSBI.BigInt(0);
            for (let tx_input of tx.inputs) {
                let find_value = findByUTXO(tx_input.utxo.toString());
                if (find_value === undefined) {
                    console.error("Can not found");
                } else {
                    let tx2 = blocks[find_value.block_idx].txs[find_value.tx_idx];
                    let ox =
                        find_value.block_idx === 0
                            ? find_value.out_idx
                            : tx2.outputs.findIndex(
                                  (m) => find_value.address === new PublicKey(m.lock.bytes).toString()
                              );

                    if (ox == -1) console.error("Can not found utxo(address)");

                    let o = tx2.outputs[ox];
                    in_sum = JSBI.add(in_sum, o.value);
                }
            }

            if (JSBI.greaterThan(in_sum, JSBI.BigInt(0))) {
                let tx_size = Transaction.getEstimatedNumberOfBytes(
                    tx.inputs.length,
                    tx.outputs.length,
                    tx.payload.length
                );
                let tx_fee = getFee(tx_size);
                let payload_fee = TxPayloadFee.getFee(tx.payload.length);
                let total_fee = JSBI.add(tx_fee, payload_fee);
                let amount = JSBI.subtract(in_sum, total_fee);

                let a = JSBI.divide(amount, JSBI.BigInt(tx.outputs.length));
                let b = JSBI.subtract(amount, JSBI.multiply(a, JSBI.BigInt(tx.outputs.length)));

                console.log("SUM", in_sum.toString(), a.toString(), b.toString());
                for (let o_idx = 0; o_idx < tx.outputs.length; o_idx++) {
                    if (o_idx < tx.outputs.length - 1) tx.outputs[o_idx].value = a;
                    else tx.outputs[o_idx].value = JSBI.add(a, b);
                }
            }

            for (let tx_input of tx.inputs) {
                let find_value = findByUTXO(tx_input.utxo.toString());
                if (find_value === undefined) {
                    console.error("Can not found");
                } else {
                    let tx2 = blocks[find_value.block_idx].txs[find_value.tx_idx];
                    let ox =
                        find_value.block_idx === 0
                            ? find_value.out_idx
                            : tx2.outputs.findIndex(
                                  (m) => find_value.address === new PublicKey(m.lock.bytes).toString()
                              );
                    if (ox === -1) console.error("Can not found utxo(address)");
                    tx_input.utxo = makeUTXOKey(hashFull(tx2), JSBI.BigInt(ox));
                }
            }
        }
    }

    //  Pre-Image
    for (let image of pre_images) {
        let find_value = findByUTXO(image.utxo);
        if (find_value === undefined) {
            console.error("Can not found in Pre-Image");
        } else {
            let tx2 = blocks[find_value.block_idx].txs[find_value.tx_idx];
            let ox =
                find_value.block_idx === 0
                    ? find_value.out_idx
                    : tx2.outputs.findIndex((m) => find_value.address === new PublicKey(m.lock.bytes).toString());

            if (ox === -1) console.error("Can not found utxo(address)");
            image.utxo = makeUTXOKey(hashFull(tx2), JSBI.BigInt(ox));
        }
    }

    console.log(JSON.stringify(pre_images));
})();
