#!/bin/bash -eu

AFLV=aflv

$AFLV cc main.c -o main

$AFLV fuzz -i in -o out -- ./main
