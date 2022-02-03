#!/bin/bash -eu

FUZZ="aflv fuzz"

$FUZZ -i in -o out -- ./jsoncpp_fuzzer
