/* ── TRACKO APP LOGIC ── */

/* ── CSRF: auto-attach X-CSRF-Token to all mutating requests ── */
(function() {
    const _orig = window.fetch;
    window.fetch = function(url, opts) {
        opts = opts || {};
        const method = (opts.method || 'GET').toUpperCase();
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
            const csrf = document.cookie.split(';')
                .map(c => c.trim()).find(c => c.startsWith('csrf_token='));
            if (csrf) {
                opts.headers = Object.assign({}, opts.headers, {
                    'X-CSRF-Token': csrf.split('=').slice(1).join('=')
                });
            }
        }
        return _orig.call(this, url, opts);
    };
})();


/* ── CONSTANTS (Mapped to window.CONFIG) ── */
const CAT_COLORS = {
    'Ноутбук':    '#007AFF',
    'Монитор':    '#AF52DE',
    'Кресло':     '#34C759',
    'Стол':       '#FF9500',
    'Клавиатура': '#5856D6',
    'Мышь':       '#5AC8FA',
    'Принтер':    '#FF375F',
    'Телефон':    '#30B0C7',
    'Другое':     '#8E8E93',
};
const CAT_SVG = {
    'Ноутбук':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M1 19h22"/></svg>`,
    'Монитор':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>`,
    'Кресло':     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 10a7 7 0 0 1 14 0"/><path d="M3 10h18a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z"/><path d="M5 14v6m14-6v6"/></svg>`,
    'Стол':       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 7h18M6 7v13m12-13v13M3 11h4m10 0h4"/></svg>`,
    'Клавиатура': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/></svg>`,
    'Мышь':       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2a6 6 0 0 0-6 6v8a6 6 0 0 0 12 0V8a6 6 0 0 0-6-6z"/><line x1="12" y1="2" x2="12" y2="10"/></svg>`,
    'Принтер':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`,
    'Телефон':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1"/></svg>`,
    'Другое':     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
};

function getLetterBadge(text, clr) {
    if (!text) return `<div class="sb-badge" style="background:${clr};">?</div>`;
    const L = text[0].toUpperCase();
    return `<div class="sb-badge" style="background:${clr};">${L}</div>`;
}

function getCatIcon(cat, sz = 20, isSidebar = false) {
    const clr = CAT_COLORS[cat] || '#8E8E93';
    if (isSidebar) return getLetterBadge(cat, clr);
    const svg = (CAT_SVG[cat] || CAT_SVG['Другое']).replace('viewBox=', `width="${sz*0.6}" height="${sz*0.6}" viewBox=`).replace(/stroke="currentColor"/g, `stroke="${clr}"`);
    return `<span style="width:${sz}px;height:${sz}px;border-radius:${Math.round(sz*0.28)}px;background:${clr}1A;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">${svg}</span>`;
}

const SM = { Занято: 'chip-occ', Свободно: 'chip-free' };
const CM = { Хорошее: 'chip-good', 'Потёрто': 'chip-worn', 'Требует ремонта': 'chip-repair', Списано: 'chip-write' };
const PALETTE = ['#4F46E5', '#22D3EE', '#A78BFA', '#F59E0B', '#EF4444', '#34C759', '#EC4899', '#8B5CF6', '#06B6D4', '#F43F5E'];

/* ── I18N LOGIC ── */
function setDashLang(l) {
    localStorage.setItem('tracko-lang', l);
    updateI18n();
}

function updateI18n() {
    const l = localStorage.getItem('tracko-lang') || 'ru';
    if (typeof i18n === 'undefined') return;
    const data = i18n[l] || i18n.ru;
    document.querySelectorAll('[data-t]').forEach(el => {
        const key = el.getAttribute('data-t');
        if (data[key]) el.textContent = data[key];
    });
    const search = document.getElementById('search-input');
    if (search && data.search_placeholder) search.placeholder = data.search_placeholder;
}

/* ── STATE ── */
let items = [], F = { status: '', room: '', category: '', employee: '', condition: '' }, Q = '', curPage = 0;
const PER = 25;
let chartCat = null, chartRoom = null, chartDeptSpend = null, chartActivity = null;
let notifLoaded = false;

/* ── EMPLOYEE DASHBOARD ── */
function loadEmpItems() {
    const dash = document.getElementById('emp-dash');
    if (dash) dash.style.display = 'block';
    
    fetch('/api/items').then(r=>r.json()).then(items=>{
        const el = document.getElementById('emp-cards');
        if (!el) return;
        const icons = {Ноутбук:'💻',Монитор:'🖥️',Кресло:'🪑',Стол:'🪵',Принтер:'🖨️',Телефон:'📱',Клавиатура:'⌨️',Мышь:'🖱️'};
        const cc = c => c==='Хорошее'?'#34c759':c==='Требует ремонта'?'#ff3b30':'#ff9f0a';
        if (!items.length) {
            el.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:24px;color:var(--text2);font-size:13px;">Техника не закреплена</div>';
            return;
        }
        el.innerHTML = items.map(i => `
            <div onclick="window.location='/asset/${i.inv_num}'" style="padding:14px;background:var(--surface);border:.5px solid var(--separator2);border-radius:14px;cursor:pointer;transition:all .13s;">
                <div style="font-size:26px;margin-bottom:8px;">${icons[i.category]||'📦'}</div>
                <div style="font-size:13px;font-weight:700;">${i.model||i.category}</div>
                <div style="font-size:11px;font-family:monospace;color:var(--accent);margin-top:2px;">${i.inv_num}</div>
                <div style="font-size:11px;color:var(--text2);margin-top:2px;">📍 ${i.room||'—'}</div>
                <div style="font-size:11px;font-weight:600;color:${cc(i.condition)};margin-top:6px;">${i.condition}</div>
            </div>`).join('');
    }).catch(()=>{
        const el=document.getElementById('emp-cards');
        if(el) el.innerHTML='<div style="color:var(--text2);font-size:13px;">Ошибка загрузки</div>';
    });
}

/* ── THEME ── */
function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    const d = document.getElementById('theme-ico-dark');
    const l = document.getElementById('theme-ico-light');
    if(d) d.style.display = t === 'dark' ? 'none' : '';
    if(l) l.style.display = t === 'dark' ? '' : 'none';
}
function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') || '';
    const next = cur === 'dark' ? 'light' : 'dark';
    localStorage.setItem('tracko-theme', next);
    applyTheme(next);
    setTimeout(loadStats, 100);
}

/* ── SIDEBAR ── */
function toggleSidebarCollapse() {
    const sb = document.getElementById('sidebar');
    if (!sb) return;
    sb.classList.toggle('collapsed');
    localStorage.setItem('tracko-sidebar-collapsed', sb.classList.contains('collapsed'));
}
function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    if (!sb) return;
    if (sb.classList.contains('mob-open')) {
        closeSidebar();
    } else {
        sb.classList.add('mob-open');
        document.getElementById('mob-overlay').classList.add('open');
        document.body.classList.add('sb-open');
    }
}
function closeSidebar() {
    const sb = document.getElementById('sidebar');
    if (sb) sb.classList.remove('mob-open');
    document.getElementById('mob-overlay')?.classList.remove('open');
    document.body.classList.remove('sb-open');
}

function toggleSBGroup(id) {
    const g = document.getElementById(id + '-group');
    const arr = document.getElementById(id + '-arr');
    if (!g) return;
    const isHidden = g.style.display === 'none';
    g.style.display = isHidden ? 'block' : 'none';
    if (arr) arr.style.transform = isHidden ? 'rotate(0)' : 'rotate(-90deg)';
    localStorage.setItem('tracko-' + id + '-collapsed', !isHidden);
}

