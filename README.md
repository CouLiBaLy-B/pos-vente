# Coulibaly & Frères — Point de Vente (POS)

Application de point de vente complète avec frontend React/TypeScript et backend Node.js/Express, le tout orchestré via Docker Compose.

## Stack technique

| Couche      | Technologie                         |
|-------------|-------------------------------------|
| Frontend    | React 19, TypeScript, Vite, Tailwind CSS 4 |
| Backend     | Node.js 20, Express 4, PostgreSQL 16 |
| Proxy       | Nginx (Alpine)                      |
| Conteneurs  | Docker & Docker Compose             |

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ≥ 4.x (seul prérequis)

## Installation rapide (sans cloner le dépôt)

2 commandes suffisent — Docker se charge de tout télécharger.

**Linux / macOS / Git Bash :**
```bash
curl -o docker-compose.yml https://raw.githubusercontent.com/CouLiBaLy-B/pos-vente/main/docker-compose.prod.yml
docker compose up -d
```

**PowerShell (Windows) :**
```powershell
Invoke-WebRequest -Uri https://raw.githubusercontent.com/CouLiBaLy-B/pos-vente/main/docker-compose.prod.yml -OutFile docker-compose.yml
docker compose up -d
```

L'application est disponible sur **http://localhost** après ~30 secondes (le temps que PostgreSQL démarre).

Pour arrêter :
```bash
docker compose down
```

Pour tout supprimer (y compris les données) :
```bash
docker compose down -v
```

---

## Démarrage depuis le code source

```bash
# Cloner le dépôt
git clone https://github.com/CouLiBaLy-B/pos-vente.git
cd pos-vente

# Lancer tous les services (base de données, backend, frontend)
docker compose up --build
```

L'application est accessible sur **http://localhost**.

L'API backend est exposée sur **http://localhost:3001**.

## Architecture des services

```
┌─────────────────────────────────────────┐
│            Navigateur / Client          │
└─────────────────┬───────────────────────┘
                  │ :80
┌─────────────────▼───────────────────────┐
│         Frontend — Nginx (Alpine)        │
│  Sert les fichiers statiques React       │
│  Proxy /api/* → backend:3001            │
└─────────────────┬───────────────────────┘
                  │ :3001
┌─────────────────▼───────────────────────┐
│      Backend — Node.js / Express         │
│  API REST pour produits, ventes,         │
│  clients, fournisseurs, dépenses…        │
└─────────────────┬───────────────────────┘
                  │ :5432
┌─────────────────▼───────────────────────┐
│      Base de données — PostgreSQL 16     │
│  Volume persistant : postgres_data       │
└─────────────────────────────────────────┘
```

## Variables d'environnement

Les variables du backend sont définies dans `docker-compose.yml` :

| Variable      | Valeur par défaut | Description              |
|---------------|-------------------|--------------------------|
| `DB_HOST`     | `postgres`        | Hôte PostgreSQL          |
| `DB_PORT`     | `5432`            | Port PostgreSQL          |
| `DB_NAME`     | `pos_db`          | Nom de la base           |
| `DB_USER`     | `pos_user`        | Utilisateur              |
| `DB_PASSWORD` | `pos_secret`      | Mot de passe             |
| `PORT`        | `3001`            | Port du serveur Express  |

> **Sécurité** : en production, remplacez les valeurs par défaut et utilisez des secrets Docker ou un fichier `.env` non versionné.

## Commandes utiles

```bash
# Démarrer en arrière-plan
docker compose up -d --build

# Voir les logs en temps réel
docker compose logs -f

# Arrêter les services
docker compose down

# Supprimer aussi les volumes (réinitialise la base)
docker compose down -v

# Reconstruire un seul service
docker compose build frontend
docker compose build backend
```

## Développement local (sans Docker)

### Frontend

```bash
npm install
npm run dev        # Vite dev server sur http://localhost:5173
```

### Backend

```bash
cd backend
npm install
npm run dev        # Node --watch sur http://localhost:3001
```

> Pensez à configurer une instance PostgreSQL locale et à exporter les variables d'environnement correspondantes.

## Structure du projet

```
pos-vente/
├── src/                    # Source React / TypeScript
│   ├── components/         # Composants réutilisables
│   ├── context/            # Contextes React (store global)
│   ├── pages/              # Pages de l'application
│   ├── services/           # Appels API
│   ├── types/              # Types TypeScript
│   └── utils/              # Fonctions utilitaires
├── backend/
│   ├── server.js           # Serveur Express
│   ├── init.sql            # Script d'initialisation BDD
│   └── Dockerfile
├── Dockerfile              # Build multi-stage frontend
├── nginx.conf              # Configuration Nginx (proxy + SPA fallback)
├── docker-compose.yml      # Orchestration des services
└── .dockerignore
```

## Résolution de problèmes courants

| Erreur | Cause probable | Solution |
|--------|---------------|----------|
| `nginx.conf: not found` lors du build | `nginx.conf` exclu du contexte Docker | S'assurer que `nginx.conf` n'est **pas** dans `.dockerignore` |
| Backend ne démarre pas | PostgreSQL pas encore prêt | Le `healthcheck` dans `docker-compose.yml` gère le démarrage ordonné ; attendre quelques secondes |
| Port 80 déjà utilisé | Un autre service occupe le port | Modifier le mapping dans `docker-compose.yml` (ex. `"8080:80"`) |

## Licence

Voir le fichier [LICENSE](LICENSE).
