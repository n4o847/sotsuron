# sotsuron

## Prerequisites

- LLVM 11+
- npm

## Build

```sh
$ pushd AFLplusplus
$ make LLVM_CONFIG=llvm-config-13
$ popd

$ pushd cli
$ npm install
$ npm run build
$ npm link
$ popd
```

## Usage

### Instrumentation

Equivalent to `afl-clang-lto`.

```sh
$ aflv cc -o main main.c
```

### Fuzzing

Equivalent to `afl-fuzz`, but you can see the progress on http://localhost:3000/.

```sh
$ aflv fuzz -i in -o out ./main
```
