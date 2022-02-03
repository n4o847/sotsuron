#!/bin/bash -eu

export CC="aflv cc"
export CXX="aflv cxx"
CXXFLAGS=""
FUZZER_LIB="$(cd "../../../AFLplusplus" && pwd)/libAFLDriver.a"
SRC=$(cd . && pwd)
OUT=$(cd . && pwd)

cd re2

make -j $(nproc)

$CXX $CXXFLAGS $SRC/target.cc -I . obj/libre2.a -lpthread $FUZZER_LIB -o $OUT/fuzzer

cp -r .aflv ../