/* ── TAB BAR ── */
function tabSwitch(tab) {
    ['main', 'charts', 'hist', 'prof'].forEach(t => document.getElementById('tab-' + t)?.classList.remove('active'));
    document.getElementById('tab-' + tab)?.classList.add('active');
    const chartsEl = document.querySelector('.charts-row');
    const statsEl = document.querySelector('.stats-grid');
    const tableEl = document.querySelector('.table-wrap');
    const toolEl = document.querySelector('.toolbar');
    
    if (tab === 'charts') {
        if (chartsEl) chartsEl.style.display = 'grid';
        if (statsEl) statsEl.style.display = 'grid';
        if (tableEl) tableEl.style.display = 'none';
        if (toolEl) toolEl.style.display = 'none';
    } else {
        if (chartsEl) chartsEl.style.display = '';
        if (statsEl) statsEl.style.display = '';
        if (tableEl) tableEl.style.display = '';
        if (toolEl) toolEl.style.display = '';
    }
}

async function refresh() {
    await Promise.all([load(), loadStats()]);
}

/* ── SHIMMER SKELETON ── */
function showSkeleton(rows = 8) {
    const tbody = document.getElementById('tbody');
    if (!tbody) return;
    tbody.innerHTML = Array.from({length: rows}, (_, i) => `
        <tr class="shimmer-row" style="animation-delay:${i * 0.04}s">
            <td><div class="shimmer-block" style="width:36px;height:36px;border-radius:10px;"></div></td>
            <td><div class="shimmer-block" style="width:${60 + (i%3)*20}px;"></div></td>
            <td><div class="shimmer-block" style="width:${80 + (i%4)*25}px;"></div></td>
            <td><div class="shimmer-block" style="width:70px;"></div></td>
            <td><div class="shimmer-block" style="width:80px;"></div></td>
            <td><div style="display:flex;align-items:center;gap:8px;">
                <div class="shimmer-circle"></div>
                <div class="shimmer-block" style="width:${60 + (i%3)*20}px;"></div>
            </div></td>
            <td><div class="shimmer-block" style="width:60px;height:22px;border-radius:11px;"></div></td>
            <td><div class="shimmer-block" style="width:28px;height:28px;border-radius:8px;"></div></td>
        </tr>`).join('');
}

/* ── LOAD ITEMS ── */
async function load() {
    const p = new URLSearchParams();
    if (F.status) p.append('status', F.status);
    if (F.room) p.append('room', F.room);
    if (F.category) p.append('category', F.category);
    if (F.employee) p.append('employee', F.employee);
    showSkeleton();
    try {
        const response = await fetch('/api/items?' + p);
        items = await response.json();
        curPage = 0;
        render();
    } catch(e) {
        console.error("Load items error:", e);
        const tbody = document.getElementById('tbody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text3);font-size:14px;">Ошибка загрузки данных. Обновите страницу.</td></tr>`;
    }
}

/* ── RENDER TABLE ── */
function render() {
    let flt = Q ? items.filter(i =>
        [i.inv_num, i.model, i.employee, i.place, i.room, i.category].join(' ').toLowerCase().includes(Q.toLowerCase())
    ) : items;
    if (F.condition) flt = flt.filter(i => i.condition === F.condition);
    const start = curPage * PER;
    const slice = flt.slice(start, start + PER);
    const isEmpty = !flt.length;

    const emptyDesk = document.getElementById('empty-desk');
    if (emptyDesk) emptyDesk.style.display = isEmpty ? 'block' : 'none';
    
    const tbody = document.getElementById('tbody');
    if (tbody) {
        tbody.innerHTML = slice.map(i => {
            const photo = i.photo ? `<img src="/static/photos/${i.photo}" class="asset-thumb">` : `<div class="asset-icon-box">${getCatIcon(i.category, 24)}</div>`;
            return `
            <tr onclick="openEdit(${i.id})" class="fade-in">
                <td>${photo}</td>
                <td><span class="inv-tag">${i.inv_num}</span></td>
                <td style="font-weight:600;">${i.model || '—'}</td>
                <td style="font-size:13px; color:var(--text2);">${i.category}</td>
                <td style="font-size:13px;">${i.room}</td>
                <td>
                    ${i.employee && i.employee !== '—' ? `
                        <div style="display:flex; align-items:center; gap:8px;">
                            <div style="width:24px; height:24px; border-radius:50%; background:var(--accent); color:#fff; font-size:10px; font-weight:800; display:flex; align-items:center; justify-content:center;">${i.employee[0].toUpperCase()}</div>
                            <span style="font-size:13px; font-weight:500;">${i.employee}</span>
                        </div>
                    ` : '<span style="color:var(--text3);">—</span>'}
                </td>
                <td><span class="status-badge ${SM[i.status] || 'chip-free'}"><span class="chip-dot"></span>${i.status}</span></td>
                <td style="text-align:right;">
                    <button class="btn btn-secondary btn-xs" onclick="event.stopPropagation();openEdit(${i.id})">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                </td>
            </tr>`;
        }).join('');
    }

    // Mobile cards
    const cl = document.getElementById('card-list');
    const emMob = document.getElementById('empty-mob');
    const isMobile = window.innerWidth <= 640;
    if (cl) {
        if (isMobile && !isEmpty) {
            cl.innerHTML = slice.map(i => `
            <div class="item-mob-card fade-in" onclick="openEdit(${i.id})">
                <div style="display:flex;align-items:center;justify-content:center;margin-right:12px;">${getCatIcon(i.category, 36)}</div>
                <div class="item-mob-body">
                    <div class="item-mob-inv">${i.inv_num}</div>
                    <div class="item-mob-name">${i.model || i.category}</div>
                    <div class="item-mob-meta">${i.room} · ${i.place}</div>
                    <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;">
                        <span class="chip ${SM[i.status] || 'chip-free'}" style="font-size:11px;"><span class="chip-dot"></span>${i.status}</span>
                        <span class="chip ${CM[i.condition] || 'chip-good'}" style="font-size:11px;"><span class="chip-dot"></span>${i.condition}</span>
                    </div>
                </div>
            </div>`).join('');
            cl.classList.add('mob-visible');
            if (emMob) emMob.style.display = 'none';
        } else {
            cl.innerHTML = '';
            cl.classList.remove('mob-visible');
            if (emMob) emMob.style.display = (isMobile && isEmpty) ? 'block' : 'none';
        }
    }

    renderPager(flt.length);
}

function renderPager(total) {
    const pages = Math.ceil(total / PER);
    ['pager-desk', 'pager-mob'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (pages <= 1) { el.style.display = 'none'; return; }
        el.style.display = 'flex';
        let html = '';
        if (curPage > 0) html += `<button class="pager-btn" onclick="goPage(${curPage - 1})">‹</button>`;
        const s = Math.max(0, curPage - 2), e = Math.min(pages, curPage + 3);
        if (s > 0) html += `<button class="pager-btn" onclick="goPage(0)">1</button>${s > 1 ? '<span class="pager-info">…</span>' : ''}`;
        for (let i = s; i < e; i++) html += `<button class="pager-btn${i === curPage ? ' on' : ''}" onclick="goPage(${i})">${i + 1}</button>`;
        if (e < pages) html += `${e < pages - 1 ? '<span class="pager-info">…</span>' : ''}<button class="pager-btn" onclick="goPage(${pages - 1})">${pages}</button>`;
        if (curPage < pages - 1) html += `<button class="pager-btn" onclick="goPage(${curPage + 1})">›</button>`;
        html += `<span class="pager-info">${total} записей</span>`;
        el.innerHTML = html;
    });
}

