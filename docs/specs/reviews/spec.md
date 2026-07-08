# Spec — Module reviews

> **QUOI et POURQUOI.** À écrire avant de coder. C'est le contrat du module.

- **Owner** : @Redac777
- **Dépendances** : ordering, service
- **Statut** : Validé (specs initiales) — **fonctionnalité Premium**

## Rôle
Permettre au **client** de noter le **chef** et le **serveur** de sa commande. Les notes sont agrégées
dans les **notes du staff** du restaurant. Fonctionnalité Premium.

## User stories
- En tant que **client**, je veux savoir qui est mon chef et mon serveur, afin de les noter après ma commande.
- En tant que **gérant**, je veux voir les notes moyennes de mon staff, afin de suivre la qualité de service.

## Fonctionnalités
- [ ] Après la livraison, proposer au client de **noter** le chef et le serveur (note + commentaire optionnel).
- [ ] Afficher au client le **nom** du chef / serveur (fournis par `kitchen` / `service`).
- [ ] Agréger les notes par membre du staff (**note moyenne**) pour le gérant.
- [ ] Activé au palier **Premium** (comme `service`).

## Règles métier
- Un client ne peut noter que le staff lié à **sa** commande (pas n'importe qui).
- Une note par commande et par membre du staff (éviter le spam).
- RLS : les notes appartiennent au `restaurant_id` ; le client anonyme n'écrit que via sa session de table.

## API publique du module (`index.ts`)
- `rateStaff(orderId, staffId, rating, comment?)`.
- `getStaffRatings(restaurantId)` (moyennes, pour le gérant).
- `getRateableStaff(orderId)` (chef + serveur de la commande).

## Données
- `staff_ratings` (id, restaurant_id, order_id, staff_id, note, commentaire, créé_le).
- Isolation RLS par `restaurant_id` + lien à la commande.

## Hors périmètre
- Le workflow cuisine/service (modules `kitchen` / `service`), la gestion des comptes staff (module `auth`).
