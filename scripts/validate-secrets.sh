#!/usr/bin/env bash
set -euo pipefail

echo "🔍 Validating GitHub secrets..."
echo ""

required_secrets=(
  CONVEX_DEPLOY_KEY
  CONVEX_ADMIN_KEY
  NEXT_PUBLIC_CONVEX_URL
  PLAYWRIGHT_BASE_URL
  VERCEL_TOKEN
  VERCEL_ORG_ID
  VERCEL_PROJECT_ID
)

missing=0
for secret in "${required_secrets[@]}"; do
  if gh secret list 2>/dev/null | grep -q "^${secret}\b"; then
    echo "  ✅ ${secret} is set"
  else
    echo "  ❌ ${secret} is missing"
    ((missing++))
  fi
done

echo ""
if [ "$missing" -eq 0 ]; then
  echo "✅ All ${#required_secrets[@]} secrets are configured."
else
  echo "⚠️  ${missing} secret(s) missing. Set them with:"
  echo "   gh secret set <NAME>"
  exit 1
fi
