#!/bin/bash -eu

AFLV=aflv

$AFLV cxx -O0 src/main.cc -o main

$AFLV fuzz -i in -o out -- ./main
