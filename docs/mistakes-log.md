# Erreurs dont on a appris — DineEase

> Journal des bugs, erreurs de conception et pièges qu'on ne veut pas répéter. C'est une **mémoire
> durable d'équipe** : elle survit aux tâches et se partage.
>
> **Quand ajouter une entrée ?** Dès qu'une erreur a une cause racine non-évidente, au point que
> quelqu'un pourrait la refaire sans cette note. Commence par le symptôme, puis la cause, puis la
> règle / l'invariant qui empêche la récidive.

---

<!-- Modèle d'entrée (copie-le) :

- **<Symptôme court>.** <Ce qui s'est passé et la cause racine.> **Fix / invariant :** <la règle qui
  évite que ça revienne.> (réf : PR #.., module <nom>)

-->

- **Collaborateur ajouté en co-owner au lieu d'owner unique.** En ajoutant `@mbaghireda-001` sur
  `tables`/`ordering` via `/add-collab`, l'owner a été laissé co-propriétaire des modules confiés. Ça
  viole « un module = un owner » (constitution) : la séparation de territoire est diluée et le
  collaborateur ne peut pas self-merger sa zone (un 2e owner serait requis, deadlock possible). **Fix /
  invariant :** un module confié est attribué à **un seul owner** dans CODEOWNERS. « Garder l'owner en
  co-propriété » est une exception explicitement demandée par l'humain, **jamais** un défaut. (réf : PR
  #2 puis correction, ADR-0002, module global)

- **Protection de branche réglée sur le mauvais modèle (`approvals=1` + code-owner non exigé).**
  `add-collab.mjs` a mis `required_approving_review_count = 1` et laissé
  `require_code_owner_reviews = false`. Ce couple ne gate pas réellement sur l'owner (revue code-owner
  seulement suggérée, pas bloquante) et bloquerait un owner unique sur sa propre PR (GitHub interdit de
  s'auto-approuver, aucun autre owner). **Fix / invariant :** modèle **owner-gated** =
  `required_approving_review_count = 0` **+** `require_code_owner_reviews = true`. Le gate vient du
  code-owner, pas d'un compteur d'approbations. Monter les approbations ≥1 exige d'abord ≥2 owners
  réels par zone protégée. (réf : ADR-0002, module global)

- **Régle d'or process : relire la gouvernance AVANT d'agir.** Les deux erreurs ci-dessus viennent
  d'avoir suivi une formulation optionnelle du doc `/add-collab` (« garde l'owner en co-propriétaire si
  tu veux ») sans confronter la **constitution** (« un module = un owner »). **Fix / invariant :** avant
  toute action de gouvernance/collaboration, relire `constitution.md`, `CLAUDE.md`, `CONTRIBUTING.md`,
  `docs/ARCHITECTURE.md` et les ADR concernés ; la constitution prime sur une formulation optionnelle
  d'une commande. (réf : ADR-0002, module global)
