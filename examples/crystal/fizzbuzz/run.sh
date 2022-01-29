#!/bin/bash -eu

AFLV=aflv


# Compilation

echo "Compiling..."

mkdir -p bitcode

crystal build --emit llvm-ir src/main.cr

mv main.ll bitcode/main.ll

$AFLV cc -L/usr/lib/crystal -lpcre -lm -lgc -lpthread -levent -lrt -ldl bitcode/main.ll -o main

echo "Compilation finished"


# Fuzzing

echo "Start fuzzing"

$AFLV fuzz -i in -o out -- ./main
