#!/usr/bin/env node
/**
 * Minifie récursivement les fichiers .html / .css / .js d'un dossier source
 * vers un dossier de sortie, SANS toucher aux fichiers originaux.
 *
 * Usage :
 *   node minify.js [srcDir] [distDir]
 *   node minify.js .        dist
 *
 * Dépendances : html-minifier-terser, terser, clean-css
 */

const fs = require('fs/promises');
const path = require('path');
const fsSync = require('fs');
const ignoreLib = require('ignore');
const { minify: minifyHtml } = require('html-minifier-terser');
const { minify: minifyJs } = require('terser');
const CleanCSS = require('clean-css');

const SRC = path.resolve(process.argv[2] || '.');
const DIST = path.resolve(process.argv[3] || 'dist');

// Toujours ignoré, indépendamment du .gitignore (outillage du build lui-même,
// jamais destiné à finir sur le site déployé).
const ALWAYS_IGNORE = [
  'node_modules',
  '.git',
  'dist',
  '.github',
  '.claude',
  'supabase',
  '.gitignore',
  '*.md',        // README.md, CHANGELOG.md, AGENTS.md, docs internes...
  'minify.js',   // le script lui-même
  'package.json',
  'package-lock.json',
  '*.py',        // scripts dev type count_lines.py
];

const ig = ignoreLib();
ig.add(ALWAYS_IGNORE);

// On ajoute en plus les règles du .gitignore du projet, si présent, pour ne
// pas dupliquer la logique à la main (node_modules, .env, etc. y sont déjà).
const gitignorePath = path.join(SRC, '.gitignore');
if (fsSync.existsSync(gitignorePath)) {
  const gitignoreContent = fsSync.readFileSync(gitignorePath, 'utf8');
  ig.add(gitignoreContent);
  console.log(`(règles chargées depuis ${path.relative(process.cwd(), gitignorePath)})`);
}

