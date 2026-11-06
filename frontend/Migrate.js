// migrate.js — à lancer UNE fois dans le dossier frontend :  node migrate.js
// Sauvegarde chaque page dans _backup/, puis :
//  - remplace l'ancienne navbar par <div id="site-nav"> + Nav.js (pages publiques)
//  - supprime le fond animé sombre et le grain
//  - remplace les anciennes polices (Fraunces, Inter) par celles du nouveau thème
const fs = require("fs");
const path = require("path");

const PUBLIQUES = [
  "orientation.html",
  "faq.html",
  "Decouvrire.html",
  "fiche-ecole.html",
  "Comparer.html",
];
const ADMIN = ["Admin.html"]; // garde sa propre navbar (bouton Déconnexion)

fs.mkdirSync("_backup", { recursive: true });

function migrer(fichier, remplacerNav) {
  if (!fs.existsSync(fichier))
    return console.log(`  ?  ${fichier} introuvable, ignoré`);
  let h = fs.readFileSync(fichier, "utf8");
  if (remplacerNav && h.includes('id="site-nav"'))
    return console.log(`  =  ${fichier} déjà migré`);

  fs.copyFileSync(fichier, path.join("_backup", fichier));

  // Fond animé + grain
  h = h.replace(
    /<div class="liquid-field">\s*(?:<div class="lq-orb[^"]*"><\/div>\s*)+<\/div>\s*/g,
    "",
  );
  h = h.replace(/<div class="grain"[^>]*><\/div>\s*/g, "");

  // Navbar partagée
  if (remplacerNav) {
    h = h.replace(
      /<nav class="nav">[\s\S]*?<\/nav>/,
      '<div id="site-nav"></div>',
    );
    if (!h.includes("Nav.js"))
      h = h.replace(
        "</head>",
        '  <script src="Nav.js" defer></script>\n  </head>',
      );
  }

  // Polices (guillemets simples ou doubles, pour ne pas casser les attributs style="")
  h = h
    .replace(/'Fraunces'/g, "'Instrument Serif'")
    .replace(/"Fraunces"/g, '"Instrument Serif"');
  h = h
    .replace(/'Inter'/g, "'Plus Jakarta Sans'")
    .replace(/"Inter"/g, '"Plus Jakarta Sans"');

  fs.writeFileSync(fichier, h);
  console.log(`  ✓  ${fichier}`);
}

console.log("Migration des pages…");
PUBLIQUES.forEach((f) => migrer(f, true));
ADMIN.forEach((f) => migrer(f, false));
console.log("\nTerminé. Les originaux sont dans le dossier _backup/.");
