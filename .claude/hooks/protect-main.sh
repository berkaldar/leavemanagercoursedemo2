#!/bin/sh
# PreToolUse hook (Bash): no agent push to main (docs/git.md, Forbidden). Blocks `git push` when the
# current branch is main, when a refspec names main, or with --all/--mirror.
# shortcut: regex on the command text, not a shell parser; aliases or scripts that push are not seen.
input=$(cat)
cmd=$(printf '%s' "$input" | sed -nE 's/.*"command"[[:space:]]*:[[:space:]]*"(([^"\\]|\\.)*)".*/\1/p' | head -n 1)

# Only the push segment(s), up to the next ; & | or escaped newline, so commit messages don't count.
push=$(printf '%s' "$cmd" | grep -Eo '(^|[;&|( ])git( +-[^ ]+( +[^ -][^ ]*)?)* +push( [^;&|\\]*)?' | sed 's/$/ /')
[ -n "$push" ] || exit 0

block() {
  echo "Blocked: $1. Agents never push to main (docs/git.md, Forbidden): push a feature/fix/chore branch and open a PR." >&2
  exit 2
}

printf '%s' "$push" | grep -Eq ' --(all|mirror) ' && block "--all/--mirror pushes main too"
printf '%s' "$push" | grep -Eq '[ :+](refs/heads/)?main ' && block "the refspec names main"

branch=$(git -C "${CLAUDE_PROJECT_DIR:-.}" symbolic-ref --short -q HEAD 2>/dev/null)
[ "$branch" = "main" ] && block "the current branch is main"
exit 0
