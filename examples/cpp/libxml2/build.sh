#!/bin/bash -eu

export CC="aflv cc"
export CXX="aflv cxx"
export LD="ld"
CXXFLAGS=""
FUZZER_LIB="../../../AFLplusplus/libAFLDriver.a"

REPO="libxml2"

pushd $REPO

CCLD="$CXX $CXXFLAGS" ./configure --without-python --with-threads=no --with-zlib=no --with-lzma=no

make -j $(nproc)

popd

$CXX $CXXFLAGS -std=c++11 ./target.cc -I $REPO/include $REPO/.libs/libxml2.a $FUZZER_LIB -o ./xml
