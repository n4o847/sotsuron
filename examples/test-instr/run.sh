#!/bin/bash

AFLV=aflv

$AFLV cc test-instr.c -o test-instr

$AFLV fuzz -i in -o out -- ./test-instr
