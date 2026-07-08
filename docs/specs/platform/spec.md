# Spec — Module platform

> **QUOI et POURQUOI.** À écrire avant de coder. C'est le contrat du module.

- **Owner** : @Redac777
- **Dépendances** : restaurant
- **Statut** : Validé (specs initiales)

## Rôle
Le **super-admin** (côté plateforme, toi) : gérer l'ensemble des restaurants et l'état de leur licence.
C'est la vue de pilotage du SaaS, distincte des espaces restaurants.

## User stories
- En tant que **super-admin**, je veux voir tous les restaurants inscrits et l'état de leur licence, afin de piloter la plateforme.
- En tant que **super-admin**, je veux suspendre / réactiver un restaurant, afin de gérer les impayés ou les abus.
- En tant que **super-admin**, je veux voir le palier (Starter/Pro/Premium) de chaque restaurant, afin de savoir quelles fonctionnalités il a.

## Fonctionnalités
- [ ] Dashboard plateforme : liste des restaurants (nom, statut licence, palier, date d'inscription).
- [ ] Suspendre / réactiver un restaurant.
- [ ] Voir/affecter le **palier de licence** (Starter / Pro / Premium) — le paiement réel est géré par `billing`.
- [ ] Indicateurs simples (nb de restos actifs, en essai, suspendus).

## Règles métier
- Accès **réservé au super-admin** de la plateforme (rôle distinct du gérant restaurant).
- Le palier détermine les modules activés (ex. `service` + `reviews` = Premium).
- La suspension coupe l'accès du restaurant (staff) sans supprimer ses données.

## API publique du module (`index.ts`)
- `listRestaurants()` / `getRestaurantAdminView(id)`.
- `setRestaurantStatus(id, status)` / `setRestaurantPlan(id, plan)`.
- `getPlatformStats()`.

## Données
- Lit `restaurants` (statut, palier) en vue super-admin (au-dessus de la RLS par restaurant : accès plateforme contrôlé côté serveur).

## Hors périmètre
- Le paiement / l'encaissement (module `billing`), la config interne d'un restaurant (module `restaurant`).
