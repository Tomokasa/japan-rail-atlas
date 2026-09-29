/* polish.js — 轻量微交互增强（不触碰 app.js 管理的 DOM 数据值） */
(() => {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // 涟漪反馈：在主操作按钮按下时，从触点泛起一圈柔光
  document.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest('.primary, .map-area nav button, .drawer-toggle');
    if (!btn) return;
    if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    const r = btn.getBoundingClientRect();
    const span = document.createElement('span');
    const d = Math.max(r.width, r.height) * 1.6;
    span.className = 'polish-ripple';
    span.style.cssText =
      'position:absolute;border-radius:50%;pointer-events:none;' +
      'background:radial-gradient(circle, rgba(255,255,255,.45) 0%, rgba(255,255,255,0) 70%);' +
      'width:' + d + 'px;height:' + d + 'px;' +
      'left:' + (e.clientX - r.left - d / 2) + 'px;' +
      'top:' + (e.clientY - r.top - d / 2) + 'px;' +
      'transform:scale(0);opacity:.9;transition:transform .5s cubic-bezier(.22,.61,.36,1),opacity .6s;';
    btn.appendChild(span);
    requestAnimationFrame(() => { span.style.transform = 'scale(1)'; span.style.opacity = '0'; });
    span.addEventListener('transitionend', () => span.remove());
  });

  // 称号/荣誉更新时给徽章一次轻盈的"点一下"弹性
  const medal = document.querySelector('#rank-medal');
  if (medal) {
    const observer = new MutationObserver(() => {
      medal.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }],
        { duration: 460, easing: 'cubic-bezier(.34,1.56,.64,1)' }
      );
    });
    observer.observe(medal, { childList: true, subtree: true, characterData: true });
  }
})();
