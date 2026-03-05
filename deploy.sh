#!/usr/bin/env bash
set -euo pipefail

BUCKET="passion-photos-61-catalogue"
REGION="fr-par"
ENDPOINT="https://s3.fr-par.scw.cloud"

cd "$(dirname "$0")"

echo "Building..."
npm run build

echo "Syncing dist/ to s3://$BUCKET ..."
aws s3 sync dist/ "s3://$BUCKET" \
  --endpoint-url "$ENDPOINT" \
  --region "$REGION" \
  --delete \
  --acl public-read \
  --profile scaleway-perso

echo "Done."
