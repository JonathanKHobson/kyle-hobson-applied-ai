/* Reversible forwarding from six portfolio-family GitHub Pages repositories. */
(function () {
  if (location.hostname !== 'jonathankhobson.github.io') return;
  const parts = location.pathname.split('/');
  const repo = parts[1];
  if (!['portfolio', 'kyle-hobson-applied-ai', 'kyle-hobson-ux-design',
        'kyle-hobson-ux-research', 'application-portfolios', 'home'].includes(repo)) return;
  if (new URLSearchParams(location.search).get('_legacy') === '1') return;
  let suffix = parts.slice(2).join('/');
  if (suffix.endsWith('/index.html')) suffix = suffix.slice(0, -10);
  else if (suffix === 'index.html') suffix = '';
  else if (suffix.endsWith('.html')) suffix = suffix.slice(0, -5);
  const prefix = repo === 'portfolio' && !suffix ? '/' : '/' + repo + '/';
  const destination = new URL(prefix + suffix + location.search + location.hash,
    'https://kyle-hobson.jkylehobson.chatgpt.site');
  location.replace(destination.href);
})();
