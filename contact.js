/* Public client configuration, verified against Kyle's existing ProGM form.
   No private credentials or recipient override belong in this file. */
(() => {
  'use strict';
  const form = document.getElementById('inquiry');
  if (!form) return;
  const button = document.getElementById('send');
  const status = document.getElementById('form-status');
  const summary = document.getElementById('errors');
  const fields = ['name', 'email', 'message', 'consent'];
  let busy = false;
  let lastPayload = '';
  let lastAccepted = 0;
  const opened = Date.now();
  form.hidden = false;
  form.noValidate = true;

  function announce(text, state, focus = true) {
    status.textContent = text;
    status.dataset.state = state;
    if (focus) status.focus();
  }
  function clearError(id) {
    const field = document.getElementById(id);
    field.removeAttribute('aria-invalid');
    document.getElementById(id + '-error').textContent = '';
    if (id === 'message') field.setAttribute('aria-describedby', 'message-help');
    else field.removeAttribute('aria-describedby');
  }
  function validate() {
    const errors = [];
    fields.forEach(id => {
      clearError(id);
      const input = document.getElementById(id);
      const empty = id === 'consent' ? !input.checked : !input.value.trim();
      let message = empty ? ({name:'Enter your name.',email:'Enter your email address.',message:'Add a short description of your project.',consent:'Confirm that Kyle can reply about this project.'})[id] : '';
      if (!empty && id === 'email' && !input.validity.valid) message = 'Enter an email address like name@example.com.';
      if (message) {
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', (id === 'message' ? 'message-help ' : '') + id + '-error');
        document.getElementById(id + '-error').textContent = message;
        errors.push({id, message});
      }
    });
    summary.replaceChildren();
    summary.hidden = !errors.length;
    if (errors.length) {
      const text = document.createElement('p');
      text.textContent = 'Please check these fields before sending:';
      const list = document.createElement('ul');
      errors.forEach(error => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = '#' + error.id;
        link.textContent = error.message;
        link.addEventListener('click', () => document.getElementById(error.id).focus());
        li.append(link); list.append(li);
      });
      summary.append(text, list);
      summary.focus();
    }
    return errors.length === 0;
  }
  fields.forEach(id => document.getElementById(id).addEventListener('input', () => clearError(id)));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !validate()) return;
    if (form.elements.website.value || Date.now() - opened < 1500) {
      announce('Please wait a moment, then try sending again. You can also use the email link.', 'error');
      return;
    }
    if (!navigator.onLine) {
      announce('You’re offline. Your draft is still here. Reconnect, then choose Send inquiry, or use the email link when you’re online.', 'error');
      return;
    }
    const topic = form.dataset.topic;
    const params = {
      title: topic + ' project inquiry',
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      topic: topic + ' | ' + (form.elements.service.value || 'Scope conversation'),
      consent: 'Yes, reply about this project only',
      message: (form.elements.company.value.trim() ? 'Organization: ' + form.elements.company.value.trim() + '\n\n' : '') + form.elements.message.value.trim(),
      page: location.origin + location.pathname
    };
    const fingerprint = JSON.stringify(params);
    if (fingerprint === lastPayload && Date.now() - lastAccepted < 60000) {
      announce('This inquiry was just sent. Please allow time for a reply by email.', 'success');
      return;
    }
    busy = true;
    button.disabled = true;
    button.textContent = 'Sending inquiry…';
    form.setAttribute('aria-busy', 'true');
    announce('Sending your inquiry…', 'sending', false);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST', headers: {'Content-Type':'application/json'}, signal: controller.signal,
        body: JSON.stringify({service_id:'service_9wx16fe',template_id:'template_hjbmxbn',user_id:'DpN9hLocoU__4dYVX',template_params:params})
      });
      if (!response.ok) throw new Error('service');
      lastPayload = fingerprint; lastAccepted = Date.now();
      form.reset();
      summary.hidden = true;
      announce('Your inquiry was sent. Thank you. I’ll reply by email to discuss the next step.', 'success');
    } catch (error) {
      if (error.message === 'service') {
        announce('Your inquiry wasn’t sent. Your draft is still here. Please try again, or email jonathankylehobson@gmail.com.', 'error');
      } else {
        announce('We couldn’t confirm whether your inquiry was sent. Your draft is still here. It may have gone through; please check with Kyle by email before sending it again.', 'uncertain');
      }
    } finally {
      clearTimeout(timeout);
      busy = false; button.disabled = false; button.textContent = 'Send inquiry';
      form.removeAttribute('aria-busy');
    }
  });
})();
