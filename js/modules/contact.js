export function setupContactFormEnhancement() {
  const form = document.querySelector('[data-contact-form]');
  if (!form || typeof window.fetch !== 'function') {
    return;
  }

  const feedback = form.querySelector('.form-feedback');
  const submitButton = form.querySelector('button[type="submit"]');

  if (!submitButton) {
    return;
  }

  function setFeedback(message, type) {
    if (!feedback) {
      return;
    }

    feedback.textContent = message || '';
    feedback.classList.remove('is-info', 'is-success', 'is-error');

    if (type) {
      feedback.classList.add(type);
    }
  }

  form.addEventListener('submit', async (event) => {
    if (!form.action) {
      return;
    }

    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      setFeedback('Revise os campos obrigatorios antes de enviar.', 'is-error');
      return;
    }

    submitButton.disabled = true;
    submitButton.classList.add('is-loading');
    setFeedback('Enviando mensagem...', 'is-info');

    try {
      const response = await fetch(form.action, {
        method: form.method || 'POST',
        body: new FormData(form),
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('form_submit_failed');
      }

      form.reset();
      setFeedback('Mensagem enviada com sucesso. Obrigado pelo contato.', 'is-success');
    } catch {
      setFeedback('Nao foi possivel enviar agora. Tente novamente em instantes.', 'is-error');
    } finally {
      submitButton.disabled = false;
      submitButton.classList.remove('is-loading');
    }
  });
}
