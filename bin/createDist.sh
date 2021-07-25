# This shell script compiles, minifies and copies the necessary files 
# to the dist/ folder for publishing purposes.

rm -rf dist/
mkdir dist/

cp manifest.json dist/manifest.json
cp background.js dist/background.js

cp -r popup/ dist/popup/
cp -r options/ dist/options/

mkdir dist/images/
cp images/logo-16.png dist/images/logo-16.png
cp images/logo-32.png dist/images/logo-32.png
cp images/logo-48.png dist/images/logo-48.png
cp images/logo-128.png dist/images/logo-128.png