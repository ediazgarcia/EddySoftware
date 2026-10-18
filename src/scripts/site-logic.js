class Component extends DCLogic {
renderVals() {
const P = window.__siteProjects;
const st = this.state || {};
const i = st.sel;
const p = (i === 0 || i) ? P[i] : null;
const out = {
hasSel: !!p,
sel: p ? Object.assign({}, p, { hasDemo: !!p.demo, noDemo: !p.demo, hasGit: !!p.github, noGit: !p.github }) : { color: '#CFC8B8', label: '', title: '', desc: '', tagsLine: '', demo: '', github: '', hasDemo: false, noDemo: true, hasGit: false, noGit: true },
close: () => this.setState({ sel: null })
};
P.forEach((x, k) => { out['pick' + k] = () => this.setState({ sel: k }); });
return out;
}
componentDidMount() {
this._tries = 0;
this._boot = () => {
const parts = Array.prototype.slice.call(document.querySelectorAll('.smk'));
const cur = document.querySelector('.cur');
const pls = document.querySelector('.pls');
if ((!parts.length || typeof anime === 'undefined') && this._tries++ < 20) { this._t = setTimeout(this._boot, 250); return; }
if (!parts.length || typeof anime === 'undefined') return;
if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
const items = Array.prototype.slice.call(document.querySelectorAll('.rv'));
if ('IntersectionObserver' in window && items.length) {
items.forEach((el) => { el.style.opacity = '0'; });
this._io = new IntersectionObserver((entries) => {
let k = 0;
entries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top).forEach((en) => {
const el = en.target;
anime.remove(el);
if (en.isIntersecting) {
const dir = en.boundingClientRect.top >= 0 ? 1 : -1;
anime({ targets: el, opacity: [0, 1], translateY: [dir * 56, 0], scale: [0.97, 1], duration: 850, delay: k * 90, easing: 'easeOutCubic' });
k++;
} else {
el.style.opacity = '0';
el.style.transform = '';
}
});
}, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
items.forEach((el) => this._io.observe(el));
}
const colors = ['255,107,74', '58,134,255', '123,92,255', '18,194,165', '233,214,166'];
let n = 0, ci = 0, lx = -999, ly = -999, mx = 0, my = 0, cx = 0, cy = 0, seen = false, stopT = null, raf = null;
const ringIn = cur ? cur.querySelector('.cur-i') : null;
const idle = ringIn ? anime({ targets: ringIn, scale: [1, 1.4], direction: 'alternate', loop: true, duration: 650, easing: 'easeInOutSine', autoplay: false }) : null;
const puff = (x, y, k) => {
const el = parts[n++ % parts.length];
anime.remove(el);
const c = colors[ci++ % colors.length];
el.style.background = 'radial-gradient(circle, rgba(' + c + ',.6) 0%, rgba(' + c + ',.28) 42%, rgba(' + c + ',0) 72%)';
anime({ targets: el, translateX: [x, x + (Math.random() - 0.5) * 90 * k], translateY: [y, y - (30 + Math.random() * 90) * k], scale: [0.3, 1.4 + Math.random() * 1.4 * k], rotate: (Math.random() - 0.5) * 140, opacity: [0.85, 0], duration: 1000 + Math.random() * 1100, easing: 'easeOutCubic' });
};
const pulse = (x, y) => {
if (!pls) return;
anime.remove(pls);
anime({ targets: pls, translateX: [x, x], translateY: [y, y], scale: [0.4, 2.6], opacity: [0.8, 0], duration: 900, easing: 'easeOutExpo' });
};
const loop = () => {
cx += (mx - cx) * 0.22; cy += (my - cy) * 0.22;
if (cur) cur.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
raf = requestAnimationFrame(loop);
};
const move = (x, y) => {
mx = x; my = y;
if (!seen) { seen = true; cx = x; cy = y; if (cur) cur.style.opacity = 1; raf = requestAnimationFrame(loop); }
if (idle) { idle.pause(); anime.set(ringIn, { scale: 1 }); }
const d = Math.hypot(x - lx, y - ly);
if (d > 16) {
const k = Math.min(1.6, 0.7 + d / 60);
puff(x, y, k);
if (d > 60 && lx > -900) puff((x + lx) / 2, (y + ly) / 2, k);
lx = x; ly = y;
}
clearTimeout(stopT);
stopT = setTimeout(() => { pulse(x, y); puff(x, y, 0.8); if (idle) idle.play(); }, 160);
};
this._h = {
mm: (e) => move(e.clientX, e.clientY),
tm: (e) => { const t = e.touches && e.touches[0]; if (t) move(t.clientX, t.clientY); },
out: (e) => { if (!e.relatedTarget) { clearTimeout(stopT); if (cur) cur.style.opacity = 0; if (idle) idle.pause(); cancelAnimationFrame(raf); seen = false; lx = -999; ly = -999; } },
dn: (e) => { for (let j = 0; j < 7; j++) puff(e.clientX, e.clientY, 1.5); pulse(e.clientX, e.clientY); }
};
document.addEventListener('mousemove', this._h.mm);
document.addEventListener('touchmove', this._h.tm, { passive: true });
document.addEventListener('mouseout', this._h.out);
document.addEventListener('mousedown', this._h.dn);
};
this._boot();
}
componentWillUnmount() {
clearTimeout(this._t);
if (this._io) this._io.disconnect();
if (this._h) {
document.removeEventListener('mousemove', this._h.mm);
document.removeEventListener('touchmove', this._h.tm);
document.removeEventListener('mouseout', this._h.out);
document.removeEventListener('mousedown', this._h.dn);
}
}
}