function goPage(n) { curPage = n; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function doSearch(v) { Q = v; curPage = 0; const clear = document.getElementById('search-clear'); if(clear) clear.style.display = v ? 'block' : 'none'; render(); }
function clearSearch() { const inp = document.getElementById('search-input'); if(inp) inp.value = ''; doSearch(''); }

function updateActiveHint() {
    const hint = document.getElementById('sb-active-hint');
    if (!hint) return;
    const active = [F.status, F.room, F.category, F.condition, F.employee].filter(Boolean);
    if (active.length) {
        const labels = [F.status, F.room, F.category, F.condition, F.employee].filter(Boolean);
        const txt = document.getElementById('sb-active-txt');
        if (txt) txt.textContent = labels.join(' · ');
        hint.classList.add('show');
    } else {
        hint.classList.remove('show');
    }
}
function resetAllFilters() {
    F = { status: '', room: '', category: '', employee: '', condition: '' };
    Q = ''; const si = document.getElementById('search-input'); if(si) si.value = '';
    const sc = document.getElementById('search-clear'); if(sc) sc.style.display = 'none';
    document.querySelectorAll('.sb-btn,.emp-row').forEach(b => b.classList.remove('active'));
    document.querySelector('#sb-all')?.classList.add('active');
    document.getElementById('chart-filter')?.classList.remove('show');
    document.getElementById('sb-active-hint')?.classList.remove('show');
    curPage = 0; load();
}

function setF(k, v, el) {
    F[k] = v;
    const sec = el.closest('.sb-section');
    if (sec) sec.querySelectorAll('.sb-btn,.emp-row').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    if (k !== 'employee') F.employee = '';
    if (k !== 'condition') F.condition = '';
    curPage = 0;
    updateActiveHint();
    load();
    if (window.innerWidth <= 768) closeSidebar();
}

function setEmp(name, el) {
    F.employee = F.employee === name ? '' : name;
    document.querySelectorAll('.emp-row').forEach(r => r.classList.remove('active'));
    if (F.employee && el) el.classList.add('active');
    curPage = 0; load(); closeSidebar();
}
function setCond(val, el) {
    F.condition = F.condition === val ? '' : val;
    document.querySelectorAll('.cond-btn').forEach(b => b.classList.remove('active'));
    if (F.condition) el.classList.add('active');
    curPage = 0; render();
}

function updateGreeting() {
    const h = new Date().getHours();
    const name = (window.CURRENT_USER?.name || "Гость").split(' ')[0];
    let g = "Добрый вечер";
    if (h < 5) g = "Доброй ночи";
    else if (h < 12) g = "Доброе утро";
    else if (h < 17) g = "Добрый день";
    const msg = document.getElementById('welcome-msg');
    if (msg) msg.textContent = `${g}, ${name}!`;
    const time = document.getElementById('current-time');
    if (time) time.textContent = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
}

async function loadStats() {
    try {
        const s = await (await fetch('/api/stats')).json();
        if (!s) return;

        const stats = {
            total: s.total || 0,
            occupied: s.occupied || 0,
            free: s.free || 0,
            broken: s.repair || s.broken || 0
        };
        
        if (document.getElementById('s-total')) {
            animateNumber(document.getElementById('s-total'), 0, stats.total, 800);
            animateNumber(document.getElementById('s-occ'), 0, stats.occupied, 800);
            animateNumber(document.getElementById('s-broken'), 0, stats.broken, 800);
        }
        if (document.getElementById('emp-total')) {
            animateNumber(document.getElementById('emp-total'), 0, stats.total, 800);
        }

        if (document.getElementById('dash-exec')) {
            try {
                const a = await (await fetch('/api/analytics')).json();
                const valEl = document.getElementById('exec-val');
                if (valEl) valEl.textContent = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(a.total_value);
                if (document.getElementById('exec-docs')) animateNumber(document.getElementById('exec-docs'), 0, a.pending_docs, 800);
                if (document.getElementById('exec-total')) animateNumber(document.getElementById('exec-total'), 0, stats.total, 800);
                
                const toxicEl = document.getElementById('toxic-list');
                if (toxicEl) {
                    toxicEl.innerHTML = a.toxic_assets.map(x => `
                        <div class="mini-list-item">
                            <div class="mli-ico" style="background:rgba(255,69,58,0.1); color:var(--ios-red);">!</div>
                            <div class="mli-body">
                                <b>${x.model}</b><span>${x.inv_num} · ${x.repair_count} ремонтов</span>
                            </div>
                        </div>
                    `).join('') || '<div class="empty-mini">Проблемных активов нет</div>';
                }

                const eolEl = document.getElementById('eol-list');
                if (eolEl) {
                    eolEl.innerHTML = a.eol_assets.map(x => `
                        <div class="mini-list-item">
                            <div class="mli-ico" style="background:rgba(255,149,0,0.1); color:var(--ios-orange);">⏳</div>
                            <div class="mli-body">
                                <b>${x.model}</b><span>${x.inv_num} · Куплен ${x.purchase_date}</span>
                            </div>
                        </div>
                    `).join('') || '<div class="empty-mini">Устаревшей техники нет</div>';
                }
                buildExecCharts(a);
            } catch (e) { console.error("Exec stats error:", e); }
        }

        ['c-all', 'c-occ', 'c-free'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = s[id.split('-')[1]] || s.total || 0;
        });

        const docsB = document.getElementById('c-docs');
        if (docsB) {
            docsB.textContent = s.pending_docs || 0;
            docsB.style.display = (parseInt(docsB.textContent) > 0) ? 'inline-flex' : 'none';
        }

        const roomEl = document.getElementById('room-list');
        if (roomEl && s.rooms) {
            roomEl.innerHTML = s.rooms.map((r, i) =>
                `<button class="sb-btn${F.room === r ? ' active' : ''}" onclick="setF('room','${r.replace(/'/g, "\\'")}',this)">
                    ${getLetterBadge(r, PALETTE[i % PALETTE.length])}
                    <span>${r}</span>
                </button>`).join('') || '<div style="font-size:12px;color:var(--text3);padding:4px 10px;">Нет кабинетов</div>';
        }

        const catEl = document.getElementById('cat-list');
        if (catEl && s.by_cat) {
            catEl.innerHTML = s.by_cat.map(c =>
                `<button class="sb-btn${F.category === c.category ? ' active' : ''}" onclick="setF('category','${c.category}',this)">
                    ${getCatIcon(c.category, 22, true)}
                    <span style="flex:1;text-align:left;">${c.category}</span>
                    <span class="sb-count">${c.cnt}</span>
                </button>`).join('');
        }

        const condEl = document.getElementById('cond-list');
        if (condEl && s.by_condition) {
            condEl.innerHTML = s.by_condition.length 
                ? s.by_condition.map(c =>
                    `<button class="sb-btn cond-btn${F.condition === c.condition ? ' active' : ''}" onclick="setCond('${c.condition}',this)">
                        <span class="chip ${CM[c.condition] || 'chip-good'}" style="font-size:11px;padding:2px 6px;"><span class="chip-dot"></span></span><span>${c.condition}</span><span class="sb-count">${c.cnt}</span>
                    </button>`).join('')
                : '<div style="font-size:12px;color:var(--text3);padding:4px 10px;">Нет данных</div>';
        }

        const empEl = document.getElementById('emp-list');
        if (empEl && s.employees) {
            empEl.innerHTML = s.employees.length
                ? s.employees.map((e, i) => {
                    const colors = ['#007AFF', '#AF52DE', '#34C759', '#FF9500', '#5856D6'];
                    return `<div class="emp-row${F.employee === e.name ? ' active' : ''}" onclick="setEmp('${e.name.replace(/'/g, "\\'")}',this)" style="cursor:pointer;">
                        <div class="emp-ava" style="background:${colors[i % 5]};">${e.name[0].toUpperCase()}</div>
                        <span class="emp-name">${e.name}</span>
                        <span class="emp-cnt">${e.count}</span>
                    </div>`;
                }).join('')
                : '<div style="font-size:12px;color:var(--text3);padding:4px 10px;">Нет сотрудников</div>';
        }

        updateGreeting();
        if (document.getElementById('dash-admin')) buildCharts(s);
    } catch (e) { console.error("Stats load error:", e); }
}

