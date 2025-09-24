# Copilot Instructions for AI Coding Agents

## Project Overview
- This is a Node.js/Express backend with a static frontend (HTML/JS/CSS) for user management and resource tracking.
- Backend code is in `src/` (controllers, models, routes, middlewares, validators, database).
- Frontend assets are in `public/` (HTML pages, JS, CSS, images).

## Key Architectural Patterns
- **MVC Structure:**
  - `controllers/`: Handle HTTP requests, call models, return responses.
  - `models/`: Database logic (CRUD, queries).
  - `routes/`: Define Express routes, connect to controllers.
  - `middlewares/`: Auth, logging, etc. applied to routes.
  - `validators/`: Input validation logic.
- **Database:**
  - Connection logic in `src/database/db.js`.
  - Models interact directly with the DB.
- **Frontend-Backend Communication:**
  - Frontend JS (in `public/js/` and subfolders) calls backend APIs (likely via fetch/AJAX).
  - Auth and user logic in `public/js/api/` and `public/js/utils/`.

## Developer Workflows
- **Start server:** Run `node src/server.js` (or use `nodemon` for auto-reload).
- **No build step** for frontend; static files are served as-is.
- **No test framework** detected; add tests in a `tests/` folder if needed.
- **Debugging:** Use `console.log` in backend or browser dev tools for frontend.

## Project-Specific Conventions
- **File Naming:**
  - Controllers, models, routes, and validators are named after their resource (e.g., `usuariosController.js`).
  - API logic for frontend is in `public/js/api/`, utilities in `public/js/utils/`.
- **Auth:**
  - Auth middleware in `src/middlewares/authMiddleware.js`.
  - Auth logic for frontend in `public/js/utils/auth.js` and `public/js/api/auth.js`.
- **Static Assets:**
  - Images in `public/assets/images/`, CSS in `public/assets/css/`.

## Integration Points
- **External dependencies:**
  - Express, and possibly others (see `package.json`).
- **API endpoints:**
  - Defined in `src/routes/` and handled by corresponding controllers.
- **Frontend API calls:**
  - Use fetch/XHR to communicate with backend endpoints.

## Examples
- To add a new resource (e.g., `produtos`):
  1. Create `produtosModel.js`, `produtosController.js`, `produtosRoutes.js` in respective folders.
  2. Register the new route in `src/server.js`.
  3. Add frontend logic in `public/js/api/produtos.js` if needed.

## References
- Main entry: `src/server.js`
- Example route: `src/routes/usuariosRoutes.js`
- Example controller: `src/controllers/usuariosController.js`
- Example model: `src/models/usuariosModel.js`
- Example frontend API: `public/js/api/usuarios.js`

---

**Update this file if you add new major features, workflows, or conventions.**
