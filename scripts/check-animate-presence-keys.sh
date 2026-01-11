#!/bin/bash
# Check that AnimatePresence direct children have key props
# This catches a common Framer Motion mistake

set -e

echo "Checking AnimatePresence direct children for missing keys..."

# Look for the specific problematic pattern:
# <AnimatePresence> followed by {condition && ( followed by <motion. without key= on the same/next line

ISSUES=0

# Pattern 1: AnimatePresence with conditional child missing key
# Matches: <AnimatePresence>\n  {something && (\n    <motion.div\n      (no key= in next 2 lines)
while IFS= read -r match; do
  if [ -n "$match" ]; then
    echo "POTENTIAL ISSUE: $match"
    ISSUES=$((ISSUES + 1))
  fi
done < <(grep -Pzo '(?s)<AnimatePresence[^>]*>\s*\{[^}]+&&\s*\(\s*<motion\.[a-z]+\s+(?!key=)[^>]{0,100}>' \
  app/**/*.tsx components/**/*.tsx 2>/dev/null | tr '\0' '\n' || true)

if [ $ISSUES -gt 0 ]; then
  echo ""
  echo "Found $ISSUES potential issues. Review manually."
  echo "Direct children of AnimatePresence should have key props for proper exit animations."
  exit 1
else
  echo "No obvious AnimatePresence key issues found."
  echo "Note: This is a basic check. Always verify motion elements in AnimatePresence have keys."
  exit 0
fi