async function verifyItem(id, btn) {
    const icon = btn.innerHTML;
    btn.disabled = true; btn.innerHTML = '<svg class="spin" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>';
    try {
        const r = await fetch(`/api/items/${id}/verify`, { method: 'POST' });
        const d = await r.json();
        if (d.ok) {
            toast('Наличие подтверждено ✓', 'ok');
            btn.style.background = 'var(--ios-green)';
            btn.style.color = '#fff';
            btn.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
            setTimeout(() => { btn.disabled = false; btn.style.background = ''; btn.style.color = ''; btn.innerHTML = icon; }, 2000);
        } else { toast(d.error || 'Ошибка', 'err'); btn.disabled = false; btn.innerHTML = icon; }
    } catch(e) { toast('Ошибка связи', 'err'); btn.disabled = false; btn.innerHTML = icon; }
}

function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ||
        (!document.documentElement.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme:dark)').matches);
}

function buildCharts(s) {
    if (typeof Chart === 'undefined') return;
    const dark = isDark();
    const txtClr = dark ? '#94A3B8' : '#4B5563';
    const gridClr = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

    const catCanvas = document.getElementById('chartCat');
    if (catCanvas && s.by_cat.length) {
        if (chartCat) chartCat.destroy();
        chartCat = new Chart(catCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: s.by_cat.map(c => c.category),
                datasets: [{
                    data: s.by_cat.map(c => c.cnt),
                    backgroundColor: PALETTE,
                    borderWidth: 0, hoverOffset: 12, borderRadius: 4
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '62%',
                plugins: { legend: { position: 'right', labels: { color: txtClr, font: { size: 10 } } } },
                onClick: (_evt, el) => {
                    if (!el.length) return;
                    const cat = s.by_cat[el[0].index].category;
                    F.category = F.category === cat ? '' : cat;
                    if (F.category) setChartFilter(`Категория: ${cat}`); else clearChartFilter();
                }
            }
        });
    }

    const roomCanvas = document.getElementById('chartRoom');
    if (roomCanvas && s.rooms.length) {
        const roomCounts = {};
        items.forEach(i => roomCounts[i.room] = (roomCounts[i.room] || 0) + 1);
        const top = Object.entries(roomCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
        if (chartRoom) chartRoom.destroy();
        chartRoom = new Chart(roomCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: top.map(r => r[0]),
                datasets: [{ data: top.map(r => r[1]), backgroundColor: PALETTE.map(c => c + 'CC'), borderRadius: 8 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: txtClr, font: { size: 10 } }, grid: { display: false } },
                    y: { beginAtZero: true, ticks: { color: txtClr, font: { size: 10 } }, grid: { color: gridClr } }
                },
                onClick: (_evt, el) => {
                    if (!el.length) return;
                    const room = top[el[0].index][0];
                    F.room = F.room === room ? '' : room;
                    if (F.room) setChartFilter(`Кабинет: ${room}`); else clearChartFilter();
                }
            }
        });
    }
}

function buildExecCharts(a) {
    if (typeof Chart === 'undefined') return;
    const dark = isDark();
    const txtClr = dark ? '#94A3B8' : '#4B5563';
    const gridClr = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

    const deptCanvas = document.getElementById('chartDeptSpend');
    if (deptCanvas && a.dept_spending.length) {
        if (chartDeptSpend) chartDeptSpend.destroy();
        chartDeptSpend = new Chart(deptCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: a.dept_spending.map(d => d.department),
                datasets: [{ label: 'Инвестиции ($)', data: a.dept_spending.map(d => d.spent), backgroundColor: PALETTE[0] + 'CC', borderRadius: 10 }]
            },
            options: {
                indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: txtClr, font: { size: 10 } }, grid: { color: gridClr } },
                    y: { ticks: { color: txtClr, font: { size: 11 } }, grid: { display: false } }
                }
            }
        });
    }

    const actCanvas = document.getElementById('chartActivity');
    if (actCanvas && a.activity_30d.length) {
        if (chartActivity) chartActivity.destroy();
        chartActivity = new Chart(actCanvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: a.activity_30d.map(d => d.day.split('-').slice(1).join('.')),
                datasets: [{ data: a.activity_30d.map(d => d.cnt), borderColor: PALETTE[5], backgroundColor: PALETTE[5] + '20', fill: true, tension: 0.4, pointRadius: 2 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: txtClr, font: { size: 9 }, maxRotation: 0 }, grid: { display: false } },
                    y: { beginAtZero: true, ticks: { color: txtClr, font: { size: 10 } }, grid: { color: gridClr } }
                }
            }
        });
    }
}

function setChartFilter(txt) {
    const f = document.getElementById('chart-filter');
    if (f) {
        f.classList.add('show');
        const ft = document.getElementById('chart-filter-txt');
        if (ft) ft.textContent = 'Фильтр: ' + txt;
    }
}
function clearChartFilter() {
    F.category = ''; F.room = '';
    document.getElementById('chart-filter')?.classList.remove('show');
    document.querySelectorAll('.sb-btn,.emp-row').forEach(b => b.classList.remove('active'));
    document.querySelector('.sb-btn#sb-all')?.classList.add('active');
    load();
}

/* ── NOTIFICATIONS ── */
let lastNotifFetch = 0;
async function toggleNotif() {
    const panel = document.getElementById('notif-panel');
    const now = Date.now();
    if (!panel) return;
    panel.classList.toggle('open');
    if (panel.classList.contains('open') && (!notifLoaded || (now - lastNotifFetch > 60000))) {
        notifLoaded = true;
        lastNotifFetch = now;
        try {
            const resp = await (await fetch('/api/notifications')).json();
            const notes = Array.isArray(resp) ? resp : (resp.items || []);
            const list = document.getElementById('notif-list');
            if (!list) return;
            if (!notes.length) {
                list.innerHTML = '<div class="notif-empty">Нет новых уведомлений</div>';
                return;
            }
            const dot = document.getElementById('notif-dot');
            if (dot) dot.classList.add('show');
            const icons = {repair:'🔧', docs:'📄', audit:'⏰'};
            const colors = {repair:'rgba(255,149,0,.15)', docs:'rgba(0,122,255,.15)', audit:'rgba(255,59,48,.12)'};
            list.innerHTML = notes.map(n => `<div class="notif-item" onclick="window.location='${n.type==='repair'?'/maintenance':n.type==='docs'?'/documents':'/inventory'}'" style="cursor:pointer;"><div class="notif-ico" style="background:${colors[n.type]||'rgba(255,149,0,.1)'}">${icons[n.type]||'🔔'}</div><div class="notif-text"><b>${n.label}</b><span>${n.count} шт. — нажмите чтобы перейти</span></div></div>`).join('');
        } catch(e) {
            const l = document.getElementById('notif-list');
            if(l) l.innerHTML = '<div class="notif-empty">Ошибка загрузки</div>';
            notifLoaded = false;
        }
    }
}
document.addEventListener('click', e => {
    if (!document.querySelector('.notif-wrap')?.contains(e.target)) {
        notifLoaded = false;
        document.getElementById('notif-panel')?.classList.remove('open');
    }
});

