<!-- Cette check-list s'affiche automatiquement dans chaque nouvelle Pull Request. -->

## Ce que fait cette PR
<!-- Résumé en 1-3 lignes. Lien vers la spec/tâche/ADR concernés. -->

## Module(s) touché(s)
<!-- Idéalement un seul. Si plusieurs, justifier. -->

## Check-list (à cocher avant de demander le merge)
- [ ] CI verte
- [ ] Tests **niveau (a) unitaire** verts
- [ ] Tests **niveau (b) général / intégration** verts
- [ ] **Sécurité** : `/security-review` passé (+ scripts `security/` si surface exposée)
- [ ] Un seul module touché (sinon justifié ci-dessus)
- [ ] Specs / ADR à jour, `CHANGELOG.md` mis à jour
- [ ] Aucun secret ni `.env` dans le diff
- [ ] Owner du module tagué comme reviewer
