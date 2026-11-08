/* nav.js — navbar unique, injectée dans <div id="site-nav"> de chaque page */
/* Remplace aussi automatiquement toute <nav class="nav"> codée en dur       */
(() => {
  // 1. Cherche le point d'injection : #site-nav ou la nav codée en dur
  let host = document.getElementById("site-nav");

  if (!host) {
    const oldNav = document.querySelector("nav.nav");
    if (oldNav) {
      // Crée un div de remplacement au même endroit
      host = document.createElement("div");
      host.id = "site-nav";
      oldNav.parentNode.replaceChild(host, oldNav);
    } else {
      return; // Rien à faire
    }
  }

  // Pour ajouter une page : une ligne ici, et elle apparaît partout
  const LINKS = [
    ["Accueil", "index.html"],
    ["Explorer les écoles", "Ecole.html"],
    ["Orientation", "orientation.html"],
    ["Je ne sais pas", "Decouvrire.html"],
    ["FAQ", "faq.html"],
  ];

  // Pages liées à une entrée du menu
  const PARENT = {
    "fiche-ecole.html": "ecole.html",
    "comparer.html": "ecole.html",
  };

  let here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  here = PARENT[here] || here;

  // Conteneur sticky centré
  host.style.cssText =
    "position:sticky;top:16px;z-index:1000;display:flex;justify-content:center;padding:0 16px;";

  host.innerHTML = `
    <nav class="nav glass" aria-label="Navigation principale">
      <a href="index.html" class="nav-logo" aria-label="OrienteCI — accueil"><img class="logo-img" src="../logo/image.png" width="178" height="56" alt="OrienteCI" /></a>
      <button class="burger" aria-label="Ouvrir le menu" aria-expanded="false"><i></i><i></i><i></i></button>
      <div class="nav-menu">
        <ul class="nav-links">
          ${LINKS.map(([t, h]) => `<li><a href="${h}" ${h.toLowerCase() === here ? 'class="active" aria-current="page"' : ""}>${t}</a></li>`).join("")}
        </ul>
        <a href="orientation.html" class="btn btn-dark">Commencer<svg class="icon" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
      </div>
    </nav>`;

  const nav = host.querySelector(".nav");
  const burger = host.querySelector(".burger");

  // Compense la hauteur de la nav pour éviter qu'elle recouvre le contenu
  const ajusterPadding = () => {
    document.body.style.paddingTop = host.offsetHeight + "px";
  };
  ajusterPadding();
  window.addEventListener("resize", ajusterPadding);
  const setOpen = (o) => {
    nav.classList.toggle("open", o);
    burger.setAttribute("aria-expanded", o);
  };
  burger.addEventListener("click", () =>
    setOpen(!nav.classList.contains("open")),
  );
  addEventListener("keydown", (e) => e.key === "Escape" && setOpen(false));
  addEventListener("resize", () => innerWidth > 900 && setOpen(false));
  host.addEventListener(
    "click",
    (e) => e.target.closest("a") && setOpen(false),
  );
})();
