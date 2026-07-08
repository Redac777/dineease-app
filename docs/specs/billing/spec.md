# Spec — Module billing

> **QUOI et POURQUOI.** À écrire avant de coder. C'est le contrat du module.

- **Owner** : @Redac777
- **Dépendances** : platform
- **Statut** : Brouillon — **dernier module construit**. Prestataire de paiement à choisir (voir décision ouverte).

## Rôle
Gérer les **abonnements** des restaurants : essai gratuit, paiement, paliers de licence. **Construit en
dernier**, une fois le produit démontrable.

## Décision ouverte (à trancher au moment de construire ce module)
- **Prestataire de paiement compatible Maroc.** Stripe ne supporte historiquement pas les entreprises
  marocaines pour encaisser. Faire une **recherche comparative** (disponibilité Maroc, frais, sécurité
  des virements, virements en dirhams) avant de coder : candidats **CMI**, **YouCan Pay**, **PayZone**,
  ou « merchant of record » **Paddle / Lemon Squeezy**. Tracer le choix dans un **ADR**.

## User stories
- En tant que **gérant**, je veux essayer l'app gratuitement 1 mois, afin de juger la rentabilité avant de payer.
- En tant que **gérant**, je veux choisir un abonnement (mensuel, ou annuel « 11 mois pour 12 »), afin de garder l'app.
- En tant que **super-admin**, je veux que l'état de paiement mette à jour la licence du restaurant automatiquement.

## Fonctionnalités
- [ ] **Essai gratuit 1 mois** à l'inscription.
- [ ] Abonnement **mensuel** (flexible) **ou annuel** (« 11 pour 12 », remise ~8 %).
- [ ] **3 paliers** : Starter / Pro / Premium (fonctionnalités par palier, à figer).
- [ ] Webhook du prestataire → met à jour le statut/palier de la licence (consommé par `platform`).
- [ ] Portail de facturation (changer de plan, voir les factures).

## Règles métier
- Fin d'essai sans paiement → licence suspendue (accès coupé, données conservées).
- Le palier payé détermine les modules activés (Premium = `service` + `reviews`).
- Aucune clé secrète du prestataire côté client ; tout encaissement côté serveur.

## API publique du module (`index.ts`)
- `startTrial(restaurantId)` / `subscribe(restaurantId, plan, cycle)`.
- `handlePaymentWebhook(event)` / `getBillingStatus(restaurantId)` / `openBillingPortal(restaurantId)`.

## Données
- `subscriptions` (restaurant_id, plan, cycle, statut, période, prestataire_ref). Variables d'env du prestataire à ajouter dans `.env` (et à la deps-allowlist) une fois choisi.

## Hors périmètre
- La gestion opérationnelle des restaurants (module `platform`), la config d'un restaurant (module `restaurant`).
