#!/bin/bash -eu

FUZZ="aflv fuzz"
INPUT="../../../AFLplusplus/testcases/others/xml"

$FUZZ -i $INPUT -o out -- ./xml
