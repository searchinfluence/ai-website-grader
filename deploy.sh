#!/bin/bash
#
# AI Website Grader — pre-deploy gate
#
# Vercel autodeploys on merge to main via the GitHub integration.
# This script is the gate that must pass before you open or merge a PR.
# It does NOT commit, push, or deploy. Use a feature branch and PR for that.
#
# Sequence (fails fast on any error):
#   1. Tests              (vitest run)
#   2. Lint               (next lint)
#   3. Type check         (tsc --noEmit)
#   4. Production build   (next build)

set -euo pipefail

echo "AI Website Grader — pre-deploy gate"
echo "==================================="

echo ""
echo "1/4  Running tests with coverage..."
npm run test:coverage

echo ""
echo "2/4  Linting..."
npm run lint

echo ""
echo "3/4  Type checking..."
npm run type-check

echo ""
echo "4/4  Building..."
npm run build

echo ""
echo "All gates passed."
echo "Next: push your feature branch and open a PR against main."
echo "Vercel will deploy automatically once the PR is merged."
