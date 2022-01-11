#!/bin/bash -eu

AFLV=aflv

# Setup

RUSTUP_HOME=$(rustup show home)
echo $RUSTUP_HOME

RUSTUP_ACTIVE_TOOLCHAIN=$(rustup show active-toolchain | awk '{ print $1 }')
echo $RUSTUP_ACTIVE_TOOLCHAIN

LIB_DIR="$RUSTUP_HOME/toolchains/$RUSTUP_ACTIVE_TOOLCHAIN/lib/"
echo $LIB_DIR

LIB_STD=$(ls $LIB_DIR | grep ^libstd- | sed -e 's/^lib//' -e 's/\.so$//')
echo $LIB_STD


# Compilation

echo "Compiling..."

mkdir -p bitcode

rustc -g --emit=llvm-bc src/main.rs -o bitcode/main.bc

$AFLV cc -L $LIB_DIR -l $LIB_STD bitcode/main.bc -o main

echo "Compilation finished"


# Fuzzing

echo "Start fuzzing"

LD_LIBRARY_PATH=$LIB_DIR $AFLV fuzz -i in -o out -- ./main