/* ── ADD WIZARD ── */
let addStep = 1, bulkMode = false, bulkRows = [];
function openAdd() {
    addStep = 1; bulkMode = false; bulkRows = [];
    const fields = ['a-model', 'a-serial', 'a-notes', 'a-place', 'a-room', 'a-emp'];
    fields.forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
    });
    const aCat = document.getElementById('a-cat');
    if (aCat && window.CATS && window.CATS.length) aCat.value = window.CATS[0];
    const aCond = document.getElementById('a-cond');
    if (aCond) aCond.value = 'Хорошее';
    const aPhoto = document.getElementById('a-photo');
    if (aPhoto) aPhoto.value = '';
    const pl = document.getElementById('photo-label');
    if (pl) pl.textContent = 'Нажмите для фото';
    const br = document.getElementById('bulk-rows');
    if (br) br.innerHTML = '';
    const bs = document.getElementById('bulk-section');
    if (bs) bs.style.display = 'none';
    showStep(1);
    document.getElementById('m-add')?.classList.add('open');
    setTimeout(() => document.getElementById('a-place')?.focus(), 300);
}
function showStep(n) {
    addStep = n;
    [1, 2, 3].forEach(i => {
        const st = document.getElementById('step-' + i);
        const sp = document.getElementById('sp-' + i);
        if (st) st.style.display = i === n ? 'block' : 'none';
        if (sp) sp.classList.toggle('on', i === n);
    });
    const sub = document.getElementById('add-sub');
    if (sub) sub.textContent = ['', 'Шаг 1 — Место и сотрудник', 'Шаг 2 — Техника', 'Шаг 3 — Детали'][n];
    const prev = document.getElementById('btn-prev');
    if (prev) prev.style.display = n > 1 ? 'inline-flex' : 'none';
    const bt = document.getElementById('btn-bulk-toggle');
    if (bt) bt.style.display = n === 2 ? 'inline-flex' : 'none';
    const nextBtn = document.getElementById('btn-next');
    if (nextBtn) nextBtn.textContent = n === 3 ? '✓ Сохранить' : 'Далее →';
}
async function nextStep() {
    const sheet = document.querySelector('#m-add .sheet');
    if (addStep === 1) {
        if (!document.getElementById('a-place').value.trim() || !document.getElementById('a-room').value.trim()) {
            if (sheet) { sheet.classList.remove('shake'); void sheet.offsetWidth; sheet.classList.add('shake'); }
            return toast('Заполни Место и Кабинет', 'err');
        }
        showStep(2);
        setTimeout(() => {
            if (bulkMode) {
                const firstInput = document.querySelector('.bulk-row input');
                if(firstInput) firstInput.focus();
            } else {
                document.getElementById('a-cat')?.focus();
            }
        }, 100);
    } else if (addStep === 2) {
        if (bulkMode) {
            if (bulkRows.length === 0) {
                if (sheet) { sheet.classList.remove('shake'); void sheet.offsetWidth; sheet.classList.add('shake'); }
                return toast('Добавьте хотя бы одну строку', 'err');
            }
        } else {
            if (!document.getElementById('a-model').value.trim()) {
                if (sheet) { sheet.classList.remove('shake'); void sheet.offsetWidth; sheet.classList.add('shake'); }
                return toast('Введите модель', 'err');
            }
        }
        showStep(3);
        setTimeout(() => document.getElementById('a-notes')?.focus(), 100);
    } else {
        await saveAdd();
    }
}
function prevStep() { if (addStep > 1) showStep(addStep - 1); }
async function saveAdd() {
    const common = {
        place: document.getElementById('a-place').value.trim(),
        room: document.getElementById('a-room').value.trim(),
        employee: document.getElementById('a-emp').value.trim() || '—',
        condition: document.getElementById('a-cond').value,
        notes: document.getElementById('a-notes').value.trim(),
    };

    try {
        let r;
        if (bulkMode) {
            const payload = {
                ...common,
                items: bulkRows.map(id => ({
                    model: document.getElementById(`bm-${id}`).value.trim(),
                    category: document.getElementById(`bc-${id}`).value,
                    serial_num: document.getElementById(`bs-${id}`).value.trim() || '—',
                    condition: common.condition,
                    notes: common.notes
                })).filter(i => i.model)
            };
            if (payload.items.length === 0) return toast('Нет данных для сохранения', 'err');
            
            r = await fetch('/api/items/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            const fd = new FormData();
            Object.entries(common).forEach(([k, v]) => fd.append(k, v));
            fd.append('category', document.getElementById('a-cat').value);
            fd.append('model', document.getElementById('a-model').value.trim());
            fd.append('serial_num', document.getElementById('a-serial').value.trim() || '—');
            
            const ph = document.getElementById('a-photo').files[0];
            if (ph) fd.append('photo', ph);
            
            r = await fetch('/api/items', { method: 'POST', body: fd });
        }

        const res = await r.json();
        if (r.ok) {
            toast(bulkMode ? `Добавлено ${bulkRows.length} ед. техники` : 'Добавлено', 'ok');
            closeM('m-add');
            refresh();
        } else {
            toast(res.error || 'Ошибка при сохранении', 'err');
        }
    } catch (e) { toast('Ошибка сети или сервера', 'err'); }
}

function toggleBulk() {
    bulkMode = !bulkMode;
    document.getElementById('bulk-section').style.display = bulkMode ? 'block' : 'none';
    document.getElementById('step-2-single').style.display = bulkMode ? 'none' : 'block';
    const bt = document.getElementById('btn-bulk-toggle');
    if (bt) bt.textContent = bulkMode ? '← Одиночное добавление' : 'Массовое добавление';
    if (bulkMode && !bulkRows.length) addBulkRow();
}
function addBulkRow() {
    const id = Date.now(); bulkRows.push(id);
    const div = document.createElement('div'); div.className = 'bulk-row'; div.id = 'br-' + id;
    const catsHtml = (window.CATS || []).map(c => `<option>${c}</option>`).join('');
    div.innerHTML = `<input class="ios-input" placeholder="Модель" id="bm-${id}" style="font-size:14px;">
    <select class="ios-input ios-select" id="bc-${id}" style="font-size:14px;">${catsHtml}</select>
    <input class="ios-input" placeholder="Серийный №" id="bs-${id}" style="font-size:14px;">
    <button type="button" class="del-btn" onclick="removeBulkRow(${id})"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>`;
    document.getElementById('bulk-rows')?.appendChild(div);
}
function removeBulkRow(id) { bulkRows = bulkRows.filter(x => x !== id); document.getElementById('br-' + id)?.remove(); }

/* ── EDIT ── */
async function openEdit(id) {
    const i = items.find(x => x.id === id); if (!i) return;
    const eId = document.getElementById('e-id'); if(eId) eId.value = id;
    const sub = document.getElementById('edit-sub'); if(sub) sub.textContent = i.inv_num + ' · ' + i.category;
    ['place', 'room', 'category', 'model', 'serial_num', 'employee', 'status', 'condition', 'notes'].forEach(f => {
        const el = document.getElementById('e-' + f.replace('_', '-'));
        if (el) el.value = i[f] || (f === 'status' ? 'Свободно' : f === 'condition' ? 'Хорошее' : '');
    });
    const eSerial = document.getElementById('e-serial'); if(eSerial) eSerial.value = i.serial_num || '—';
    const eEmp = document.getElementById('e-emp'); if(eEmp) eEmp.value = i.employee && i.employee !== '—' ? i.employee : '';
    const qrImg = document.getElementById('qr-img'); if(qrImg) qrImg.src = '/api/qr/' + encodeURIComponent(i.inv_num) + '?t=' + Date.now();
    const invLab = document.getElementById('qr-inv-label'); if(invLab) invLab.textContent = i.inv_num;
    const qrLink = document.getElementById('qr-link'); if(qrLink) qrLink.href = '/asset/' + i.inv_num;
    loadItemHistory(id);
    document.getElementById('m-edit')?.classList.add('open');
}
async function loadItemHistory(id) {
    try {
        const data = await (await fetch('/api/items/' + id + '/history')).json();
        const el = document.getElementById('item-hist-list');
        const wrap = document.getElementById('item-history');
        if (!el || !wrap) return;
        if (!data || !data.length) { wrap.style.display = 'none'; return; }
        wrap.style.display = 'block';
        el.innerHTML = data.slice(0, 8).map(h => `
        <div style="display:flex;gap:10px;padding:9px 0;border-bottom:.5px solid var(--separator2);">
            <div style="width:28px;height:28px;border-radius:50%;background:var(--surface2);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;color:var(--text3);">●</div>
            <div style="flex:1;">
                <div style="font-size:13px;font-weight:500;">${h.action}</div>
                ${h.field ? `<div style="font-size:11px;color:var(--text2);">${h.field}: ${h.old_val || '∅'} → ${h.new_val || '∅'}</div>` : ''}
                <div style="font-size:11px;color:var(--text3);margin-top:2px;">${h.user_name || '?'} · ${fmtDate(h.ts)}</div>
            </div>
        </div>`).join('');
    } catch { }
}
function fmtDate(s) { if (!s) return '—'; try { return new Date(s.replace(' ', 'T') + 'Z').toLocaleString('ru', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch { return s; } }

async function saveEdit() {
    const id = document.getElementById('e-id').value;
    const d = {
        place: document.getElementById('e-place').value,
        room: document.getElementById('e-room').value,
        category: document.getElementById('e-cat').value,
        model: document.getElementById('e-model').value,
        serial_num: document.getElementById('e-serial').value,
        employee: document.getElementById('e-emp').value || '—',
        status: document.getElementById('e-status').value,
        condition: document.getElementById('e-cond').value,
        notes: document.getElementById('e-notes').value,
    };
    await fetch('/api/items/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) });
    closeM('m-edit'); toast('Сохранено ✓', 'ok'); refresh();
}
async function delItem() {
    if (!confirm('Удалить эту запись?')) return;
    const id = document.getElementById('e-id').value;
    await fetch('/api/items/' + id, { method: 'DELETE' });
    closeM('m-edit'); toast('Удалено', 'ok'); refresh();
}

/* ── MODALS ── */
function openM(id) { document.getElementById(id)?.classList.add('open'); }
function closeM(id) { document.getElementById(id)?.classList.remove('open'); }
document.querySelectorAll('.overlay').forEach(o => o.addEventListener('click', e => { 
    if (e.target === o && e.target.id !== 'm-add' && e.target.id !== 'm-edit') {
        o.classList.remove('open'); 
    }
}));
document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); });

/* ── IMPORT ── */
let importFile = null;
function openImport() { 
    importFile = null; 
    const btn = document.getElementById('imp-btn'); if(btn) btn.disabled = true;
    const res = document.getElementById('imp-result'); if(res) res.style.display = 'none';
    const fl = document.getElementById('imp-file'); if(fl) fl.value = '';
    const dt = document.getElementById('drop-txt'); if(dt) dt.textContent = 'Нажми или перетащи .xlsx файл';
    openM('m-import'); 
}
function handleFileSelect(f) { if (!f) return; importFile = f; const btn = document.getElementById('imp-btn'); if(btn) btn.disabled = false; const dt = document.getElementById('drop-txt'); if(dt) dt.textContent = '📄 ' + f.name; }
function handleDrop(e) { e.preventDefault(); document.getElementById('drop-zone')?.classList.remove('drag'); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }
async function doImport() {
    if (!importFile) return;
    const btn = document.getElementById('imp-btn'); if(btn) { btn.disabled = true; btn.textContent = 'Импортирую…'; }
    const fd = new FormData(); fd.append('file', importFile);
    try {
        const r = await (await fetch('/api/items/import', { method: 'POST', body: fd })).json();
        const res = document.getElementById('imp-result'); if(res) res.style.display = 'block';
        if (r.ok) {
            if(res) res.innerHTML = `<span style="color:var(--ios-green);">✓ Импортировано: ${r.imported} записей</span>${r.errors.length ? `<br><span style="color:var(--ios-orange);">⚠ ${r.errors.slice(0, 3).join('; ')}</span>` : ''}`;
            toast(`Импортировано ${r.imported} записей`, 'ok'); refresh();
        } else { if(res) res.innerHTML = `<span style="color:var(--ios-red);">✕ ${r.error}</span>`; }
    } catch(e) { toast('Ошибка импорта', 'err'); }
    if(btn) { btn.disabled = false; btn.textContent = 'Импортировать'; }
}

/* ── UTILS ── */
function exportExcel() { window.location = '/api/export'; }
async function doLogout() { 
    sessionStorage.removeItem('tracko_splash_shown');
    await fetch('/api/auth/logout', { method: 'POST' }); 
    window.location = '/login'; 
}
/* ── UNIFIED TOAST SYSTEM ── */
function toast(msg, type = 'ok') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position:fixed;top:24px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;width:100%;max-width:380px;padding:0 20px;';
        document.body.appendChild(container);
        
        const style = document.createElement('style');
        style.textContent = `
            .t-msg {
                background: rgba(255, 255, 255, 0.85);
                backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
                border: .5px solid rgba(0,0,0,0.08);
                border-radius: 18px; padding: 12px 18px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.08);
                display: flex; align-items: center; gap: 12px;
                animation: t-in 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                pointer-events: auto;
            }
            [data-theme="dark"] .t-msg {
                background: rgba(44, 44, 46, 0.9);
                border-color: rgba(255,255,255,0.1);
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            }
            .t-icon { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .t-ok .t-icon { background: #34C759; color: #fff; }
            .t-err .t-icon { background: #FF3B30; color: #fff; }
            .t-text { font-size: 14px; font-weight: 600; color: var(--text); }
            @keyframes t-in { from { opacity: 0; transform: translateY(-20px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
            @keyframes t-out { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.9); } }
            .t-hide { animation: t-out 0.3s ease-in forwards !important; }
        `;
        document.head.appendChild(style);
    }

    const el = document.createElement('div');
    el.className = `t-msg t-${type}`;
    const icon = type === 'ok' ? '✓' : '✕';
    el.innerHTML = `<div class="t-icon">${icon}</div><div class="t-text">${msg}</div>`;
    container.appendChild(el);

    setTimeout(() => {
        el.classList.add('t-hide');
        setTimeout(() => el.remove(), 300);
    }, 3500);
}

