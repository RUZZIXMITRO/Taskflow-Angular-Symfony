# TaskFlow — projet final Angular (G2IG5 · 2026/2027)

Application de gestion de tâches : **Angular 22** (front) + **API REST Symfony 7.4** (back).

## Fonctionnalités

| Fonctionnel | Technique | Qualité |
|---|---|---|
| CRUD des tâches (créer, consulter, modifier, supprimer) | Composants standalone, Router (lazy loading, `:id`) | États loading / error + bouton « Réessayer » |
| Recherche par titre, filtre priorité, filtre terminée / non terminée | Signals, `computed()`, `[(ngModel)]` | Accessibilité (labels, `aria-live`, focus visible, lien d’évitement) |
| Priorité (low / medium / high), date limite, description | Services + `inject()`, Reactive Forms + validation | Tests Vitest (service HTTP, formulaire, filtre, guard) |
| Page Admin protégée (guard + vérification Symfony 401/403) | HttpClient + intercepteur `Authorization: Bearer` | Build de production, fallback SPA nginx |

Notions du cours mises en œuvre : interpolation / property & event binding (titre « Renommer »),
`@if` / `@for` / `@empty`, pipes (`date:'dd/MM/yyyy'`, `uppercase`), interface `Task` avec union
littérale, `input()` / `output()` (`TaskCard`), `ng-content` (composant `Modal`), RxJS (`pipe`,
`finalize`, `interval` + `takeUntilDestroyed`, rafraîchissement toutes les 30 s), `ngOnInit`.

## Structure

```
taskflow/
├── frontend/                 Angular 22
│   ├── proxy.conf.json       /api → http://127.0.0.1:8000 pendant ng serve
│   └── src/app/
│       ├── models/           task.model.ts
│       ├── services/         task.service.ts (HTTP), auth.service.ts
│       ├── core/             auth.guard.ts, auth.interceptor.ts
│       ├── components/       header, task-card, task-form, modal
│       └── pages/            task-list, task-detail, task-editor, login, admin, not-found
├── backend/                  Symfony 7.4 (SQLite)
│   └── src/
│       ├── Controller/       TaskController, AuthController, AdminController
│       ├── Entity/Task.php   + contraintes de validation
│       ├── Security/         TokenService (jeton HMAC), ApiTokenHandler
│       └── Command/          app:seed (données de démo)
└── deploy/nginx.conf         déploiement statique + fallback SPA
```

## Lancer le projet

Prérequis : Node.js ≥ 22, PHP ≥ 8.2 (extensions `pdo_sqlite`, `ctype`, `iconv`), Composer.

**1. API Symfony** (terminal 1)

```bash
cd backend
composer install
composer db:init        # crée la base SQLite + 5 tâches de démo
composer serve          # http://127.0.0.1:8000  (ou : symfony serve)
```

**2. Front Angular** (terminal 2)

```bash
cd frontend
npm install
npm start               # ng serve → http://localhost:4200
```

Comptes de démonstration : `admin / admin123` (ROLE_ADMIN) · `user / user123` (ROLE_USER).

## Contrat d’API

| Méthode | URL | Rôle | Réponse |
|---|---|---|---|
| GET | `/api/tasks` | Lister les tâches | 200 + `Task[]` |
| GET | `/api/tasks/{id}` | Détail d’une tâche | 200 `Task` · 404 |
| POST | `/api/tasks` | Créer une tâche | 201 `Task` · 422 |
| PATCH | `/api/tasks/{id}` | Modifier (ex. `completed`) | 200 `Task` · 404 · 422 |
| DELETE | `/api/tasks/{id}` | Supprimer | 204 · 404 |
| POST | `/api/login` | Connexion `{username, password}` | 200 `{token, user}` · 401 |
| GET | `/api/admin/stats` | Statistiques (admin) | 200 · **401** sans jeton · **403** sans ROLE_ADMIN |

Format d’une tâche :

```json
{ "id": 1, "title": "Lire le cours", "description": null, "completed": false, "priority": "high", "dueDate": "2026-11-15" }
```

Erreur de validation (422) : `{ "errors": { "title": "Le titre doit contenir au moins 3 caractères." } }`

### Vérifier que Symfony refuse les requêtes non autorisées

```bash
curl -i http://127.0.0.1:8000/api/admin/stats                       # → 401
TOKEN=$(curl -s -X POST http://127.0.0.1:8000/api/login -H 'Content-Type: application/json' \
  -d '{"username":"user","password":"user123"}' | php -r 'echo json_decode(stream_get_contents(STDIN))->token;')
curl -i -H "Authorization: Bearer $TOKEN" http://127.0.0.1:8000/api/admin/stats   # → 403
```

Le guard Angular n’est qu’un confort de navigation : la décision finale est prise par Symfony
(`access_control` + `#[IsGranted('ROLE_ADMIN')]`) sur chaque requête.

## Tests et build

```bash
cd frontend
npm test -- --watch=false   # ng test (Vitest) : 18 tests
npm run build               # ng build → dist/frontend/browser
```

Tests couverts :
- **Filtre** : `computed()` renvoie les bonnes tâches (titre, priorité, statut).
- **Formulaire** : invalide si le titre fait moins de 3 caractères, priorité `medium` par défaut, bouton désactivé.
- **Service HTTP** : bonne méthode, bonne URL, bon corps (POST, GET, PATCH, DELETE) + `http.verify()`.
- **Guard** : redirection vers `/login` si non admin.

## Déploiement

1. `npm run build` → copier `frontend/dist/frontend/browser/*` sur le serveur.
2. Configurer nginx avec le fallback SPA (voir `deploy/nginx.conf`) : `try_files $uri $uri/ /index.html;`
3. Recharger directement `/tasks/42` : la page s’affiche (le serveur renvoie `index.html`, Angular route ensuite).
4. En production : HTTPS, `APP_ENV=prod`, un `APP_SECRET` propre dans `.env.local`.
