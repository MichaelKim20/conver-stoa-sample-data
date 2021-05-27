import {
    Block,
    DataPayload,
    Hash,
    hashFull,
    hashMulti,
    makeUTXOKey,
    PublicKey, KeyPair,
    Signature,
    SodiumHelper,
    Transaction,
    TxInput,
    TxOutput,
    JSBI,
    Unlock
} from 'boa-sdk-ts';

import { WK } from './WK';

import * as fs from 'fs';

import { old_key } from "./old_key";
import { new_key } from "./new_key";

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

let new_block_data: Array<any> = [];

(async () => {
    await SodiumHelper.init();

    // Replace Transaction
    {
        let block_idx = 0;
        for (let block of old_blocks) {
            let new_block = JSON.parse(JSON.stringify(block));
            let txs = new Array<Transaction>();
            let merkle_tree: Array<Hash> = [];
            for (let tx of block.txs) {
                let type = tx.type;
                let inputs = new Array<TxInput>();
                let outputs = new Array<TxOutput>();
                for (let input of tx.inputs) {
                    let utxo = new Hash(input.utxo);
                    let signature = new Signature(input.signature);
                    inputs.push(new TxInput(utxo, Unlock.fromSignature(new Signature(Buffer.alloc(Signature.Width)))));
                }

                for (let output of tx.outputs) {
                    let value = JSBI.BigInt(output.value);
                    let new_address = key_map.get(output.address);
                    let publicKey: PublicKey;
                    if (new_address !== undefined)
                    {
                        output.address = new_address;
                        publicKey = new PublicKey(new_address);
                    }
                    else
                    {
                        publicKey = new PublicKey("boa1xrdwryl0ajdd86c45w4zrjf8spmrt7u4l7s5jy64ac3dc78x2ucd7wkakac");
                        console.error("Can not found new well known key!");
                    }
                    outputs.push(new TxOutput(value, publicKey));
                }
                let payload = new DataPayload(tx.payload);
                let new_tx = new Transaction(type, inputs, outputs, payload);
                txs.push(new_tx);
                merkle_tree.push(hashFull(new_tx));
            }
            buildMerkleTree(merkle_tree);
            new_block.merkle_tree = merkle_tree.map(n => n.toString());
            new_block.txs = txs.map(n => JSON.parse(JSON.stringify(n)));
            if (new_block.header.height == "0") {
                new_block.header.validators = "[0]";
                new_block.header.random_seed = (new Hash(Buffer.alloc(Hash.Width))).toString();
            }
            else {
                new_block.header.validators = "[252]";
                new_block.header.random_seed = hashFull(block_idx).toString();
            }
            new_block_data.push(new_block);
            block_idx++;

            //console.log(JSON.stringify(block));
        }
    }

    let blocks: Array<Block>;
    // Create Block Instance
    blocks = new_block_data.map(n => Block.reviver("", n));

    // Fix values
    //  Transaction Input
    for (let block of blocks) {
        if (JSBI.lessThan(block.header.height.value, JSBI.BigInt(1)))
            continue;

        for (let tx of block.txs) {
            for (let tx_input of tx.inputs) {
                let find_value = findByUTXO(tx_input.utxo.toString());
                if (find_value === undefined) {
                    console.error("Can not found UTXO!");
                }
                else {
                    let tx2 = blocks[find_value.block_idx].txs[find_value.tx_idx];
                    tx_input.utxo = makeUTXOKey(hashFull(tx2), JSBI.BigInt(find_value.out_idx));

                    let address = new PublicKey(tx2.outputs[find_value.out_idx].lock.bytes);
                    let keypair = WK.keys(address.toString());
                    tx_input.unlock = Unlock.fromSignature(keypair.secret.sign<Transaction>(tx));
                }
            }
        }
    }

    //  Enrollment
    for (let block of blocks) {
        for (let en of block.header.enrollments) {

            let find_value = findByUTXO(en.utxo_key.toString());
            if (find_value === undefined) {
                console.error("Can not found in Enrollment");
            }
            else {
                let tx2 = blocks[find_value.block_idx].txs[find_value.tx_idx];
                en.utxo_key = makeUTXOKey(hashFull(tx2), JSBI.BigInt(find_value.out_idx));
            }
        }
    }

    // Merkle Tree
    for (let block of blocks) {
        let merkle_tree: Array<Hash> = [];
        for (let tx of block.txs) {
            merkle_tree.push(hashFull(tx));
        }
        buildMerkleTree(merkle_tree);
        block.merkle_tree = merkle_tree;
        block.header.merkle_root = merkle_tree[merkle_tree.length - 1];
    }

    // Block Hash
    let block_hash = new Hash(Buffer.alloc(Hash.Width));
    for (let block of blocks) {
        block.header.prev_block = block_hash;
        block_hash = hashFull(block.header);
    }

    let block_objs = JSON.parse(JSON.stringify(blocks));
    for (let block of block_objs) {
        block.header.validators = JSON.stringify(block.header.validators.storage);
    }
    console.log(JSON.stringify(block_objs));
})();
