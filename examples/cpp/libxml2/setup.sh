#!/bin/bash -eu

git clone https://gitlab.gnome.org/GNOME/libxml2.git

cd libxml2

git checkout -f v2.9.2

./autogen.sh
