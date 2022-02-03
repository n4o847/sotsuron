#!/bin/bash -eu

export CC="aflv-cc"
export CXX="aflv-cxx"
export LD="ld"
CXXFLAGS=""
LIB_FUZZING_ENGINE="$(cd "../../../AFLplusplus" && pwd)/libAFLDriver.a"
OUT=$(cd "." && pwd)

cd jsoncpp

mkdir -p build

cd build

cmake -DCMAKE_CXX_COMPILER="$CXX" -DCMAKE_CXX_FLAGS="$CXXFLAGS" \
      -DJSONCPP_WITH_POST_BUILD_UNITTEST=OFF -DJSONCPP_WITH_TESTS=OFF \
      -DBUILD_SHARED_LIBS=OFF -G "Unix Makefiles" ..

make

$CXX $CXXFLAGS -I ../include $LIB_FUZZING_ENGINE \
    ../src/test_lib_json/fuzz.cpp -o $OUT/jsoncpp_fuzzer \
    src/lib_json/libjsoncpp.a

cp -r .aflv ../../
