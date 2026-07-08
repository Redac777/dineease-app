# /pr-watch — boîte de review + suivi de mes PR

> Met l'agent « à l'écoute » des pull requests via GitHub. L'humain tranche **toujours** : l'agent
> n'approuve, ne refuse et ne merge **jamais** sans un OK explicite. Les scripts lisent le
> `GITHUB_TOKEN` du `.env` (le compte courant est donc celui de cet environnement).

Quand je lance `/pr-watch`, fais **un passage** :

## 1. Récupère l'état
Lance `node scripts/pr-inbox.mjs`. Il renvoie un JSON : `me` (compte courant), `toReview` (PR où je suis
reviewer requis, avec les fichiers touchés) et `mine` (mes PR ouvertes, avec `approvals`,
`changesRequested`, `mergeable_state`, `ci`).

## 2. PR à approuver (`toReview`)
Pour chaque PR :
1. Lis le diff : `node scripts/pr-diff.mjs <n>`.
2. Résume-la en 2-3 lignes (but, périmètre) + donne ton **avis** (RAS, ou points à corriger précis).
3. **Demande à l'utilisateur** : « **approuver / demander des changements / passer** ? »
   - **approuver** → `node scripts/pr-approve.mjs <n> approve "<court message>"`
   - **demander des changements** → `node scripts/pr-approve.mjs <n> request-changes "<les points>"`
   - **passer** → ne fais rien.
4. **Interdiction absolue** d'approuver ou refuser sans le choix explicite de l'utilisateur. Ton rôle
   est de préparer la décision, pas de la prendre.

## 3. Mes PR (`mine`)
Pour chaque PR :
- `mergeable_state: clean` (approuvée + CI verte) → annonce « **PR #<n> débloquée** » et **demande** :
  « **squash-merge maintenant ?** ». Sur **oui** → `node scripts/pr-merge.mjs <n>`, puis nettoie
  (repasse sur `dev_branch`, `git pull`, supprime la branche locale). Sur non → laisse.
- `changesRequested` non vide → annonce les changements demandés (récupère les commentaires si besoin)
  pour que l'utilisateur les traite.
- Sinon (`blocked` sans changement demandé) → « en attente de la revue de l'owner ».

## 4. Rien à traiter
Si `toReview` et `mine` sont vides (ou rien d'actionnable) : dis « rien à traiter » et arrête.

---

## Rester à l'écoute en continu
Le passage ci-dessus est **ponctuel**. Pour surveiller en permanence, lance :

```
/loop 5m /pr-watch
```

L'agent refera un passage toutes les 5 minutes et t'annoncera dès qu'il y a une PR à approuver ou une
de tes PR débloquée. Tu restes le décideur à chaque fois. `Ctrl-C` (ou `/loop stop`) pour arrêter.

## Prérequis
- `GITHUB_TOKEN` du compte de CET environnement dans `.env` (toi = ton compte ; l'autre poste = le sien).
- Chaque personne lance sa propre session `/pr-watch` : les deux agents se coordonnent **via GitHub**,
  jamais directement.
