#!/usr/bin/env bash
# new-task.sh — cree un "bureau isole" (git worktree) pour une tache, AU NOM d'une persona.
# Une tache = une branche = un worktree = une session d'agent = une persona identifiee.
#
# Usage : ./scripts/new-task.sh <type> <scope> <persona>
#   type    : feat | fix | refactor | chore | docs | test | ci
#   scope   : le module / sujet, ex. auth
#   persona : QUI travaille (ex. reda, amine, sara). Nomme la branche ET signe les commits.
#
# Exemple : ./scripts/new-task.sh feat auth reda
#   -> branche feat/reda/auth + worktree ../<repo>-auth, commits signes "reda".
#
# Pourquoi la persona est obligatoire : avec un seul compte, rien ne devine qui travaille.
# On le declare ici, et le script attribue une identite Git PROPRE au worktree pour que
# l'historique montre correctement qui a fait quoi (voir CONTRIBUTING §personas).

set -euo pipefail

TYPE="${1:-}"
SCOPE="${2:-}"
PERSONA="${3:-}"

if [ -z "$TYPE" ] || [ -z "$SCOPE" ] || [ -z "$PERSONA" ]; then
  echo "Usage : ./scripts/new-task.sh <type> <scope> <persona>"
  echo "  ex.  ./scripts/new-task.sh feat auth reda"
  echo "  persona = qui travaille (nomme la branche et signe les commits)"
  exit 1
fi

# Normalise la persona (minuscules, sans espaces ni caracteres speciaux)
PERSONA="$(echo "$PERSONA" | tr '[:upper:] ' '[:lower:]-' | tr -cd 'a-z0-9-')"
BRANCH="${TYPE}/${PERSONA}/${SCOPE}"

REPO_ROOT="$(git rev-parse --show-toplevel)"
REPO_NAME="$(basename "$REPO_ROOT")"
WORKTREE_DIR="${REPO_ROOT}/../${REPO_NAME}-${SCOPE}"

# Base a jour : on part de dev_branch si elle existe, sinon de main
git fetch origin --quiet || true
if git rev-parse --verify --quiet origin/dev_branch >/dev/null; then
  BASE=origin/dev_branch
else
  BASE=origin/main
fi

echo "Persona : $PERSONA  |  Branche : $BRANCH  |  Base : $BASE"
git worktree add -b "$BRANCH" "$WORKTREE_DIR" "$BASE"

# Identite Git PROPRE a ce worktree -> les commits de ce bureau sont signes par la persona.
git -C "$REPO_ROOT" config extensions.worktreeConfig true
git -C "$WORKTREE_DIR" config --worktree user.name "$PERSONA"
git -C "$WORKTREE_DIR" config --worktree user.email "${PERSONA}@${REPO_NAME}.local"

# Copie le .env local (jamais commite) dans le nouveau worktree, s'il existe
if [ -f "${REPO_ROOT}/.env" ]; then
  cp "${REPO_ROOT}/.env" "${WORKTREE_DIR}/.env"
  echo "  .env copie dans le worktree"
fi

echo ""
echo "Bureau isole pret (commits signes '$PERSONA') :"
echo "  cd ${WORKTREE_DIR}"
echo "  # puis lance ta session Claude Code DANS ce dossier"
echo ""
echo "Quand la tache est finie : commit -> push -> PR. Puis :"
echo "  git worktree remove ${WORKTREE_DIR}"