/* ── QR LIGHTBOX ── */
let _qrCurrentInv = '';
function openQrZoom() {
    const inv = document.getElementById('qr-inv-label')?.textContent;
    if (!inv) return;
    _qrCurrentInv = inv;
    const qrUrl = `/api/qr/${encodeURIComponent(inv)}?sz=high&t=${Date.now()}`;
    const lb = document.getElementById('qr-lb');
    const inner = document.getElementById('qr-lb-inner');
    if(!lb || !inner) return;
    
    document.getElementById('lb-qr-img').src = qrUrl;
    document.getElementById('lb-qr-inv').textContent = inv;
    const item = items.find(x => x.inv_num === inv);
    document.getElementById('lb-qr-name').textContent = item ? (item.model || item.category) : '';
    document.getElementById('lb-qr-room').textContent = item ? (item.room + (item.employee && item.employee !== '—' ? ' · ' + item.employee : '')) : '';
    document.getElementById('lb-qr-link').href = `/asset/${encodeURIComponent(inv)}`;
    document.getElementById('lb-qr-dl').href = qrUrl;
    document.getElementById('lb-qr-dl').download = `QR-${inv}.png`;
    
    lb.style.opacity = '0'; lb.style.pointerEvents = 'all';
    lb.style.display = 'flex';
    requestAnimationFrame(() => {
        lb.style.opacity = '1';
        inner.style.transform = 'scale(1)';
    });
}
function closeQrLb() {
    const lb = document.getElementById('qr-lb');
    const inner = document.getElementById('qr-lb-inner');
    if(!lb || !inner) return;
    lb.style.opacity = '0';
    inner.style.transform = 'scale(.85)';
    setTimeout(() => { lb.style.display = 'none'; lb.style.pointerEvents = 'none'; }, 280);
}

