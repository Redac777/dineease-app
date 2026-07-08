# Spec — Module kitchen

> **QUOI et POURQUOI.** À écrire avant de coder. C'est le contrat du module.

- **Owner** : @Redac777
- **Dépendances** : ordering
- **Statut** : Validé (specs initiales)

## Rôle
La **vue cuisine** : le chef voit les commandes en temps réel et fait avancer leur statut. Déclenche
l'**alerte vocale** au service quand un plat est prêt à livrer.

## User stories
- En tant que **chef**, je veux voir les nouvelles commandes en temps réel, afin de les préparer sans délai.
- En tant que **chef**, je veux faire passer une commande d'un statut à l'autre, afin de refléter l'avancement.
- En tant que **chef**, je veux qu'une **alerte vocale** prévienne le service quand une commande est à livrer, afin de fluidifier la salle.

## Fonctionnalités
- [ ] Tableau cuisine en 4 colonnes : **Nouvelles / En préparation / À livrer / Livrées** (temps réel).
- [ ] Ouvrir le **détail** d'une commande (plats, demandes spéciales, n° de table).
- [ ] Changer le statut d'une commande (transitions contrôlées).
- [ ] Passage en **« À livrer »** → déclenche une **alerte vocale** (Web Speech API) annonçant le n° de table.

## Règles métier
- Transitions autorisées : Nouvelle → En préparation → À livrer → Livrée (pas de saut arbitraire).
- Le chef ne voit que les commandes de **son** restaurant (RLS via `restaurant_id`).
- L'alerte vocale annonce le **numéro de table** (rattaché au QR scanné).
- Le passage en « Livrée » libère la table (coordonné avec `service` / `tables`).

## API publique du module (`index.ts`)
- `useKitchenBoard(restaurantId)` (commandes temps réel par statut).
- `getOrderDetail(orderId)` / `advanceOrderStatus(orderId, nextStatus)`.
- `announceReady(order)` (déclenche l'alerte vocale).

## Données
- Lit/écrit `orders.statut` (défini par `ordering`). N'accède pas à l'intérieur des autres modules (via leurs API).
- Isolation RLS par `restaurant_id`.

## Hors périmètre
- La prise de commande client (module `ordering`), la livraison par le serveur (module `service`), la notation (module `reviews`).
