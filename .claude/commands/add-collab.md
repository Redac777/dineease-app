# /add-collab — ajouter un collaborateur au projet (côté OWNER)

> Pour **l'owner** uniquement. C'est le geste qui **donne** l'accès et affecte des modules. Son pendant
> côté collaborateur est `/onboard`, qui ne fait que **constater** cet accès (il ne l'accorde jamais).
>
> Trois choses se passent ici : (1) CODEOWNERS est mis à jour **par PR** (c'est un fichier de loi), la
> personne devient **owner unique** de ses modules ; (2) elle est ajoutée comme **collaborateur GitHub**
> (droits Write) ; (3) on applique le modèle **owner-gated** : `require_code_owner_reviews = true` +
> `required_approving_review_count = 0` (voir ADR-0002). L'owner d'une zone self-merge sa zone ; toute
> intrusion d'un non-owner exige l'approbation de l'owner.
>
> **Sert aussi à AJUSTER** un collaborateur déjà présent : relance `/add-collab` sur son handle pour
> lui réaffecter des modules (édition CODEOWNERS par PR). Inutile d'avoir une commande séparée pour ça.
> Pour **retirer** quelqu'un, utilise `/remove-collab` (il garantit qu'aucun module ne reste orphelin).

Quand je lance `/add-collab`, déroule ces étapes en français, tutoiement, sans em dashes.

## 1. Recueillir les infos
- **Handle GitHub réel** du collaborateur (ex. `@amine-dev`). Le script vérifiera qu'il existe vraiment.
- **Modules à lui affecter** : montre la carte des modules (lis `.github/CODEOWNERS` + `docs/ARCHITECTURE.md`),
  puis propose une répartition et laisse l'owner choisir (ex. « il prend `menu` et `tables` »).
- **Modèle de revue** (voir ADR-0002) : **owner-gated**. Chaque module a **un seul owner** ;
  `require_code_owner_reviews = true` + `required_approving_review_count = 0`. Ne monte **pas** les
  approbations à 1+ (un owner unique se bloquerait sur sa propre PR : GitHub interdit l'auto-approbation).

## 2. Mettre à jour CODEOWNERS (par PR, jamais en direct)
CODEOWNERS est une loi partagée : la modif passe par une PR.
1. `./scripts/new-task.sh chore add-collab-<handle>` (ou crée une branche `chore/<owner>/add-collab-<handle>`).
2. Édite `.github/CODEOWNERS` : attribue `@<handle>` en **owner unique** sur les lignes des modules
   choisis (retire l'owner précédent de ces lignes ; « un module = un owner », pas de co-propriété par
   défaut, voir ADR-0002). Une co-propriété n'est légitime que si l'humain la demande explicitement.
   **Valide** le fichier (via `codeowners/errors` ou `gh`) : zéro `unknown owner`.
3. Commit (`chore: attribue @<handle> owner de <modules>`), pousse, **ouvre la PR**. Comme les
   approbations requises sont à 0, l'owner peut la merger seul (**après confirmation**). Merge cette PR
   CODEOWNERS **avant** l'étape 3.

## 3. Donner l'accès GitHub + appliquer le modèle owner-gated
Une fois la PR CODEOWNERS mergée sur `dev_branch` (et remontée sur `main` au besoin) :

```
node scripts/add-collab.mjs <handle>
```

Le script (avec **ton** token d'owner) : vérifie que `@<handle>` existe, l'**ajoute comme collaborateur
Write**, puis applique `required_approving_review_count = 0` + `require_code_owner_reviews = true` sur
`main` et `dev_branch`. Lis le JSON de sortie et annonce les `steps` faits et les `warnings` éventuels
(ex. branche non protégée → lance d'abord le
verrouillage). L'invitation Write doit être **acceptée** par le collaborateur (email/GitHub).

## 4. Expliquer la suite au collaborateur
Dis à l'owner quoi transmettre à la personne pour qu'elle démarre :
```
git clone https://github.com/<owner>/<repo>.git && cd <repo>
git checkout dev_branch
/onboard
```
`/onboard` vérifiera son identité **par son token** (son login réel doit être celui que tu viens de
déclarer dans CODEOWNERS) et lui **affichera les modules** que tu lui as affectés.

## Prérequis
- Être l'**owner**, avec un **PAT classic** (`ghp_…`, scope `repo`) dans `.env`.
- Les branches doivent déjà être **protégées** (sinon le script le signale : lance le verrouillage avant).
