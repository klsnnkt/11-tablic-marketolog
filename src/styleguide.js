import { renderShell } from "./ui.js";

export function renderStyleguide(activePath = "/styleguide") {
  renderShell({
    title: "Стиль проекта — AIRC Starter",
    nav: [
      { href: "#/", label: "Проект", active: false },
      { href: "#/workspace", label: "Рабочий экран", active: false },
      { href: "#/styleguide", label: "Стиль", active: true },
    ],
    content: `
      <section class="section">
        <div class="container">
          <p class="eyebrow">DESIGN_SYSTEM.md</p>
          <h1 style="font-size:clamp(38px,6vw,64px)">Стиль проекта</h1>
          <p class="lead">Эта страница помогает агенту видеть повторяемые правила, а тебе — ловить случайные цвета, размеры и компоненты.</p>

          <div class="style-row">
            <strong>Цвета</strong>
            <div class="swatches">
              <div class="swatch" style="background:#0b0b0e;color:white">Фон</div>
              <div class="swatch" style="background:#17171d;color:white">Карточка</div>
              <div class="swatch" style="background:#f5f5f7;color:#0b0b0e">Текст</div>
              <div class="swatch" style="background:linear-gradient(135deg,#16b978,#0f9463);color:white">Акцент</div>
              <div class="swatch" style="background:#ff5c74;color:white">Ошибка</div>
            </div>
          </div>

          <div class="style-row">
            <strong>Кнопки</strong>
            <div class="inline">
              <button class="button">Главное действие</button>
              <button class="button button--secondary">Вторичное</button>
              <button class="button button--danger">Опасное</button>
            </div>
          </div>

          <div class="style-row">
            <strong>Поля</strong>
            <div class="stack" style="max-width:520px">
              <label>Название поля<input value="Пример значения"></label>
              <label>Комментарий<textarea>Короткий реальный текст помогает проверить высоту и переносы.</textarea></label>
              <p class="field-error">Объясни, как исправить ошибку.</p>
            </div>
          </div>

          <div class="style-row">
            <strong>Карточка</strong>
            <article class="card" style="max-width:560px">
              <span class="badge">В работе</span>
              <h3 style="margin-top:14px">Один понятный смысл</h3>
              <p class="muted">Карточка не должна конкурировать с главным действием экрана.</p>
            </article>
          </div>
        </div>
      </section>
    `,
  });
}
