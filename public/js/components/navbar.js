export async function loadNavbar() {
  const navbarHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <a class="navbar-brand" href="index.html">
          <img
            src="../assets/images/Logo_Zotto_New.png"
            class="logo-navbar"
            alt="Logo Zotto"
          />
        </a>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Alternar navegação"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- MENU -->
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">

            <!-- Usuários -->
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
              >
                Usuários
              </a>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="cadastrar-usuario.html">Cadastro</a></li>
                <li><a class="dropdown-item" href="consulta-usuario.html">Consulta</a></li>
              </ul>
            </li>

            <!-- Cortadores -->
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
              >
                Cortadores
              </a>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="cadastrar-cortador.html">Cadastro</a></li>
                <li><a class="dropdown-item" href="consulta-cortador.html">Consulta</a></li>
              </ul>
            </li>

            <!-- Matéria Prima -->
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
              >
                Matéria Prima
              </a>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="cadastrar-materia-prima.html">Cadastro</a></li>
                <li><a class="dropdown-item" href="consulta-materia-prima.html">Consulta</a></li>
              </ul>
            </li>

            <!-- Faltas -->
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
              >
                Faltas de Matéria Prima
              </a>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="cadastrar-faltas.html">Cadastro</a></li>
              </ul>
            </li>

            <!-- Relatórios -->
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
              >
                Relatórios
              </a>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="relatorio-faltas.html">Cadastro</a></li>
              </ul>
            </li> 

            <!-- Solas e Pesos -->
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
              >
                Pesos
              </a>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="pesos-sola.html">Cadastro</a></li>
                <li><a class="dropdown-item" href="consulta-pesos-sola.html">Consulta</a></li>
              </ul>
            </li>

          </ul>
        </div> 

        <!-- Usuário e Logout -->
        <div class="d-flex align-items-center ms-auto">
          <span class="text-white me-3" id="userNameDisplay">Login:</span>
          <button id="logoutBtn" class="btn btn-light me-3">Logout</button>
        </div>
      </div>
    </nav>
    `;

  const navContainer = document.createElement("div");
  navContainer.innerHTML = navbarHTML;
  document.body.insertBefore(
    navContainer.firstElementChild,
    document.body.firstChild,
  );
}

// Auto-carregar quando o módulo é importado
loadNavbar();
