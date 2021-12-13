# sotsuron

## Build

```
pushd AFLplusplus
LLVM_CONFIG=llvm-config-13 make
popd

pushd cli
npm link
popd
```