/* ── PRINT SINGLE QR ── */
function printCurrentQr() {
    const inv = document.getElementById('qr-inv-label')?.textContent;
    if (!inv) return;
    window.open(`/qr-print?inv=${encodeURIComponent(inv)}`, '_blank');
}

/* ── TRANSFER LOGIC ── */
let _trItemId = null, _trTarget = null, _allUsers = [];
async function _loadUsers() {
    if (_allUsers.length) return;
    try { _allUsers = await (await fetch('/api/users/active')).json(); }
    catch(e) { _allUsers = []; }
}
async function openTransfer() {
    const id = parseInt(document.getElementById('e-id').value);
    if (!id) return;
    const item = items.find(x => x.id === id);
    if (!item) return;
    _trItemId = id; _trTarget = null;
    document.getElementById('tr-item-name').textContent = (item.model || item.category) + ' · ' + item.inv_num;
    document.getElementById('tr-item-cur').textContent = 'Сейчас: ' + (item.employee && item.employee !== '—' ? item.employee : 'Свободно');
    document.getElementById('tr-sub').textContent = item.inv_num + ' — выберите нового ответственного';
    document.getElementById('tr-note').value = '';
    document.getElementById('tr-search').value = '';
    document.getElementById('tr-confirm').disabled = true;
    document.querySelectorAll('.transfer-emp-item').forEach(e=>e.classList.remove('selected'));
    await _loadUsers();
    renderTrEmps('');
    closeM('m-edit');
    openM('m-transfer');
}

const _COLORS = ['#007AFF','#AF52DE','#34C759','#FF9500','#5856D6','#5AC8FA','#30B0C7','#7B2FBE'];
function renderTrEmps(q) {
    const list = document.getElementById('tr-emp-list'); if(!list) return;
    let emps = _allUsers.filter(u => ['superadmin','aho','hr','employee','director','deputy','manager'].includes(u.role) && u.active);
    if (q) {
        const lowQ = q.toLowerCase();
        emps = emps.filter(u => u.name.toLowerCase().includes(lowQ) || (u.department||'').toLowerCase().includes(lowQ) || (u.email||'').toLowerCase().includes(lowQ));
    }
    const curItem = items.find(x => x.id === _trItemId);
    if (emps.length === 0) { list.innerHTML = `<div style="padding:40px 20px;text-align:center;color:var(--text3);font-size:13px;">Сотрудники не найдены</div>`; return; }
    list.innerHTML = emps.map((u) => {
        const isSel = _trTarget && _trTarget.id === u.id;
        const isCur = curItem && (curItem.employee_id === u.id || (curItem.employee === u.name && !curItem.employee_id));
        const cnt = items.filter(x => x.employee_id === u.id).length;
        const initial = u.name ? u.name[0].toUpperCase() : '?';
        const color = _COLORS[u.id % _COLORS.length] || _COLORS[0];
        return `<div class="transfer-emp-item${isSel?' selected':''}" id="tei-${u.id}" onclick="pickTrTarget(${u.id},'${u.name.replace(/'/g,"\'")}','${(u.department||'').replace(/'/g,"\'")}')">
            <div class="t-emp-avatar" style="background:${color};">${initial}</div>
            <div style="flex:1;min-width:0;">
                <div class="t-emp-name">${u.name} ${isCur ? '<span style="color:var(--ios-blue);font-weight:400;font-size:11px;">(Текущий)</span>' : ''}</div>
                <div class="t-emp-dept">${u.department || 'Без отдела'}</div>
            </div>
            <div class="t-emp-meta"><div class="t-emp-count">${cnt} ед.</div></div>
        </div>`;
    }).join('');
}
function filterTrEmps(q) { renderTrEmps(q); }
function pickTrTarget(id, name, dept) {
    _trTarget = { id, name, dept };
    document.querySelectorAll('.transfer-emp-item').forEach(e=>e.classList.remove('selected'));
    if (id) document.getElementById('tei-'+id)?.classList.add('selected');
    const conf = document.getElementById('tr-confirm'); if(conf) conf.disabled = false;
}
async function doTransfer() {
    if (!_trItemId || !_trTarget) return;
    const btn = document.getElementById('tr-confirm'); if(!btn) return;
    btn.disabled = true; btn.textContent = 'Передаю…';
    try {
        const r = await fetch('/api/items/'+_trItemId+'/transfer', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ employee_id: _trTarget.id || null, employee_name: _trTarget.name, note: document.getElementById('tr-note').value.trim() })
        });
        const d = await r.json();
        if (d.ok || d.action) { toast(d.action || 'Передано ✓','ok'); closeM('m-transfer'); refresh(); }
        else { toast(d.error||'Ошибка','err'); }
    } catch(e) { toast('Ошибка связи','err'); }
    btn.disabled = false; btn.textContent = 'Подтвердить передачу';
}

/* ── REPAIR REQUEST ── */
let _repPrio = 'low';
function setPrio(p) {
    _repPrio = p;
    ['low','medium','high'].forEach(x => {
        const b = document.getElementById('prio-'+x); if (b) b.className = 'prio-btn' + (x===p ? ' on-'+p : '');
    });
}
function openRepair() {
    const id = parseInt(document.getElementById('e-id').value);
    if (!id) return;
    const item = items.find(x=>x.id===id); if (!item) return;
    document.getElementById('rep-sub').textContent = item.inv_num + ' · ' + (item.model||item.category);
    document.getElementById('rep-desc').value = '';
    setPrio('low');
    closeM('m-edit');
    openM('m-repair');
    setTimeout(()=>document.getElementById('rep-desc')?.focus(),300);
}
async function doRepair() {
    const id = parseInt(document.getElementById('e-id').value);
    const desc = document.getElementById('rep-desc').value.trim();
    if (!desc) { toast('Опишите проблему','err'); return; }
    try {
        const r = await fetch('/api/maintenance',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({item_id:id,description:desc,priority:_repPrio})
        });
        const d = await r.json();
        if (d.ok) { toast('Заявка на ремонт отправлена ✓','ok'); closeM('m-repair'); refresh(); }
        else { toast(d.error||'Ошибка','err'); }
    } catch(e) { toast('Ошибка связи','err'); }
}

