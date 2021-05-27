# concert-stoa-sample-data

# 설치하기

Stoa 프로젝트에서 임의 폴더를 하나 생성한다. (ex .npm)
```sh
$ mkdir .npm
$ cd .npm
$ git clone https://github.com/MichaelKim20/convert-stoa-sample-data.git
$ cd convert-stoa-sample-data
```

# 이전 블럭의 UTXO의 참조테이블 생성하기

이작업은 변경되기전의 boa-sdk-ts를 사용하여야 한다.

```sh
ts-node make-utxo-lookup ./old/sample.json
```
출력된 결과를 ./old/sample_utxo.json 에 저장한다.


```sh
ts-node make-utxo-lookup ./old/recovery.json
```
출력된 결과를 ./old/recovery_utxo.json 에 저장한다.


# 최신 버전의 boa-sdk-ts로 업그레이드하기
stoa의 하부 폴더 mpm_modules 을 삭제하고, boa-sdk-ts의 버전을 변경한 후 npm_modules을 다시 설치한다. 

# 새로운 블록데이터 생성하기

블록 구조의 변경범위에 따라서 convert-blocks.ts를 수정해야 될 경우가 있다.


```sh
ts-node convert-blocks ./old/sample.json ./old/sample_utxo.json
```
출력된 결과를 ./new/sample.json 에 저장한다.


```sh
ts-node convert-blocks ./old/recovery.json ./old/recovery_utxo.json
```
출력된 결과를 ./new/recovery.json 에 저장한다.
