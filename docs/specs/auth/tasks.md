# Tâches — Module auth

> La liste des tâches concrètes pour livrer le module. Chaque tâche = une branche/worktree. Une tâche
> n'est cochée que quand ses **3 niveaux de test** sont verts (voir `test-plan.md`).

## À faire
- [ ] Runtime Supabase : adaptateur `AuthGateway` réel + client Supabase (shared) + persistance de session
- [ ] Écrans login / signup (UI) selon `design.md`
- [ ] Création de comptes staff (chef, serveur) par le gérant
- [ ] Session client anonyme (token de table) + garde par rôle
- [ ] Tests niveau (b) intégration + niveau (c) sécurité (RLS, escalade de rôle)

## En cours
-

## Terminé
- [x] Structure du module + `index.ts` (API publique)
- [x] Validation Zod des identifiants (`validation.ts`) + normalisation email
- [x] Service `createAuth(gateway)` (signUp/signIn/signOut/getCurrentUser) avec message générique anti-énumération
- [x] Tests unitaires (niveau a) : validation + service (6 tests verts) — voir ADR-0001

<!-- Rappel : `./scripts/new-task.sh feat auth <persona>` pour démarrer une tâche isolée
     (persona = qui travaille, ex. l'owner @Redac777). -->
