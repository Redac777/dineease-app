# Spec — Module ordering

> **QUOI et POURQUOI.** À écrire avant de coder. C'est le contrat du module.

- **Owner** : @Redac777
- **Dépendances** : menu, tables
- **Statut** : Validé (specs initiales)

## Rôle
Le parcours **client** : à partir d'un QR de table, afficher le menu thémé, gérer un **panier de table
partagé** en temps réel, envoyer la commande, et suivre son statut en direct.

## User stories
- En tant que **client**, je scanne le QR de ma table et je vois le menu du restaurant (thémé), afin de commander.
- En tant que **client à plusieurs**, on partage un panier de table : chacun ajoute ses plats (avec son prénom), afin de commander ensemble.
- En tant que **client**, je vois le **temps estimé** avant de commander, et je suis le statut de ma commande en temps réel.

## Fonctionnalités
- [ ] Résoudre la table depuis le token du QR → menu du bon restaurant, thème appliqué, vue client (sans écrans de config).
- [ ] Parcourir sections/plats, voir détail plat, ajouter au **panier de table partagé** (prénom + demande spéciale, ex. « sans cornichons »).
- [ ] Panier partagé **temps réel** (Supabase Realtime) : chaque ajout visible par tous à la table.
- [ ] **Envoyer un tour** en cuisine (n'importe qui à la table peut valider) ; le panier se rouvre pour un tour suivant. Tout est rattaché au **numéro de table**, addition cumulée.
- [ ] Afficher le **temps estimé** (dérivé des `prep_minutes` des plats).
- [ ] **Suivi temps réel** du statut (Nouvelle → En préparation → À livrer → Livrée).

## Règles métier
- Pas d'**hôte de table** obligatoire : n'importe quel participant peut envoyer le tour en cours.
- Une commande appartient à une table (`table_id`) et un `restaurant_id`.
- L'estimation de temps = règle à préciser (ex. max ou somme pondérée des `prep_minutes`), à tracer en ADR.

## API publique du module (`index.ts`)
- `openTableSession(tableToken)` (menu + thème + panier).
- `addToCart(item)` / `useSharedCart()` (temps réel) / `submitRound()`.
- `useOrderStatus(orderId)` (temps réel) / `estimateTime(cart)`.

## Données
- `orders` (id, restaurant_id, table_id, statut, créé_le), `order_items` (id, order_id, dish_id, prénom, demande_spéciale, quantité).
- Isolation : lecture/écriture scopée à la table (token) et au `restaurant_id` (RLS). La cuisine lit ces commandes.

## Hors périmètre
- La vue cuisine et les transitions de statut côté staff (module `kitchen`), la livraison (module `service`), la notation (module `reviews`).
