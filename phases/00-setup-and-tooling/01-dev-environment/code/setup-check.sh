#!/usr/bin/env bash
# setup-check.sh — verify this course's dependencies, report what's missing.
#
# Usage:  bash code/setup-check.sh
# Exits 0 if all required tools are present, 1 otherwise.

set -uo pipefail

# Required for this course. Missing = course won't run.
required=("git" "claude")

# Optional. Missing = a lesson that uses them won't work; the course adapts.
optional=("node" "python3" "rg")

missing_required=()
missing_optional=()

check() {
  local tool="$1"
  command -v "$tool" >/dev/null 2>&1 || return 1

  local output
  output="$("$tool" --version 2>&1 | head -1)"

  # Windows App Execution Aliases are shims that exit 0 and print a "not found"
  # message. Presence alone is not correctness -- check the output is real.
  case "$output" in
    *"was not found"*|*"Python was not found"*|*"Microsoft Store"*)
      return 1
      ;;
  esac

  [ -n "$output" ] || return 1
  printf '  ok    %-10s %s\n' "$tool" "$output"
  return 0
}

echo "Required"
for tool in "${required[@]}"; do
  if ! check "$tool"; then
    missing_required+=("$tool")
    printf '  MISS  %-10s not found on PATH\n' "$tool"
  fi
done

echo
echo "Optional"
for tool in "${optional[@]}"; do
  if ! check "$tool"; then
    missing_optional+=("$tool")
    if command -v "$tool" >/dev/null 2>&1; then
      printf '  MISS  %-10s shim only (App Execution Alias, not a real install)\n' "$tool"
    else
      printf '  MISS  %-10s not found on PATH\n' "$tool"
    fi
  fi
done

echo
echo "Repo state"
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  printf '  ok    inside a git work tree\n'
  printf '        branch: %s\n' "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
    printf '  ok    working tree clean\n'
  else
    printf '  warn  working tree has uncommitted changes\n'
  fi
else
  printf '  MISS  not a git repository\n'
  missing_required+=("git-worktree")
fi

echo
echo "Config"
for f in "CLAUDE.md" ".claude/settings.json" ".claude/settings.local.json"; do
  if [ -e "$f" ]; then
    printf '  ok    %s\n' "$f"
  else
    printf '  --    %s (absent)\n' "$f"
  fi
done

echo
if [ ${#missing_required[@]} -eq 0 ]; then
  printf 'Result: ready.\n'
  exit 0
fi

printf 'Result: NOT ready. Missing: %s\n' "${missing_required[*]}"
if [ ${#missing_optional[@]} -gt 0 ]; then
  printf 'Optional tools missing: %s (lessons using them will not run)\n' "${missing_optional[*]}"
fi
exit 1