const HTML_OPTIONS = {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  minifyCSS: true,   // minifie le CSS inline (<style>) via clean-css
  minifyJS: true,    // minifie le JS inline (<script>) via terser
  collapseBooleanAttributes: true,
  removeEmptyAttributes: false, // garde value="" etc. utiles ici (placeholders, etc.)
};

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    // ignore() attend un chemin relatif à la racine SRC, avec des '/' (pas '\')
    // même sous Windows — sinon les patterns gitignore ne matchent pas.
    let rel = path.relative(SRC, full).split(path.sep).join('/');
    if (entry.isDirectory()) rel += '/';
    if (ig.ignores(rel)) continue;

    if (entry.isDirectory()) {
      files = files.concat(await walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

// Stats cumulées par catégorie, pour le résumé final.
// Les fichiers dont la taille AUGMENTE après traitement sont trackés à part
// (ex: style.css qui inline ses @import) et exclus du calcul de réduction,
// pour ne pas fausser le pourcentage global.
const STATS = {
  html: { before: 0, after: 0, count: 0 },
  css: { before: 0, after: 0, count: 0 },
  js: { before: 0, after: 0, count: 0 },
};
const GROWN = []; // { rel, category, before, after }

// Poids RÉEL total par catégorie (avant/après), TOUS fichiers inclus
// (contrairement à STATS, qui exclut les fichiers en augmentation pour
// ne pas fausser le %). C'est ce qu'on sert vraiment au navigateur.
const TOTALS = {
  html: { before: 0, after: 0 },
  css: { before: 0, after: 0 },
  js: { before: 0, after: 0 },
};

async function processFile(srcFile) {
  const rel = path.relative(SRC, srcFile);
  const destFile = path.join(DIST, rel);
  const ext = path.extname(srcFile).toLowerCase();

  if (ext === '.html' || ext === '.htm') {
    const content = await fs.readFile(srcFile, 'utf8');
    const out = await minifyHtml(content, HTML_OPTIONS);
    await ensureDir(destFile);
    await fs.writeFile(destFile, out, 'utf8');
    report(srcFile, content.length, out.length, 'html');
  } else if (ext === '.css') {
    const content = await fs.readFile(srcFile, 'utf8');
    // On donne le chemin réel du fichier à clean-css (pas juste le contenu en mémoire)
    // pour qu'il résolve les @import relatifs (ex: style.css qui importe main.css, layout.css...).
    const out = await new CleanCSS({ level: 2, returnPromise: true }).minify([srcFile]);
    if (out.errors.length) {
      console.error(`  ⚠ Erreurs CSS dans ${rel}:`, out.errors);
    }
    if (out.warnings.length) {
      console.warn(`  ⚠ Avertissements CSS dans ${rel}:`, out.warnings);
    }
    await ensureDir(destFile);
    await fs.writeFile(destFile, out.styles, 'utf8');
    report(srcFile, content.length, out.styles.length, 'css');
  } else if (ext === '.js' && !srcFile.endsWith('.min.js')) {
    const content = await fs.readFile(srcFile, 'utf8');
    // Détection de module ES : import/export explicites, OU top-level await
    // (un `await` qui n'est pas à l'intérieur d'une fonction async n'est valide
    // qu'en module — cas de design.js qui a `await` en ligne 3 sans import/export).
    const hasImportExport = /^\s*(import|export)\s/m.test(content);
    const hasTopLevelAwait = /(^|[;{}()\s])await\s/m.test(content);
    const isModule = hasImportExport || hasTopLevelAwait;
    try {
      const out = await minifyJs(content, { module: isModule });
      await ensureDir(destFile);
      await fs.writeFile(destFile, out.code, 'utf8');
      report(srcFile, content.length, out.code.length, 'js');
    } catch (err) {
      console.error(`  ⚠ Échec minification JS sur ${rel} (copié tel quel):`, err.message);
      await ensureDir(destFile);
      await fs.copyFile(srcFile, destFile);
      // Pas de report() : fichier copié tel quel, pas de compression réelle, exclu des stats.
    }
  } else {
    // Tout le reste (images, favicon, fonts...) : copie simple, hors stats.
    await ensureDir(destFile);
    await fs.copyFile(srcFile, destFile);
  }
}

function report(file, before, after, category) {
  const rel = path.relative(SRC, file);
  const pct = before ? Math.round((1 - after / before) * 100) : 0;
  console.log(`  ✓ ${rel}: ${before}o → ${after}o (-${pct}%)`);

  TOTALS[category].before += before;
  TOTALS[category].after += after;

  if (after > before) {
    // Taille augmentée (ex: inlining d'@import CSS) : on le signale mais on
    // l'exclut du total de réduction pour ne pas fausser le pourcentage global.
    GROWN.push({ rel, category, before, after });
    return;
  }
  STATS[category].before += before;
  STATS[category].after += after;
  STATS[category].count += 1;
}

function printSummary() {
  console.log('\n--- Résumé par catégorie (fichiers en augmentation exclus) ---');
  for (const [category, label] of [['html', 'HTML'], ['css', 'CSS'], ['js', 'JS']]) {
    const s = STATS[category];
    if (s.count === 0) continue;
    const pct = s.before ? Math.round((1 - s.after / s.before) * 100) : 0;
    console.log(`${label} (${s.count} fichier(s)) : ${s.before}o → ${s.after}o (-${pct}%)`);
  }
  if (GROWN.length) {
    console.log('\nExclus du calcul de réduction ci-dessus (taille augmentée) :');
    for (const g of GROWN) {
      const pct = g.before ? Math.round((1 - g.after / g.before) * 100) : 0;
      console.log(`  ⚠ ${g.rel} [${g.category}]: ${g.before}o → ${g.after}o (${pct >= 0 ? '-' : '+'}${Math.abs(pct)}%)`);
    }
  }

  console.log('\n--- Poids total réel (tous fichiers, y compris ceux en augmentation) ---');
  let totalBefore = 0;
  let totalAfter = 0;
  for (const [category, label] of [['html', 'HTML'], ['css', 'CSS'], ['js', 'JS']]) {
    const t = TOTALS[category];
    if (t.before === 0 && t.after === 0) continue;
    totalBefore += t.before;
    totalAfter += t.after;
    console.log(`${label} : ${formatKo(t.before)} → ${formatKo(t.after)}`);
  }
  console.log(`TOTAL : ${formatKo(totalBefore)} → ${formatKo(totalAfter)}`);
}

function formatKo(bytes) {
  return `${(bytes / 1024).toFixed(1)} Ko`;
}

function validateEnvironment() {
  const problems = [];

  if (!fsSync.existsSync(SRC) || !fsSync.statSync(SRC).isDirectory()) {
    problems.push(`Le dossier source "${SRC}" n'existe pas.`);
  }

  // Détecte le cas classique : lancer le script depuis le dossier dist/ généré
  // par un run précédent, au lieu de la racine du projet.
  const srcBasename = path.basename(SRC).toLowerCase();
  const hasPackageJson = fsSync.existsSync(path.join(SRC, 'package.json'));
  const hasMinifyJs = fsSync.existsSync(path.join(SRC, 'minify.js'));
  if (srcBasename === 'dist' && !hasPackageJson && !hasMinifyJs) {
    problems.push(
      `Tu sembles être DANS un dossier "dist" (sortie de build), pas à la racine du projet.\n` +
      `   → Remonte d'un cran : cd .. puis relance node minify.js . dist`
    );
  } else if (!hasPackageJson && !hasMinifyJs) {
    problems.push(
      `"${SRC}" ne contient ni package.json ni minify.js — ce n'est peut-être pas le bon dossier.\n` +
      `   → Vérifie que tu es bien à la racine de ton projet (là où se trouve minify.js).`
    );
  }

  // Empêche DIST d'être égal à SRC, ou un ancêtre de SRC (écraserait les sources).
  const relSrcToDist = path.relative(DIST, SRC);
  if (SRC === DIST) {
    problems.push(`Le dossier source et le dossier de sortie sont identiques (${SRC}). Choisis un autre nom pour la sortie.`);
  } else if (relSrcToDist && !relSrcToDist.startsWith('..') && !path.isAbsolute(relSrcToDist)) {
    // DIST est un parent de SRC : générer dedans écraserait potentiellement les sources.
    problems.push(`Le dossier de sortie "${DIST}" est un parent du dossier source "${SRC}" — ça risque d'écraser tes fichiers sources. Choisis un dossier de sortie séparé (ex: dist).`);
  }

  if (problems.length) {
    console.error('\n✗ Impossible de continuer :\n');
    for (const p of problems) console.error(`  - ${p}`);
    console.error('');
    return false;
  }
  return true;
}

async function main() {
  if (!validateEnvironment()) {
    process.exitCode = 1;
    return;
  }

  console.log(`Source : ${SRC}`);
  console.log(`Sortie : ${DIST}\n`);

  const files = await walk(SRC);
  for (const file of files) {
    try {
      await processFile(file);
    } catch (err) {
      console.error(`✗ Erreur sur ${path.relative(SRC, file)}:`, err.message);
    }
  }
  console.log(`\nTerminé. ${files.length} fichier(s) traité(s) → ${path.relative(process.cwd(), DIST)}/`);
  printSummary();
}

function pauseBeforeExit(code) {
  // Si le terminal est interactif (pas un pipe/CI), on attend une touche avant
  // de quitter — évite que la fenêtre se ferme instantanément sous Windows et
  // qu'on ne voie jamais le message d'erreur.
  if (process.stdin.isTTY && process.stdout.isTTY) {
    process.stdout.write('\nAppuie sur Entrée pour fermer...');
    process.stdin.setRawMode?.(true);
    process.stdin.resume();
    process.stdin.once('data', () => process.exit(code));
  } else {
    process.exit(code);
  }
}

main()
  .then(() => {
    if (process.exitCode) pauseBeforeExit(process.exitCode);
  })
  .catch((err) => {
    console.error('\n✗ Erreur fatale:', err.message || err);
    pauseBeforeExit(1);
  });