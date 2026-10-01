(function () {
  "use strict";
  const data = window.DOCU_ALX_DATA;
  const content = document.querySelector("#content");
  const nav = document.querySelector("#story-nav");
  const search = document.querySelector("#search");
  const sidebar = document.querySelector("#sidebar");
  const menuButton = document.querySelector("#menu-button");
  const currentDownload = document.querySelector("#download-current");
  const chatPanel = document.querySelector("#chat-panel");
  const chatToggle = document.querySelector("#chat-toggle");
  const chatForm = document.querySelector("#chat-form");
  const chatInput = document.querySelector("#chat-input");
  const chatSend = chatForm.querySelector(".send-button");
  const chatMessages = document.querySelector("#chat-messages");
  let currentStory = null;
  let chatBusy = false;

  const labels = { confirmed: "Confirmado", proposal: "Propuesta", pending: "Pendiente", draft: "Borrador" };
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const badge = (status) => make("span", `badge ${status || "confirmed"}`, labels[status] || status);

  function renderNav(query = "") {
    nav.replaceChildren();
    const normalized = query.trim().toLocaleLowerCase("es");
    const matches = data.stories.filter((story) => JSON.stringify(story).toLocaleLowerCase("es").includes(normalized));
    matches.forEach((story) => {
      const link = make("a", "story-link");
      link.href = `#${story.id}`;
      link.dataset.storyId = story.id;
      const meta = make("span", "story-meta");
      meta.append(make("strong", "story-id", story.id), badge(story.status));
      link.append(meta, make("span", "story-name", story.title));
      nav.append(link);
    });
    document.querySelector("#empty-nav").hidden = matches.length > 0;
    markActive();
  }

  function headingBlock(story) {
    const fragment = document.createDocumentFragment();
    const top = make("div", "story-heading");
    const heading = make("div");
    heading.append(make("p", "eyebrow", story.id), make("h1", "", story.title));
    top.append(heading, badge(story.status));
    fragment.append(top);
    if (story.objective) fragment.append(make("p", "lead", story.objective));
    if (story.statement) {
      const quote = make("blockquote", "user-story");
      quote.append(
        document.createTextNode("Como "), make("strong", "", story.statement.actor),
        document.createTextNode(", quiero "), make("strong", "", story.statement.capability),
        document.createTextNode(", para "), make("strong", "", story.statement.benefit),
        document.createTextNode(".")
      );
      fragment.append(quote);
    }
    return fragment;
  }

  function renderSection(section) {
    const wrapper = make("section", "content-section");
    const header = make("div", "section-heading");
    header.append(make("h2", "", section.title));
    if (section.certainty) header.append(badge(section.certainty));
    wrapper.append(header);
    (section.paragraphs || []).forEach((paragraph) => wrapper.append(make("p", "", paragraph)));
    if (section.items && section.items.length) {
      const list = make("ul", "clean-list");
      section.items.forEach((item) => list.append(make("li", "", item)));
      wrapper.append(list);
    }
    (section.criteria || []).forEach((criterion) => {
      const card = make("div", "criterion");
      [["Dado", criterion.given], ["Cuando", criterion.when], ["Entonces", criterion.then]].forEach(([label, value]) => {
        const row = make("p");
        row.append(make("strong", "", `${label}: `), document.createTextNode(value));
        card.append(row);
      });
      wrapper.append(card);
    });
    return wrapper;
  }

  function renderVisual(visual) {
    const figure = make("figure", "visual-card");
    const image = make("img");
    image.src = visual.src;
    image.alt = visual.alt;
    image.loading = "lazy";
    const caption = make("figcaption");
    caption.append(make("span", "visual-type", visual.type), document.createTextNode(visual.caption));
    figure.append(image, caption);
    return figure;
  }

  function renderHome() {
    currentStory = null;
    content.replaceChildren();
    const header = make("header", "home-heading");
    const heading = make("div");
    heading.append(make("p", "eyebrow", "Historias de Usuario"), make("h1", "", data.document.title));
    header.append(heading, badge(data.document.status));
    content.append(header);
    (data.document.context || []).forEach((paragraph) => content.append(make("p", "lead", paragraph)));
    if (data.document.sharedPending && data.document.sharedPending.length) {
      const pending = make("section", "content-section pending-panel");
      pending.append(make("h2", "", "Pendientes compartidos"));
      const list = make("ul", "clean-list");
      data.document.sharedPending.forEach((item) => list.append(make("li", "", item)));
      pending.append(list);
      content.append(pending);
    }
    const overview = make("section", "story-overview content-section");
    const overviewHead = make("div", "overview-heading");
    overviewHead.append(make("h2", "", "Historias documentadas"), make("span", "overview-count", String(data.stories.length)));
    overview.append(overviewHead);
    const grid = make("div", "story-card-grid");
    data.stories.forEach((story) => {
      const card = make("a", "story-card");
      card.href = `#${story.id}`;
      const meta = make("div", "story-card-meta");
      meta.append(make("span", "story-card-id", story.id), badge(story.status));
      card.append(meta, make("h3", "", story.title));
      if (story.objective) card.append(make("p", "", story.objective));
      grid.append(card);
    });
    overview.append(grid);
    content.append(overview);
    document.querySelector("#mobile-title").textContent = data.document.title;
    currentDownload.disabled = true;
    markActive();
  }

  function renderStory(story) {
    currentStory = story;
    content.replaceChildren(headingBlock(story));
    (story.sections || []).forEach((section) => content.append(renderSection(section)));
    if (story.visuals && story.visuals.length) {
      const section = make("section", "content-section");
      section.append(make("h2", "", "Referencia visual"));
      story.visuals.forEach((visual) => section.append(renderVisual(visual)));
      content.append(section);
    }
    document.querySelector("#mobile-title").textContent = `${story.id} · ${story.title}`;
    currentDownload.disabled = false;
    markActive();
  }

  function markActive() {
    document.querySelectorAll(".story-link").forEach((link) => {
      const active = Boolean(currentStory && link.dataset.storyId === currentStory.id);
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function route() {
    const id = decodeURIComponent(location.hash.slice(1));
    const story = data.stories.find((item) => item.id === id);
    if (story) renderStory(story); else renderHome();
    sidebar.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    window.scrollTo(0, 0);
  }

  function storyMarkdown(story) {
    const lines = [`## ${story.id} — ${story.title}`, "", `**Estado:** ${labels[story.status] || story.status}`, ""];
    if (story.objective) lines.push("### Objetivo", "", story.objective, "");
    if (story.statement) lines.push("### Historia de Usuario", "", `Como **${story.statement.actor}**, quiero **${story.statement.capability}**, para **${story.statement.benefit}**.`, "");
    (story.sections || []).forEach((section) => {
      lines.push(`### ${section.title}`, "");
      if (section.certainty) lines.push(`**Certeza:** ${labels[section.certainty] || section.certainty}`, "");
      (section.paragraphs || []).forEach((paragraph) => lines.push(paragraph, ""));
      (section.items || []).forEach((item) => lines.push(`- ${item}`));
      if (section.items && section.items.length) lines.push("");
      (section.criteria || []).forEach((criterion) => lines.push(`- **Dado:** ${criterion.given}\n  **Cuando:** ${criterion.when}\n  **Entonces:** ${criterion.then}`, ""));
    });
    (story.visuals || []).forEach((visual) => lines.push(`![${visual.alt}](${visual.src})`, "", `*${visual.type}: ${visual.caption}*`, ""));
    return lines.join("\n").trim();
  }

  function fullMarkdown() {
    const lines = [`# ${data.document.title}`, "", data.document.summary || "", ""];
    (data.document.context || []).forEach((paragraph) => lines.push(paragraph, ""));
    if (data.document.sharedPending && data.document.sharedPending.length) lines.push("## Pendientes compartidos", "", ...data.document.sharedPending.map((item) => `- ${item}`), "");
    data.stories.forEach((story) => lines.push(storyMarkdown(story), ""));
    return lines.join("\n").trim();
  }

  function download(filename, body) {
    const url = URL.createObjectURL(new Blob([body], { type: "text/markdown;charset=utf-8" }));
    const anchor = make("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  const stopWords = new Set(["que", "como", "cual", "cuales", "donde", "cuando", "para", "por", "con", "del", "las", "los", "una", "uno", "unos", "unas", "hay", "esta", "este", "sobre", "tiene", "tienen"]);
  const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").replace(/[^a-z0-9-]+/g, " ").trim();
  const tokens = (value) => normalize(value).split(/\s+/).filter((word) => word.length > 2 && !stopWords.has(word));
  const shorten = (value, limit = 240) => value.length > limit ? `${value.slice(0, limit).trim()}…` : value;

  function knowledgeRecords() {
    const records = [];
    (data.document.context || []).forEach((text) => records.push({ title: "Contexto general", text, story: null, certainty: "confirmed" }));
    (data.document.sharedPending || []).forEach((text) => records.push({ title: "Pendiente compartido", text, story: null, certainty: "pending" }));
    data.stories.forEach((story) => {
      if (story.objective) records.push({ title: "Objetivo", text: story.objective, story, certainty: story.status });
      if (story.statement) records.push({ title: "Historia de Usuario", text: `Como ${story.statement.actor}, quiero ${story.statement.capability}, para ${story.statement.benefit}.`, story, certainty: story.status });
      (story.sections || []).forEach((section) => {
        const parts = [...(section.paragraphs || []), ...(section.items || [])];
        (section.criteria || []).forEach((criterion) => parts.push(`Dado ${criterion.given}. Cuando ${criterion.when}. Entonces ${criterion.then}.`));
        parts.forEach((text) => records.push({ title: section.title, text, story, certainty: section.certainty || story.status }));
      });
    });
    return records;
  }

  function sourceFor(record) {
    if (!record.story) return { label: record.title, href: "#inicio" };
    return { label: `${record.story.id} · ${record.story.title}`, href: `#${record.story.id}` };
  }

  function answerQuestion(question) {
    const clean = normalize(question);
    const queryTokens = tokens(question);
    const records = knowledgeRecords();
    if (/\b(cuant|numero|total)\w*/.test(clean) && /\b(hu|historia|historias)\b/.test(clean)) {
      const counts = data.stories.reduce((all, story) => ({ ...all, [story.status]: (all[story.status] || 0) + 1 }), {});
      const detail = Object.entries(counts).map(([status, count]) => `${count} ${labels[status] || status}`).join(", ");
      return { text: `Hay ${data.stories.length} Historias de Usuario registradas${detail ? `: ${detail}` : "."}`, sources: [] };
    }

    let intent = null;
    if (/pendient|abiert/.test(clean)) intent = "pending";
    if (/propuest|concept/.test(clean)) intent = "proposal";
    if (/confirmad|aprob/.test(clean)) intent = "confirmed";
    if (/borrador|incomplet/.test(clean)) intent = "draft";
    const statusOnlyQuestion = queryTokens
      .filter((token) => !/(pendient|abiert|propuest|concept|confirmad|aprob|borrador|incomplet)/.test(token))
      .every((token) => ["hu", "historia", "historias", "usuario", "usuarios", "estado", "estados"].includes(token));
    if (intent && statusOnlyQuestion) {
      const matches = records.filter((record) => record.certainty === intent || record.story?.status === intent).slice(0, 4);
      if (matches.length) return {
        text: `${labels[intent]}: ${matches.map((record) => shorten(record.text, 150)).join(" ")}`,
        sources: [...new Map(matches.map((record) => { const source = sourceFor(record); return [source.href, source]; })).values()]
      };
    }

    const exactStory = data.stories.find((story) => clean.includes(normalize(story.id)));
    const ranked = records.map((record) => {
      const haystack = normalize(`${record.story?.id || ""} ${record.story?.title || ""} ${record.title} ${record.text}`);
      const title = normalize(`${record.story?.title || ""} ${record.title}`);
      let score = queryTokens.reduce((total, token) => total + (haystack.includes(token) ? 1 : 0) + (title.includes(token) ? 2 : 0), 0);
      if (exactStory && record.story?.id === exactStory.id) score += 8;
      return { record, score };
    }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);

    if (!ranked.length) return { text: "No encontré esa respuesta en la documentación registrada. Prueba preguntando por una HU, un estado, un flujo o un criterio de aceptación.", sources: [] };
    return {
      text: ranked.map(({ record }) => `${record.title}: ${shorten(record.text)}`).join(" "),
      sources: [...new Map(ranked.map(({ record }) => { const source = sourceFor(record); return [source.href, source]; })).values()]
    };
  }

  function addMessage(role, text, sources = []) {
    const message = make("div", `chat-message ${role}`);
    const paragraph = make("p", "", text);
    message.append(paragraph);
    appendSources(message, sources);
    chatMessages.append(message);
    scrollChat();
    return { message, paragraph };
  }

  function appendSources(message, sources = []) {
    if (sources.length) {
      const sourceList = make("div", "chat-sources");
      sources.forEach((source) => {
        const link = make("a", "source-link", source.label);
        link.href = source.href;
        sourceList.append(link);
      });
      message.append(sourceList);
    }
  }

  function scrollChat() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function setChatBusy(busy) {
    chatBusy = busy;
    chatPanel.setAttribute("aria-busy", String(busy));
    chatInput.disabled = busy;
    chatSend.disabled = busy;
    document.querySelectorAll(".suggestion").forEach((button) => { button.disabled = busy; });
  }

  function addTypingIndicator() {
    const message = make("div", "chat-message assistant is-typing");
    message.setAttribute("role", "status");
    message.setAttribute("aria-label", "Consultando la documentación");
    const dots = make("span", "typing-dots");
    dots.setAttribute("aria-hidden", "true");
    dots.append(make("span"), make("span"), make("span"));
    message.append(dots);
    chatMessages.append(message);
    scrollChat();
    return message;
  }

  const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

  async function streamAnswer(text, sources) {
    const { message, paragraph } = addMessage("assistant is-streaming", "");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      paragraph.textContent = text;
    } else {
      const chunks = text.match(/\S+\s*/g) || [text];
      for (const chunk of chunks) {
        paragraph.textContent += chunk;
        scrollChat();
        await wait(34 + Math.min(36, chunk.length * 2));
      }
    }
    message.classList.remove("is-streaming");
    appendSources(message, sources);
    scrollChat();
  }

  async function ask(question) {
    const value = question.trim();
    if (!value || chatBusy) return;
    addMessage("user", value);
    setChatBusy(true);
    const typing = addTypingIndicator();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const thinkingDelay = reducedMotion ? 250 : Math.min(3000, 1400 + value.length * 18);
    await wait(thinkingDelay);
    const answer = answerQuestion(value);
    typing.remove();
    await streamAnswer(answer.text, answer.sources);
    setChatBusy(false);
    if (chatPanel.classList.contains("open")) chatInput.focus();
  }

  function setChat(open) {
    chatPanel.classList.toggle("open", open);
    chatPanel.setAttribute("aria-hidden", String(!open));
    chatToggle.setAttribute("aria-expanded", String(open));
    chatToggle.setAttribute("aria-label", open ? "Cerrar consulta de documentación" : "Abrir consulta de documentación");
    document.querySelector("#chat-scrim").hidden = !open;
    if (open) chatInput.focus(); else chatToggle.focus();
  }

  addMessage("assistant", "Hola. Puedo localizar respuestas dentro de estas Historias de Usuario y mostrarte la fuente. ¿Qué necesitas consultar?");
  ["¿Qué está pendiente?", "¿Cuántas HU hay?", "¿Qué dice la HU-P01?"].forEach((question) => {
    const button = make("button", "suggestion", question);
    button.type = "button";
    button.addEventListener("click", () => ask(question));
    document.querySelector("#chat-suggestions").append(button);
  });

  document.title = data.document.title;
  document.querySelector("#document-title").textContent = data.document.title;
  document.querySelector("#document-summary").textContent = data.document.summary;
  search.addEventListener("input", () => renderNav(search.value));
  menuButton.addEventListener("click", () => {
    const open = sidebar.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
  });
  chatToggle.addEventListener("click", () => setChat(!chatPanel.classList.contains("open")));
  document.querySelector("#chat-close").addEventListener("click", () => setChat(false));
  document.querySelector("#chat-scrim").addEventListener("click", () => setChat(false));
  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = chatInput.value;
    chatInput.value = "";
    ask(question);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && chatPanel.classList.contains("open")) setChat(false);
  });
  currentDownload.addEventListener("click", () => currentStory && download(`${currentStory.id}.md`, storyMarkdown(currentStory)));
  document.querySelector("#download-all").addEventListener("click", () => download("historias-de-usuario.md", fullMarkdown()));
  window.addEventListener("hashchange", route);
  renderNav();
  route();
})();
