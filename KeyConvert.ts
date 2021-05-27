
import { old_key } from "./old_key";
import { new_key } from "./new_key";

let keys: Map<string, string> = new Map<string, string>();
for (let idx = 0; idx < old_key.length && idx < new_key.length; idx++)
    keys.set(old_key[idx], new_key[idx]);

console.log(keys);
