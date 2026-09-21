import { project } from "./project.js";
import { store } from "./data/store.js";
import {
  escapeHtml,
  formatDate,
  onRouteChange,
  qs,
  qsa,
  renderLogin,
  renderShell,
  route,
  setNotice,
  statusLabel,
} from "./ui.js";
import { renderStyleguide } from "./styleguide.js";

const nav = (active) => [
  { href: "#/", label: "Главная", active: active === "/" },
  { href: "#/workspace", label: "Заявки", active: active === "/workspace" },
];

function initHeroSwipe() {
  const root = qs("#hero-swipe");
  const thumb = qs("#hero-swipe-thumb");
  const fill = qs("#hero-swipe-fill");
  if (!root || !thumb || !fill) return;

  const PAD = 3;
  let dragging = false;
  let startX = 0;
  let startLeft = 0;
  let moved = 0;
  let maxLeft = 0;
  let done = false;
  // Текущая позиция ползунка (в px от начала пути) — трекается отдельной
  // переменной, а не читается через thumb.offsetLeft, т.к. позиция теперь
  // двигается через transform (не через left) и offsetLeft её не отражает.
  let currentLeft = 0;

  function metrics() {
    maxLeft = Math.max(0, root.clientWidth - thumb.offsetWidth - PAD * 2);
  }

  function setPosition(left) {
    currentLeft = left;
    // transform вместо left — не заставляет браузер пересчитывать вёрстку
    // на каждое движение пальца, только перерисовку слоя. На слабых
    // телефонах left/width заметно лагали при протягивании.
    thumb.style.transform = `translateX(${left}px)`;
    fill.style.width = `${left + thumb.offsetWidth + PAD}px`;
  }

  function complete() {
    if (done) return;
    done = true;
    root.classList.add("is-complete");
    setPosition(maxLeft);
    window.setTimeout(() => { window.location.href = project.ctaUrl; }, 220);
  }

  function reset() {
    setPosition(0);
  }

  thumb.addEventListener("pointerdown", (event) => {
    if (done) return;
    metrics();
    dragging = true;
    moved = 0;
    startX = event.clientX;
    startLeft = currentLeft;
    thumb.classList.add("is-dragging");
    thumb.setPointerCapture(event.pointerId);
  });

  thumb.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const delta = event.clientX - startX;
    moved = Math.abs(delta);
    setPosition(Math.min(maxLeft, Math.max(0, startLeft + delta)));
  });

  let suppressNextClick = false;

  function onRelease() {
    if (!dragging) return;
    dragging = false;
    thumb.classList.remove("is-dragging");
    suppressNextClick = true;
    window.setTimeout(() => { suppressNextClick = false; }, 0);
    if (moved < 6 || currentLeft >= maxLeft * 0.82) {
      complete();
    } else {
      reset();
    }
  }

  thumb.addEventListener("pointerup", onRelease);
  thumb.addEventListener("pointercancel", onRelease);

  thumb.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      complete();
    }
  });

  // Простой клик/тап по пилюле (без протягивания) тоже подтверждает — часть
  // пользователей не пытается тащить ползунок, а просто нажимает как на кнопку.
  root.addEventListener("click", () => {
    if (suppressNextClick || done) return;
    complete();
  });

  window.addEventListener("resize", () => { if (!done) metrics(); });
  metrics();
}

