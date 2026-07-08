# /add-collab — ajouter un collaborateur au projet (côté OWNER)

> Pour **l'owner** uniquement. C'est le geste qui **donne** l'accès et affecte des modules. Son pendant
> côté collaborateur est `/onboard`, qui ne fait que **constater** cet accès (il ne l'accorde jamais).
>
> Trois choses se passent ici : (1) CODEOWNERS est mis à jour **par PR** (c'est un fichier de loi) ;
> (2) la personne est ajoutée comme **collaborateur GitHub** (droits Write) ; (3) les **approbations
> requises** passent de 0 à 1 (la revue croisée devient possible avec un 2e vrai compte).
>
> **Sert aussi à AJUSTER** un collaborateur déjà présent : relance `/add-collab` sur son handle pour
> lui réaffecter des modules (édition CODEOWNERS par PR). Inutile d'avoir une commande séparée pour ça.
> Pour **retirer** quelqu'un, utilise `/remove-collab` (il garantit qu'aucun module ne reste orphelin).

Quand je lance `/add-collab`, déroule ces étapes en français, tutoiement, sans em dashes.

## 1. Recueillir les infos
- **Handle GitHub réel** du collaborateur (ex. `@amine-dev`). Le script vérifiera qu'il existe vraiment.
- **Modules à lui affecter** : montre la carte des modules (lis `.github/CODEOWNERS` + `docs/ARCHITECTURE.md`),
  puis propose une répartition et laisse l'owner choisir (ex. « il prend `menu` et `tables` »).
- **Nombre d'approbations** après ajout : *reco 1* (dès qu'il y a 2 vrais comptes, la revue croisée a du sens).

## 2. Mettre à jour CODEOWNERS (par PR, jamais en direct)
CODEOWNERS est une loi partagée : la modif passe par une PR.
1. `./scripts/new-task.sh chore add-collab-<handle>` (ou crée une branche `chore/<owner>/add-collab-<handle>`).
2. Édite `.github/CODEOWNERS` : ajoute `@<handle>` sur les lignes des modules choisis (garde l'owner en
   co-propriétaire si tu veux conserver un œil dessus). **Valide** le fichier (via `codeowners/errors`
   ou `gh`) : zéro `unknown owner`.
3. Commit (`chore: ajoute @<handle> sur <modules>`), pousse, **ouvre la PR**. Comme les approbations sont
   encore à 0 à cet instant, l'owner peut la merger seul (**après confirmation**). Merge d'abord cette
   PR CODEOWNERS **avant** de remonter les approbations à l'étape 4 (sinon tu te bloquerais dessus).

## 3. Donner l'accès GitHub + remonter les approbations
Une fois la PR CODEOWNERS mergée sur `dev_branch` (et remontée sur `main` au besoin) :

```
node scripts/add-collab.mjs <handle> 1
```

Le script (avec **ton** token d'owner) : vérifie que `@<handle>` existe, l'**ajoute comme collaborateur
Write**, puis met les **approbations requises à 1** sur `main` et `dev_branch`. Lis le JSON de sortie et
annonce les `steps` faits et les `warnings` éventuels (ex. branche non protégée → lance d'abord le
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
