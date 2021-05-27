import {
    Block,
    DataPayload,
    Hash,
    hashFull,
    hashMulti,
    makeUTXOKey,
    PublicKey, KeyPair, Scalar, Pair, Schnorr,
    Signature,
    SodiumHelper,
    Transaction,
    TxInput,
    TxOutput,
} from 'boa-sdk-ts';

describe('Test', () => {

    it('TTT2', () => {
        const buf1 = Buffer.allocUnsafe(26);

        for (let i = 0; i < 26; i++) {
            // 97 is the decimal ASCII value for 'a'.
            buf1[i] = i;
        }

        console.log(JSON.stringify(buf1.toJSON().data));

        let a2 = Array<number>();
        a2.push(...buf1)

        let lock = {type: 0, bytes: a2};
        console.log(JSON.stringify(lock));


        let bytes = new Array<number>();
        buf1.every(value => bytes.push(value));
        let lock2 = {type: 0, bytes: bytes};
        console.log(JSON.stringify(lock2));

        let base64 = buf1.toString("base64");
        console.log(base64);

        let buf2 = Buffer.from(base64, "base64");
        console.log(JSON.stringify(buf2));
    });

    it('TTT3', () => {
        let sample = {
                "header": {
                    "prev_block": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                    "height": "0",
                    "merkle_root": "0xb12632add7615e2c4203f5ec5747c26e4fc7f333f95333ddfa4121a66b84499d35e5ce022ab667791549654b97a26e86054b0764ec23ee0cd3830de8f3f73364",
                    "validators": "[0]",
                    "signature": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                    "enrollments": [
                        {
                            "utxo_key": "0xbf150033f0c3123f0b851c3a97b6cf5335b2bc2f4e9f0c2f3d44b863b10c261614d79f72c2ec0b1180c9135893c3575d4a1e1951a0ba24a1a25bfe8737db0aef",
                            "random_seed": "0x0a8201f9f5096e1ce8e8de4147694940a57a188b78293a55144fc8777a774f2349b3a910fb1fb208514fb16deaf49eb05882cdb6796a81f913c6daac3eb74328",
                            "cycle_length": 20,
                            "enroll_sig": "0x0cab27862571d2d2e33d6480e1eab4c82195a508b72672d609610d01f23b0beedc8b89135fe3f5df9e2815b9bdb763c41b8b2dab5911e313acc82470c2147422"
                        },
                        {
                            "utxo_key": "0xc0abcbff07879bfdb1495b8fdb9a9e5d2b07a689c7b9b3c583459082259be35687c125a1ddd6bd28b4fe8533ff794d3dba466b5f91117bbf557c3f1b6ff50e5f",
                            "random_seed": "0xd0348a88f9b7456228e4df5689a57438766f4774d760776ec450605c82348c461db84587c2c9b01c67c8ed17f297ee4008424ad3e0e5039179719d7e9df297c1",
                            "cycle_length": 20,
                            "enroll_sig": "0x0ed498b867c33d316b468d817ba8238aec68541abd912cecc499f8e780a8cdaf2692d0b8b04133a34716169a4b1d33d77c3e585357d8a2a2c48a772275255c01"
                        },
                        {
                            "utxo_key": "0x1a1ae2be7afbe367e8e588474d93806b66b773c741b184dc5b4c59640e998644d2ebb0b866ac25dc053b06fd815a86d11c718f77c9e4d0fce1bdbb58486ee751",
                            "random_seed": "0xaf43c67d9dd0f53de3eaede63cdcda8643422d62205df0b5af65706ec28b372adb785ce681d559d7a7137a4494ccbab4658ce11ec75a8ec84be5b73590bffceb",
                            "cycle_length": 20,
                            "enroll_sig": "0x09474f489579c930dbac46f638f3202ac24407f1fa419c1d95be38ab474da29d7e3d4753b6b4ccdb35c2864be4195e83b7b8433ca1d27a57fb9f48a631001304"
                        },
                        {
                            "utxo_key": "0xd827d6a201a4e7630dee1f19ed3670b6012610457c8c729a2077b4fcafcfcc7a48a640aac29ae79e25f80ca1cbf535b779eebb7609304041ec1f13ec21dcbc8d",
                            "random_seed": "0xa24b7e6843220d3454523ceb7f9b43f037e56a01d2bee82958b080dc6350ebac2da12b561cbd96c6fb3f5ae5a3c8df0ac2c559ae1c45b11d42fdf866558112bc",
                            "cycle_length": 20,
                            "enroll_sig": "0x0e4566eca30feb9ad47a65e7ff7e7ce1a7555ccedcf61e1143c2e5fddbec6866fd787c4518b78ab9ed73a3760741d557ac2aca631fc2796be86fcf391d3a6634"
                        },
                        {
                            "utxo_key": "0x4fab6478e5283258dd749edcb303e48f4192f199d742e14b348711f4bbb116b197e63429c6fa608621681e625baf1b045a07ecf12f2e0b04c38bee449f5eacff",
                            "random_seed": "0xa0502960ddbe816729f60aeaa480c7924fb020d864deec6a9db778b8e56dd2ff8e987be748ff6ca0a43597ecb575da5d532696e376dc70bb4567b5b1fa512cb4",
                            "cycle_length": 20,
                            "enroll_sig": "0x052ee1d975c49f19fd26b077740dcac399f174f40b5df1aba5f09ebea11faacfd79a36ace4d3097869dc009b8939fc83bdf940c8822c6931d5c09326aa746b31"
                        },
                        {
                            "utxo_key": "0x25f5484830881b7e7d1247f8d607ead059344ade42abb56c68e63a4870303e165cbfd08078cca8e6be193848bc520c9538df4fadb8f551ea8db58792a17b8cf1",
                            "random_seed": "0xdd1b9c62d4c62246ea124e5422d5a2e23d3ca9accb0eba0e46cd46708a4e7b417f46df34dc2e3cba9a57b1dc35a66dfc2d5ef239ebeaaa00299232bc7e3b7bfa",
                            "cycle_length": 20,
                            "enroll_sig": "0x0e0070e5951ef5be897cb593c4c57ce28b7529463f7e5644b1314ab7cc69fd625c71e74382a24b7e644d32b0306fe3cf14ecd7de5635c70aa592f4721aa74fe2"
                        }
                    ],
                    "random_seed": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                    "missing_validators": [],
                    "timestamp": 1596153600
                },
                "txs": [
                    {
                        "type": 1,
                        "inputs": [],
                        "outputs": [
                            {
                                "value": "20000000000000",
                                "lock": {
                                    "type": 0,
                                    "bytes": [
                                        218,
                                        225,
                                        147,
                                        72,
                                        100,
                                        198,
                                        127,
                                        203,
                                        39,
                                        189,
                                        135,
                                        45,
                                        112,
                                        153,
                                        19,
                                        48,
                                        34,
                                        37,
                                        145,
                                        205,
                                        131,
                                        185,
                                        112,
                                        235,
                                        138,
                                        40,
                                        255,
                                        81,
                                        166,
                                        85,
                                        106,
                                        85
                                    ]
                                }
                            },
                            {
                                "value": "20000000000000",
                                "lock": {
                                    "type": 0,
                                    "bytes": [
                                        218,
                                        225,
                                        147,
                                        100,
                                        180,
                                        20,
                                        93,
                                        238,
                                        111,
                                        86,
                                        250,
                                        48,
                                        67,
                                        106,
                                        184,
                                        49,
                                        39,
                                        79,
                                        132,
                                        224,
                                        4,
                                        55,
                                        85,
                                        44,
                                        30,
                                        96,
                                        58,
                                        169,
                                        254,
                                        242,
                                        24,
                                        146
                                    ]
                                }
                            },
                            {
                                "value": "20000000000000",
                                "lock": {
                                    "type": 0,
                                    "bytes": [
                                        218,
                                        225,
                                        147,
                                        138,
                                        153,
                                        63,
                                        88,
                                        80,
                                        245,
                                        10,
                                        238,
                                        131,
                                        15,
                                        245,
                                        33,
                                        113,
                                        223,
                                        223,
                                        151,
                                        175,
                                        121,
                                        247,
                                        255,
                                        67,
                                        223,
                                        228,
                                        51,
                                        126,
                                        132,
                                        119,
                                        217,
                                        103
                                    ]
                                }
                            },
                            {
                                "value": "20000000000000",
                                "lock": {
                                    "type": 0,
                                    "bytes": [
                                        218,
                                        225,
                                        147,
                                        179,
                                        252,
                                        236,
                                        157,
                                        75,
                                        148,
                                        132,
                                        166,
                                        207,
                                        168,
                                        103,
                                        166,
                                        143,
                                        3,
                                        137,
                                        52,
                                        185,
                                        112,
                                        183,
                                        228,
                                        99,
                                        193,
                                        174,
                                        128,
                                        208,
                                        7,
                                        221,
                                        54,
                                        244
                                    ]
                                }
                            },
                            {
                                "value": "20000000000000",
                                "lock": {
                                    "type": 0,
                                    "bytes": [
                                        218,
                                        225,
                                        147,
                                        217,
                                        189,
                                        180,
                                        214,
                                        185,
                                        208,
                                        65,
                                        155,
                                        174,
                                        48,
                                        36,
                                        204,
                                        93,
                                        221,
                                        107,
                                        203,
                                        147,
                                        14,
                                        104,
                                        3,
                                        108,
                                        160,
                                        25,
                                        136,
                                        74,
                                        105,
                                        172,
                                        127,
                                        121
                                    ]
                                }
                            },
                            {
                                "value": "20000000000000",
                                "lock": {
                                    "type": 0,
                                    "bytes": [
                                        218,
                                        225,
                                        147,
                                        233,
                                        233,
                                        40,
                                        175,
                                        207,
                                        199,
                                        89,
                                        29,
                                        162,
                                        142,
                                        129,
                                        182,
                                        73,
                                        122,
                                        220,
                                        233,
                                        119,
                                        197,
                                        192,
                                        23,
                                        181,
                                        200,
                                        21,
                                        146,
                                        52,
                                        208,
                                        229,
                                        163,
                                        180
                                    ]
                                }
                            }
                        ],
                        "payload": {"bytes": ""},
                        "lock_height": "0"
                    },
                    {
                        "type": 0,
                        "inputs": [],
                        "outputs": [
                            {
                                "value": "610000000000000",
                                "lock": {
                                    "type": 0,
                                    "bytes": [
                                        157,
                                        2,
                                        56,
                                        224,
                                        161,
                                        113,
                                        64,
                                        11,
                                        198,
                                        214,
                                        138,
                                        157,
                                        155,
                                        49,
                                        106,
                                        205,
                                        81,
                                        9,
                                        100,
                                        145,
                                        19,
                                        160,
                                        92,
                                        40,
                                        79,
                                        66,
                                        150,
                                        210,
                                        179,
                                        1,
                                        34,
                                        245
                                    ]
                                }
                            },
                            {
                                "value": "610000000000000",
                                "lock": {
                                    "type": 0,
                                    "bytes": [
                                        157,
                                        2,
                                        56,
                                        224,
                                        161,
                                        113,
                                        64,
                                        11,
                                        198,
                                        214,
                                        138,
                                        157,
                                        155,
                                        49,
                                        106,
                                        205,
                                        81,
                                        9,
                                        100,
                                        145,
                                        19,
                                        160,
                                        92,
                                        40,
                                        79,
                                        66,
                                        150,
                                        210,
                                        179,
                                        1,
                                        34,
                                        245
                                    ]
                                }
                            },
                            {
                                "value": "610000000000000",
                                "lock": {
                                    "type": 0,
                                    "bytes": [
                                        157,
                                        2,
                                        56,
                                        224,
                                        161,
                                        113,
                                        64,
                                        11,
                                        198,
                                        214,
                                        138,
                                        157,
                                        155,
                                        49,
                                        106,
                                        205,
                                        81,
                                        9,
                                        100,
                                        145,
                                        19,
                                        160,
                                        92,
                                        40,
                                        79,
                                        66,
                                        150,
                                        210,
                                        179,
                                        1,
                                        34,
                                        245
                                    ]
                                }
                            },
                            {
                                "value": "610000000000000",
                                "lock": {
                                    "type": 0,
                                    "bytes": [
                                        157,
                                        2,
                                        56,
                                        224,
                                        161,
                                        113,
                                        64,
                                        11,
                                        198,
                                        214,
                                        138,
                                        157,
                                        155,
                                        49,
                                        106,
                                        205,
                                        81,
                                        9,
                                        100,
                                        145,
                                        19,
                                        160,
                                        92,
                                        40,
                                        79,
                                        66,
                                        150,
                                        210,
                                        179,
                                        1,
                                        34,
                                        245
                                    ]
                                }
                            },
                            {
                                "value": "610000000000000",
                                "lock": {
                                    "type": 0,
                                    "bytes": [
                                        157,
                                        2,
                                        56,
                                        224,
                                        161,
                                        113,
                                        64,
                                        11,
                                        198,
                                        214,
                                        138,
                                        157,
                                        155,
                                        49,
                                        106,
                                        205,
                                        81,
                                        9,
                                        100,
                                        145,
                                        19,
                                        160,
                                        92,
                                        40,
                                        79,
                                        66,
                                        150,
                                        210,
                                        179,
                                        1,
                                        34,
                                        245
                                    ]
                                }
                            },
                            {
                                "value": "610000000000000",
                                "lock": {
                                    "type": 0,
                                    "bytes": [
                                        157,
                                        2,
                                        56,
                                        224,
                                        161,
                                        113,
                                        64,
                                        11,
                                        198,
                                        214,
                                        138,
                                        157,
                                        155,
                                        49,
                                        106,
                                        205,
                                        81,
                                        9,
                                        100,
                                        145,
                                        19,
                                        160,
                                        92,
                                        40,
                                        79,
                                        66,
                                        150,
                                        210,
                                        179,
                                        1,
                                        34,
                                        245
                                    ]
                                }
                            },
                            {
                                "value": "610000000000000",
                                "lock": {
                                    "type": 0,
                                    "bytes": [
                                        157,
                                        2,
                                        56,
                                        224,
                                        161,
                                        113,
                                        64,
                                        11,
                                        198,
                                        214,
                                        138,
                                        157,
                                        155,
                                        49,
                                        106,
                                        205,
                                        81,
                                        9,
                                        100,
                                        145,
                                        19,
                                        160,
                                        92,
                                        40,
                                        79,
                                        66,
                                        150,
                                        210,
                                        179,
                                        1,
                                        34,
                                        245
                                    ]
                                }
                            },
                            {
                                "value": "610000000000000",
                                "lock": {
                                    "type": 0,
                                    "bytes": [
                                        157,
                                        2,
                                        56,
                                        224,
                                        161,
                                        113,
                                        64,
                                        11,
                                        198,
                                        214,
                                        138,
                                        157,
                                        155,
                                        49,
                                        106,
                                        205,
                                        81,
                                        9,
                                        100,
                                        145,
                                        19,
                                        160,
                                        92,
                                        40,
                                        79,
                                        66,
                                        150,
                                        210,
                                        179,
                                        1,
                                        34,
                                        245
                                    ]
                                }
                            }
                        ],
                        "payload": {"bytes": ""},
                        "lock_height": "0"
                    }
                ],
                "merkle_tree": [
                    "0x5208f03b3b95e90b3bff5e0daa1d657738839624d6605845d6e2ef3cf73d0d0ef5aff7d58bde1e00e1ccd5a502b26f569021324a4b902b7e66594e94f05e074c",
                    "0xb3aaf405f53560a6f6d5dd9dd83d7b031da480c0640a2897f2e2562c4670dfe84552d84daf5b1b7c63ce249d06bf54747cc5fdc98178a932fff99ab1372e873b",
                    "0xb12632add7615e2c4203f5ec5747c26e4fc7f333f95333ddfa4121a66b84499d35e5ce022ab667791549654b97a26e86054b0764ec23ee0cd3830de8f3f73364"
                ]
            }
        ;

        console.log(JSON.stringify(sample));
    });
});