async function renderHome() {
  const { hero, whatsInside, about, howItWorks, final: finalBlock, closingCat, legal } = project;
  const visibleTables = whatsInside.tables.slice(0, whatsInside.visibleCount);
  const hiddenTables = whatsInside.tables.slice(whatsInside.visibleCount);

  renderShell({
    title: `${project.name} — ${hero.title}`,
    header: false,
    footer: false,
    content: `
      <section class="lander-section lander-section--smoke">
        <div class="lander">
          <div class="block hero-card block--glow-1">
            <div class="hero-chrome">
              <div class="hero-chrome-dots"><span></span><span></span><span></span></div>
              <span class="hero-chrome-label">Google Таблицы — Лист1</span>
            </div>
            <div class="hero-photo"><img src="${hero.photo}" alt="${escapeHtml(hero.photoAlt)}"></div>
            <div class="block-body">
              <p class="cell-tag-row"><span class="cell-tag">A1</span><span class="cell-tag-caption">первая ячейка твоей системы</span></p>
              <h1>${escapeHtml(hero.title)}</h1>
              <p class="lead">${escapeHtml(hero.lead)}</p>
              <div class="actions">
                <div class="swipe-cta" id="hero-swipe">
                  <div class="swipe-cta-fill" id="hero-swipe-fill"></div>
                  <span class="swipe-cta-label">${escapeHtml(project.cta)}</span>
                  <button type="button" class="swipe-cta-thumb" id="hero-swipe-thumb" aria-label="${escapeHtml(project.cta)} — потяни вправо или нажми Enter">
                    <span class="swipe-cta-thumb-glow"></span>
                    <span class="swipe-cta-thumb-face">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 3a7 7 0 0 0-7 7v1.5"/>
                        <path d="M12 3a7 7 0 0 1 7 7v4"/>
                        <path d="M7 17.5A9 9 0 0 1 5 11"/>
                        <path d="M9 8.5a3 3 0 0 1 6 0v5.5"/>
                        <path d="M12 21a9 9 0 0 1-3.5-4.5"/>
                        <path d="M15.5 19a9 9 0 0 0 2.5-6.5V11"/>
                        <path d="M9 8.5v3a3 3 0 0 0 3 3 3 3 0 0 0 1-.18"/>
                      </svg>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="lander-section lander-section--smoke">
        <div class="lander">
          <div class="block block-body block--glow-2">
            <p class="cell-tag-row"><span class="cell-tag">B1</span><span class="cell-tag-caption">что внутри воркбука</span></p>
            <h2>${escapeHtml(whatsInside.title)}</h2>
            <p class="lead">${escapeHtml(whatsInside.text)}</p>

            <div class="table-stack" id="table-grid">
              ${visibleTables.map((table, index) => `
                <figure class="table-card">
                  <img src="${table.image}" alt="Таблица «${escapeHtml(table.title)}»">
                  <figcaption class="table-card-foot">
                    <span class="cell-tag">A${index + 2}</span>
                    <span class="table-card-title">${escapeHtml(table.title)}</span>
                  </figcaption>
                </figure>
              `).join("")}
            </div>
            <div class="table-stack" id="table-grid-more" hidden>
              ${hiddenTables.map((table, index) => `
                <figure class="table-card">
                  <img src="${table.image}" alt="Таблица «${escapeHtml(table.title)}»">
                  <figcaption class="table-card-foot">
                    <span class="cell-tag">A${visibleTables.length + index + 2}</span>
                    <span class="table-card-title">${escapeHtml(table.title)}</span>
                  </figcaption>
                </figure>
              `).join("")}
            </div>
            <div class="sheet-tabs" id="sheet-tabs" hidden>
              ${whatsInside.moreTitles.map((title, index) => `
                <span class="sheet-tab">
                  <span class="sheet-tab-ref">A${visibleTables.length + hiddenTables.length + index + 2}</span>
                  <span class="sheet-tab-name">${escapeHtml(title)}</span>
                </span>
              `).join("")}
            </div>

            <div class="actions">
              <button class="button button--secondary button--block" id="expand-tables" type="button">${escapeHtml(whatsInside.expandLabel)}</button>
            </div>
            <p class="muted small table-note" id="table-note" hidden>${escapeHtml(whatsInside.note)}</p>

            <div class="actions">
              <a class="button button--block" href="${escapeHtml(project.ctaUrl)}">${escapeHtml(project.cta)}</a>
            </div>
          </div>
        </div>
      </section>

      <section class="lander-section lander-section--smoke">
        <div class="lander">
          <div class="block about-card block--glow-3">
            <div class="about-photo"><img src="${about.photo}" alt="${escapeHtml(about.photoAlt)}"></div>
            <div class="block-body">
              <p class="cell-tag-row"><span class="cell-tag">C1</span><span class="cell-tag-caption">автор этой системы</span></p>
              <h2>${escapeHtml(about.title)}</h2>
              <div>
                ${about.points.map((point, index) => `
                  <div class="feature-row">
                    <span class="cell-tag">C${index + 2}</span>
                    <p class="feature-text">${escapeHtml(point)}</p>
                  </div>
                `).join("")}
              </div>
              <p class="lead" style="margin-top:18px">${escapeHtml(about.closing)}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="lander-section">
        <div class="lander">
          <div class="block block-body block--glow">
            <p class="cell-tag-row"><span class="cell-tag">D1</span><span class="cell-tag-caption">механика доступа</span></p>
            <h2>${escapeHtml(howItWorks.title)}</h2>
            <p class="lead">${escapeHtml(howItWorks.text)}</p>
          </div>
        </div>
      </section>

      <section class="lander-section" style="padding-bottom:32px" id="order">
        <div class="lander">
          <div class="block block-body block--glow">
            <p class="cell-tag-row"><span class="cell-tag">E1</span><span class="cell-tag-caption">последний шаг</span></p>
            <h2>${escapeHtml(finalBlock.title)}</h2>
            <p class="price-line">
              <span class="price-value">${escapeHtml(finalBlock.price)}</span>
              <span class="price-note">${escapeHtml(finalBlock.priceNote)}</span>
            </p>
            <p class="lead">${escapeHtml(finalBlock.text)}</p>
            <div class="actions">
              <a class="button button--block" href="${escapeHtml(project.ctaUrl)}">${escapeHtml(project.cta)}</a>
            </div>
          </div>
        </div>
      </section>

      <section class="lander-section">
        <div class="lander">
          <div class="block">
            <img src="${closingCat.image}" alt="${escapeHtml(closingCat.imageAlt)}">
          </div>
        </div>
      </section>

      <section class="lander-section">
        <div class="lander">
          <div class="legal-footer">
            <p>${escapeHtml(legal.entity)}</p>
            <p>${escapeHtml(legal.inn)}</p>
            <p>${escapeHtml(legal.ogrnip)}</p>
            <p>${escapeHtml(legal.paymentMethod)}</p>
          </div>
        </div>
      </section>
    `,
  });

  qs("#expand-tables")?.addEventListener("click", (event) => {
    qs("#table-grid-more").hidden = false;
    qs("#sheet-tabs").hidden = false;
    qs("#table-note").hidden = false;
    event.currentTarget.hidden = true;
  });

  initHeroSwipe();
}

