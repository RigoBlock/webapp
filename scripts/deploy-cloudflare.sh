#!/bin/bash
cd ../src
echo "Removing debug logs..."
find ./ -type f | xargs sed -i -E 's/^\s*console.(log|debug|info|)\((.*)\);?//gm'
cd ..
echo "Building app..."
echo "yarn build-beta"
yarn build-beta
echo "Done."