/* ── SIDEBAR NAV ── */
function setNavActive(id) {
    document.querySelectorAll('.sb-nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id)?.classList.add('active');
}
function navTo(section) {
    setNavActive('nav-' + section);
    const isDash = (section === 'dashboard');
    const charts = document.querySelector('.charts-row');
    const stats = document.querySelector('.stats-grid');
    const table = document.querySelector('.table-wrap');
    const tool = document.querySelector('.toolbar');
    if (charts) charts.style.display = isDash ? 'grid' : 'none';
    if (stats) stats.style.display = isDash ? 'grid' : 'none';
    if (table) table.style.display = isDash ? 'none' : 'block';
    if (tool) tool.style.display = isDash ? 'none' : 'flex';
    if (window.innerWidth <= 768) closeSidebar();
}
function filterByStatus(status, navId) {
    F.status = status; F.employee = ''; F.room = ''; F.category = ''; F.condition = '';
    curPage = 0; navTo('all'); setNavActive(navId); load();
}
function clearAllFiltersNav() {
    F = { status: '', room: '', category: '', employee: '', condition: '', page: 1, limit: 25 };
    Q = '';
    const si = document.getElementById('search-input'); if (si) si.value = '';
    const sc = document.getElementById('search-clear'); if (sc) sc.style.display = 'none';
    curPage = 0; navTo('all'); load();
}

/* ── UI HELPERS ── */
function animateNumber(elOrId, startOrVal, endVal, duration) {
    const el = (typeof elOrId === 'string') ? document.getElementById(elOrId) : elOrId;
    if (!el) return;
    let from, to, dur;
    if (typeof endVal !== 'undefined') {
        from = startOrVal ?? 0;
        to = endVal;
        dur = duration || 800;
    } else {
        from = parseInt(el.textContent) || 0;
        to = startOrVal;
        dur = 800;
    }
    if (from === to) { el.textContent = to; return; }
    const startTime = performance.now();
    function upd(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / dur, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(from + (to - from) * ease);
        if (progress < 1) requestAnimationFrame(upd);
    }
    requestAnimationFrame(upd);
}

function initClock() {
    const el = document.getElementById('current-time');
    if (!el) return;
    const upd = () => {
        const now = new Date();
        el.textContent = now.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };
    upd(); setInterval(upd, 1000);
}

/* ── SCANNER ── */
let html5QrCode = null;
function openScanner() {
    openM('m-scan');
    const res = document.getElementById('scan-result'); if(res) res.style.display = 'none';
    if (typeof Html5Qrcode === 'undefined') { toast("Сканер не инициализирован", "err"); return; }
    if (!html5QrCode) html5QrCode = new Html5Qrcode("reader");
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    html5QrCode.start({ facingMode: "environment" }, config, (decodedText) => {
        try {
            const url = new URL(decodedText);
            if (url.pathname.startsWith('/asset/')) {
                html5QrCode.stop().then(() => { closeM('m-scan'); window.location = decodedText; });
                return;
            }
        } catch(e) {}
        const resEl = document.getElementById('scan-result');
        if(resEl) { resEl.textContent = "Найдено: " + decodedText; resEl.style.display = 'block'; }
        toast("QR отсканирован", "ok");
    }).catch(err => { console.error(err); toast("Ошибка камеры", "err"); closeScanner(); });
}
function closeScanner() {
    if (html5QrCode && html5QrCode.isScanning) { html5QrCode.stop().then(() => closeM('m-scan')); }
    else closeM('m-scan');
}

/* ── BOOTSTRAP ── */
async function init() {
    const l = localStorage.getItem('tracko-lang') || 'ru';
    const statusEl = document.getElementById('splash-status');
    if(statusEl) {
        const msgs = { ru: 'Загрузка системы...', uz: 'Tizim yuklanmoqda...', en: 'System Loading...' };
        statusEl.textContent = msgs[l] || msgs.ru;
    }

    const splash = document.getElementById('splash');
    if (splash && sessionStorage.getItem('tracko_splash_shown')) {
        splash.style.display = 'none';
    }

    updateI18n();
    initClock();

    if (window.CURRENT_USER && window.CURRENT_USER.role === 'employee') {
        loadEmpItems();
    }

    try {
        await refresh();

        if (splash && !sessionStorage.getItem('tracko_splash_shown')) {
            setTimeout(() => {
                splash.classList.add('hide');
                sessionStorage.setItem('tracko_splash_shown', 'true');
                setTimeout(() => splash.remove(), 1000);
            }, 2200);
        }
    } catch (e) {
        console.error("Init failed:", e);
        if (splash) splash.style.display = 'none';
    }
}

/* ── BULK ACTIONS ── */
window.bulkSelectedIds = new Set();
window.toggleAllRows = function(checked) {
    document.querySelectorAll('.row-checkbox').forEach(cb => {
        cb.checked = checked;
        if (checked) window.bulkSelectedIds.add(cb.value);
        else window.bulkSelectedIds.delete(cb.value);
    });
    updateBulkBar();
};
window.updateBulkSelection = function() {
    document.querySelectorAll('.row-checkbox').forEach(cb => {
        if (cb.checked) window.bulkSelectedIds.add(cb.value);
        else window.bulkSelectedIds.delete(cb.value);
    });
    const allChecked = document.querySelectorAll('.row-checkbox').length > 0 && Array.from(document.querySelectorAll('.row-checkbox')).every(cb => cb.checked);
    const selectAllCb = document.getElementById('bulk-select-all');
    if (selectAllCb) selectAllCb.checked = allChecked;
    updateBulkBar();
};
function updateBulkBar() {
    const bar = document.getElementById('bulk-action-bar');
    const count = document.getElementById('bulk-count');
    if (!bar || !count) return;
    if (window.bulkSelectedIds.size > 0) { count.textContent = window.bulkSelectedIds.size + ' выбрано'; bar.classList.add('show'); }
    else bar.classList.remove('show');
}
window.bulkClearSelection = function() {
    window.bulkSelectedIds.clear();
    document.querySelectorAll('.row-checkbox, #bulk-select-all').forEach(cb => cb.checked = false);
    updateBulkBar();
};
window.bulkPrintQr = function() {
    if (window.bulkSelectedIds.size === 0) return;
    const ids = Array.from(window.bulkSelectedIds);
    const selectedItems = items.filter(i => ids.includes(i.id.toString()));
    const invs = selectedItems.map(i => encodeURIComponent(i.inv_num)).join(',');
    window.open('/qr-print?invs=' + invs, '_blank');
    bulkClearSelection();
};

/* ── COMMAND PALETTE ── */
function toggleCmdPalette() {
    const p = document.getElementById('cmd-palette'); if(!p) return;
    p.classList.toggle('show');
    if (p.classList.contains('show')) document.getElementById('cmd-input')?.focus();
}
function hideCmdPalette() { document.getElementById('cmd-palette')?.classList.remove('show'); }

async function updatePulse() {
    const el = document.getElementById('sb-pulse-list'); if (!el) return;
    try {
        const data = await (await fetch('/api/history?limit=1')).json();
        if (data.length) {
            const h = data[0];
            el.innerHTML = `<div style="font-weight:600; color:var(--text);">${h.user_name}</div>
                            <div style="opacity:0.8;">${h.action === 'added' ? 'добавил' : 'обновил'} ${h.inv_num || 'актив'}</div>`;
        }
    } catch(e) {}
}

/* EVENT LISTENERS */
window.addEventListener('DOMContentLoaded', () => {
    init();
    updatePulse();
    setInterval(updatePulse, 10000);
    setInterval(() => {
        fetch('/api/notifications').then(r=>r.json()).then(resp=>{
            const total = Array.isArray(resp) ? resp.length : (resp.total||0);
            const dot = document.getElementById('notif-dot');
            if (dot) { dot.style.display = total>0?'block':'none'; dot.classList.toggle('show',total>0); }
        }).catch(()=>{});
    }, 60000);
    
    // Auto-open from URL params
    const params = new URLSearchParams(window.location.search);
    if(params.has('add_emp')) {
        setTimeout(() => {
            openAdd();
            const aEmp = document.getElementById('a-emp');
            if(aEmp) aEmp.value = params.get('add_emp');
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 500); 
    }
    const editId = params.get('edit');
    if (editId) {
        setTimeout(() => {
            openEdit(parseInt(editId));
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.pushState({path:newUrl},'',newUrl);
        }, 500);
    }
});

window.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); toggleCmdPalette(); }
    if (e.key === 'Escape') { hideCmdPalette(); closeQrLb(); document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); }
});
