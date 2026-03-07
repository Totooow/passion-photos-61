#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

NAME="pp61-api"
REGION="fr-par"

# ── Get or create namespace ──
NS_ID=$(scw function namespace list region=$REGION -o json | \
  python3 -c "import sys,json; ns=[n for n in json.load(sys.stdin) if n['name']=='$NAME']; print(ns[0]['id'] if ns else '')" 2>/dev/null || echo "")

if [ -z "$NS_ID" ]; then
  echo "Creating namespace '$NAME'..."
  NS_ID=$(scw function namespace create name=$NAME region=$REGION -o json | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
  echo "Namespace created: $NS_ID"
else
  echo "Namespace found: $NS_ID"
fi

# ── Get or create function ──
FN_ID=$(scw function function list namespace-id=$NS_ID region=$REGION -o json | \
  python3 -c "import sys,json; fns=[f for f in json.load(sys.stdin) if f['name']=='$NAME']; print(fns[0]['id'] if fns else '')" 2>/dev/null || echo "")

if [ -z "$FN_ID" ]; then
  echo "Creating function '$NAME'..."
  FN_ID=$(scw function function create \
    namespace-id=$NS_ID \
    name=$NAME \
    runtime=node22 \
    handler=handler.handle \
    min-scale=0 \
    max-scale=1 \
    region=$REGION \
    -o json | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
  echo "Function created: $FN_ID"
  echo ""
  echo "⚠  Configure secrets in Scaleway console or via CLI:"
  echo "   scw function function update $FN_ID region=$REGION \\"
  echo "     secret-environment-variables.0.key=S3_BUCKET secret-environment-variables.0.value=passion-photos-61-storage \\"
  echo "     secret-environment-variables.1.key=S3_REGION secret-environment-variables.1.value=fr-par \\"
  echo "     secret-environment-variables.2.key=S3_ENDPOINT secret-environment-variables.2.value=https://s3.fr-par.scw.cloud \\"
  echo "     secret-environment-variables.3.key=S3_ACCESS_KEY secret-environment-variables.3.value=<YOUR_KEY> \\"
  echo "     secret-environment-variables.4.key=S3_SECRET_KEY secret-environment-variables.4.value=<YOUR_SECRET> \\"
  echo "     secret-environment-variables.5.key=API_KEY secret-environment-variables.5.value=<YOUR_API_KEY>"
  echo ""
else
  echo "Function found: $FN_ID"
fi

# ── Build & Package ──
echo "Installing dependencies..."
npm install

echo "Bundling..."
npx esbuild handler.js --bundle --platform=node --target=node22 --outfile=dist/handler.js --format=esm --minify --banner:js="import { createRequire } from 'module'; const require = createRequire(import.meta.url);"

echo "Packaging..."
rm -f function.zip
zip -j function.zip dist/handler.js

# ── Upload zip via presigned URL ──
ZIP_SIZE=$(stat -f%z function.zip 2>/dev/null || stat -c%s function.zip)
echo "Uploading code (${ZIP_SIZE} bytes)..."
UPLOAD_URL=$(scw function function get-upload-url $FN_ID content-length=$ZIP_SIZE region=$REGION -o json | \
  python3 -c "import sys,json; print(json.load(sys.stdin)['url'])")
curl -s -X PUT "$UPLOAD_URL" \
  -H "Content-Type: application/octet-stream" \
  --data-binary @function.zip

# ── Deploy ──
echo "Deploying..."
scw function function deploy $FN_ID region=$REGION

echo "Done."
