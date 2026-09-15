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

function renderHome() {
  const { hero, whatsInside, about, howItWorks, final: finalBlock, ctaUrl } = project;
  const visibleTables = whatsInside.tables.slice(0, whatsInside.visibleCount);
  const hiddenTables = whatsInside.tables.slice(whatsInside.visibleCount);

  renderShell({
    title: `${project.name} — ${hero.title}`,
    nav: [...nav("/"), { href: "#/styleguide", label: "Стиль", active: false }],
    content: `
      <section class="lander-section">
        <div class="lander">
          <div class="block hero-card">
            <div class="hero-photo"><img src="${hero.photo}" alt="${escapeHtml(hero.photoAlt)}"></div>
            <div class="block-body">
              <h1>${escapeHtml(hero.title)}</h1>
              <p class="lead">${escapeHtml(hero.lead)}</p>
              <div class="actions"><a class="button button--block" href="${escapeHtml(ctaUrl)}">${escapeHtml(project.cta)}</a></div>
            </div>
          </div>
        </div>
      </section>

      <section class="lander-section">
        <div class="lander">
          <div class="block block-body">
            <h2>${escapeHtml(whatsInside.title)}</h2>
            <p class="lead">${escapeHtml(whatsInside.text)}</p>

            <div class="table-stack" id="table-grid">
              ${visibleTables.map((table) => `
                <figure class="table-card">
                  <img src="${table.image}" alt="Таблица «${escapeHtml(table.title)}»">
                  <figcaption>${escapeHtml(table.title)}</figcaption>
                </figure>
              `).join("")}
            </div>
            <div class="table-stack" id="table-grid-more" hidden>
              ${hiddenTables.map((table) => `
                <figure class="table-card">
                  <img src="${table.image}" alt="Таблица «${escapeHtml(table.title)}»">
                  <figcaption>${escapeHtml(table.title)}</figcaption>
                </figure>
              `).join("")}
            </div>

            <div class="actions">
              <button class="button button--secondary button--block" id="expand-tables" type="button">${escapeHtml(whatsInside.expandLabel)}</button>
            </div>
            <p class="muted small table-note" id="table-note" hidden>${escapeHtml(whatsInside.note)}</p>

            <div class="actions">
              <a class="button button--block" href="${escapeHtml(ctaUrl)}">${escapeHtml(project.cta)}</a>
            </div>
          </div>
        </div>
      </section>

      <section class="lander-section">
        <div class="lander">
          <div class="block about-card">
            <div class="about-photo"><img src="${about.photo}" alt="${escapeHtml(about.photoAlt)}"></div>
            <div class="block-body">
              <h2>${escapeHtml(about.title)}</h2>
              <div>
                ${about.points.map((point, index) => `
                  <div class="feature-row">
                    <span class="feature-index">0${index + 1}</span>
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
          <div class="block block-body">
            <h2>${escapeHtml(howItWorks.title)}</h2>
            <p class="lead">${escapeHtml(howItWorks.text)}</p>
          </div>
        </div>
      </section>

      <section class="lander-section" style="padding-bottom:32px">
        <div class="lander">
          <div class="block block-body" style="text-align:center">
            <h2>${escapeHtml(finalBlock.title)}</h2>
            <div class="actions" style="justify-content:center">
              <a class="button button--block" href="${escapeHtml(ctaUrl)}">${escapeHtml(project.cta)}</a>
            </div>
          </div>
        </div>
      </section>
    `,
  });

  qs("#expand-tables")?.addEventListener("click", (event) => {
    qs("#table-grid-more").hidden = false;
    qs("#table-note").hidden = false;
    event.currentTarget.hidden = true;
  });
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
  if (current === "/workspace") return renderWorkspace();
  if (current === "/styleguide") return renderStyleguide();
  return renderHome();
}

onRouteChange(() => {
  render().catch((error) => {
    console.error(error);
    setNotice(error.message || "Ошибка приложения", "error");
  });
});