async function workspaceContent() {
  const session = await store.session();
  if (store.mode === "supabase" && !session) return renderLogin();

  const records = await store.list("lead");
  return `
    <section class="section">
      <div class="container">
        <div class="split">
          <div>
            <p class="eyebrow">Рабочий экран</p>
            <h1 style="font-size:clamp(38px,6vw,64px)">Заявки</h1>
            <p class="lead">${store.mode === "local"
              ? "Локальные записи видны только в этом браузере."
              : `Вход: ${escapeHtml(session?.user?.email || "владелец")}`}</p>
          </div>
          <div class="inline">
            ${store.mode === "local" ? '<button id="seed-leads" class="button button--secondary">Вернуть демо-данные</button>' : ""}
            ${store.mode === "supabase" ? '<button id="logout" class="button button--secondary">Выйти</button>' : ""}
          </div>
        </div>

        <div class="record-list" style="margin-top:30px">
          ${records.length ? records.map((record) => `
            <article class="record" data-id="${record.id}">
              <div class="split">
                <div>
                  <span class="badge">${escapeHtml(statusLabel(record.status))}</span>
                  <h3 style="margin-top:12px">${escapeHtml(record.payload.name || "Без имени")}</h3>
                  <p><strong>${escapeHtml(record.payload.contact || "Контакт не указан")}</strong></p>
                  <p>${escapeHtml(record.payload.problem || "")}</p>
                  <p class="record-meta">${formatDate(record.created_at)}</p>
                </div>
                <div class="stack" style="min-width:180px">
                  <label>
                    Статус
                    <select class="status-select">
                      ${["new", "contacted", "done"].map((status) => `
                        <option value="${status}" ${record.status === status ? "selected" : ""}>${statusLabel(status)}</option>
                      `).join("")}
                    </select>
                  </label>
                  <button class="archive button button--danger button--small">В архив</button>
                </div>
              </div>
            </article>
          `).join("") : `
            <div class="empty">
              <h3>Заявок пока нет</h3>
              <p>На лендинге пока нет формы — кнопки ведут на оплату в Telegram. Нажми «Вернуть демо-данные», чтобы увидеть пример записи.</p>
            </div>
          `}
        </div>
      </div>
    </section>
  `;
}

async function renderWorkspace() {
  renderShell({
    title: `Заявки — ${project.name}`,
    nav: [...nav("/workspace"), { href: "#/styleguide", label: "Стиль", active: false }],
    content: '<section class="section"><div class="container"><p>Загружаю записи…</p></div></section>',
  });

  qs("#main").innerHTML = await workspaceContent();

  const loginForm = qs("#login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const error = qs("#login-error");
      try {
        await store.signIn(String(data.get("email")), String(data.get("password")));
        await renderWorkspace();
      } catch (cause) {
        error.textContent = cause instanceof Error ? cause.message : "Не удалось войти";
        error.hidden = false;
      }
    });
    return;
  }

  qs("#seed-leads")?.addEventListener("click", async () => {
    await store.reset("lead", [
      { status: "new", payload: { name: "Ольга", contact: "@olga_rom", problem: "Хочу выстроить систему отчётности в отделе — сейчас всё в разных файлах." } },
      { status: "contacted", payload: { name: "Дмитрий", contact: "dmitry@example.test", problem: "Веду контент в нескольких проектах, нужны понятные шаблоны планирования." } },
    ]);
    await renderWorkspace();
  });

  qs("#logout")?.addEventListener("click", async () => {
    await store.signOut();
    await renderWorkspace();
  });

  for (const node of qsa(".record")) {
    const id = node.dataset.id;
    qs(".status-select", node).addEventListener("change", async (event) => {
      try {
        await store.update(id, { status: event.currentTarget.value });
        setNotice("Статус сохранён");
      } catch (cause) {
        setNotice(cause instanceof Error ? cause.message : "Не удалось сохранить", "error");
      }
    });
    qs(".archive", node).addEventListener("click", async () => {
      try {
        await store.archive(id);
        await renderWorkspace();
        setNotice("Заявка отправлена в архив");
      } catch (cause) {
        setNotice(cause instanceof Error ? cause.message : "Не удалось архивировать", "error");
      }
    });
  }
}

async function render() {
  const current = route();
  if (current === "/workspace" || current === "/styleguide") {
    location.hash = "/";
    return;
  }
  return renderHome();
}

onRouteChange(() => {
  render().catch((error) => {
    console.error(error);
    setNotice(error.message || "Ошибка приложения", "error");
  });
});
