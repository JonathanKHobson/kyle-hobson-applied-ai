/* Navigation and proof remain fully usable without JavaScript. */
(() => {
  'use strict';
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.href === location.href && !link.hash) link.setAttribute('aria-current', 'page');
  });
})();
