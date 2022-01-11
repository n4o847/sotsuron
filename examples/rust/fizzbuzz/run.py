#!/usr/bin/env python3

import subprocess
import os
import os.path
import logging

AFLV = "aflv"

logging.basicConfig(format="[%(levelname)s]\t%(message)s", level=logging.DEBUG)


# Setup

rustup_home = subprocess.check_output(["rustup", "show", "home"]).decode().strip()
logging.debug(f"rustup_home = {rustup_home}")

rustup_active_toolchain = (
    subprocess.check_output(["rustup", "show", "active-toolchain"]).decode().split()[0]
)
logging.debug(f"rustup_active_toolchain = {rustup_active_toolchain}")

lib_dir = os.path.join(rustup_home, "toolchains", rustup_active_toolchain, "lib")
logging.debug(f"lib_dir = {lib_dir}")

lib_std = next(entry for entry in os.listdir(lib_dir) if entry.startswith("libstd-"))
lib_std = lib_std[len("lib") : -len(".so")]
logging.debug(f"lib_std = {lib_std}")


# Compilation

logging.info("Compiling...")

subprocess.run(["mkdir", "-p", "bitcode"])

subprocess.run(
    ["rustc", "-g", "--emit=llvm-bc", "src/main.rs", "-o", "bitcode/main.bc"]
)

subprocess.run(
    [AFLV, "cc", "-L", lib_dir, "-l", lib_std, "bitcode/main.bc", "-o", "main"]
)

logging.info("Compilation finished")


# Fuzzing

logging.info("Start fuzzing")

subprocess.run(
    [AFLV, "fuzz", "-i", "in", "-o", "out", "--", "./main"],
    env={**os.environ, "LD_LIBRARY_PATH": lib_dir},
)
