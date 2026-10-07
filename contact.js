const feedback = document.querySelector('#contact-feedback');
const copyTimers = new WeakMap();
let feedbackTimer;

function showFeedback(message) {
  window.clearTimeout(feedbackTimer);
  feedback.textContent = message;
  feedback.classList.add('is-visible');
  feedbackTimer = window.setTimeout(() => feedback.classList.remove('is-visible'), 2200);
}

document.querySelectorAll('[data-copy]').forEach(button => {
  const originalLabel = button.textContent;
  button.addEventListener('click', async () => {
    const value = button.dataset.copy || '';
    let copied = false;
    try {
      await navigator.clipboard.writeText(value);
      copied = true;
    } catch {
      const input = document.createElement('textarea');
      input.value = value;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      try {
        copied = document.execCommand('copy');
      } catch {
        copied = false;
      } finally {
        input.remove();
        button.focus({preventScroll: true});
      }
    }
    if (!copied) {
      showFeedback('未能复制，请长按或选中联系方式复制');
      return;
    }
    window.clearTimeout(copyTimers.get(button));
    button.textContent = '已复制';
    button.classList.add('is-copied');
    showFeedback('联系方式已复制');
    copyTimers.set(button, window.setTimeout(() => {
      button.textContent = originalLabel;
      button.classList.remove('is-copied');
    }, 2200));
  });
});

