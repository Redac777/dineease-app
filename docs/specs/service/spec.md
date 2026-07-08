# Spec — Module service

> **QUOI et POURQUOI.** À écrire avant de coder. C'est le contrat du module.

- **Owner** : @Redac777
- **Dépendances** : kitchen
- **Statut** : Validé (specs initiales) — **fonctionnalité Premium**

## Rôle
La **vue serveur** (Premium) : le serveur voit les commandes à livrer, les marque « Livré », ce qui
**libère la table**. Fonctionnalité activée pour les restaurants au palier Premium.

## User stories
- En tant que **serveur**, je veux voir les commandes prêtes à livrer et pour quelle table, afin de les apporter.
- En tant que **serveur**, je veux marquer une commande « Livré », afin de clôturer le service de cette table.
- En tant que **client**, je veux connaître le nom de mon serveur, afin de pouvoir le noter (voir module `reviews`).

## Fonctionnalités
- [ ] Vue serveur : liste des commandes **À livrer** (temps réel), avec n° de table.
- [ ] Marquer **« Livré »** → passe la commande en livrée et **libère la table** (redevient disponible).
- [ ] Exposer le **nom du serveur** rattaché à la livraison (consommé par `reviews`).
- [ ] Comptes serveurs gérés via `auth` ; ce module n'est visible qu'au palier **Premium**.

## Règles métier
- Seul un compte **serveur** (ou gérant) accède à cette vue. RLS par `restaurant_id`.
- « Livré » n'est possible qu'après « À livrer » (cohérent avec le workflow `kitchen`).
- Libération de table = la table repasse « libre » pour une nouvelle commande.

## API publique du module (`index.ts`)
- `useServiceBoard(restaurantId)` (commandes à livrer, temps réel).
- `markDelivered(orderId, serverId)` (→ libère la table).
- `getServerOfOrder(orderId)` (pour la notation).

## Données
- Lit/écrit `orders.statut`, met à jour `tables.statut`. Enregistre le serveur ayant livré (pour `reviews`).
- Isolation RLS par `restaurant_id`.

## Hors périmètre
- Le workflow cuisine (module `kitchen`), la notation elle-même (module `reviews`), la facturation (module `billing`).
