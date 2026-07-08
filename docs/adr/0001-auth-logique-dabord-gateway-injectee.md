# ADR 0001 — Auth : logique d'abord, gateway injectée

- **Statut** : Accepté
- **Date** : 2026-07-08
- **Auteur** : @Redac777
- **Module(s) concerné(s)** : auth (pattern réutilisable pour les autres modules)

## Contexte
On démarre le module `auth`. On veut une base testable sans réseau ni UI, et une frontière nette avec
Supabase pour ne pas coupler la logique métier au fournisseur. Contrainte repérée au pré-vol : Node 20
(< 22), les paquets `@supabase/*` réclament Node >= 22 (avertissements EBADENGINE à l'install).

## Décision
Construire d'abord la **couche logique pure** : validation Zod des identifiants + un service
`createAuth(gateway)` qui dépend d'une **interface `AuthGateway` injectée** (Supabase en prod, faux en
test). Le runtime Supabase (client réel + persistance de session) et l'UI (écrans login/signup) viennent
dans des incréments suivants.

## Alternatives envisagées
- Coder directement contre le client Supabase — écarté : logique non testable sans réseau, couplage fort.
- Attendre l'UI pour tester — écarté : on perd la testabilité unitaire et on retarde la CI verte.

## Conséquences
- Facilite : tests unitaires rapides (gateway factice), message générique anti-énumération au signIn,
  remplacement du backend sans réécrire la logique.
- Coût : l'auth n'est pas encore fonctionnelle de bout en bout (pas de runtime ni d'UI) ; ces incréments
  suivront.
- Node < 22 : prévoir un stub WebSocket dans la config de test quand on branchera Supabase realtime
  (voir mistakes-log si l'erreur se présente). Sans impact sur cet incrément (aucun runtime Supabase).
