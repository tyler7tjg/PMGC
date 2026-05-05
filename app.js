const STORAGE_KEY = "taskboard.v2";
const LEGACY_STORAGE_KEY = "taskboard.v1";

const columns = [
  { id: "todo", title: "To Do" },
  { id: "progress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" },
];

const labelColors = ["teal", "yellow", "blue", "green", "red", "slate"];

function defaultLabels() {
  return [
    { id: "label-design", name: "Design", color: "teal" },
    { id: "label-content", name: "Content", color: "yellow" },
    { id: "label-engineering", name: "Engineering", color: "blue" },
    { id: "label-launch", name: "Launch", color: "green" },
  ];
}

const boardTemplates = {
  blank: [],
  launch: [
    {
      column: "todo",
      title: "Map homepage content",
      description: "Audit current pages and decide what belongs above the fold.",
      priority: "High",
      owner: "Avery",
      dueDate: futureDate(2),
      labels: ["Content", "Design"],
    },
    {
      column: "todo",
      title: "Collect brand assets",
      description: "Logo files, product screenshots, and approved photography.",
      priority: "Medium",
      owner: "Mia",
      dueDate: futureDate(5),
      labels: ["Design"],
    },
    {
      column: "progress",
      title: "Build pricing section",
      description: "Responsive tiers with current plan limits and CTA states.",
      priority: "High",
      owner: "Noah",
      dueDate: futureDate(4),
      labels: ["Engineering", "Launch"],
    },
    {
      column: "review",
      title: "Review mobile navigation",
      description: "Confirm menu behavior on small screens and keyboard focus.",
      priority: "Medium",
      owner: "Lena",
      dueDate: futureDate(1),
      labels: ["Engineering"],
    },
    {
      column: "done",
      title: "Finalize launch checklist",
      description: "QA, analytics, redirect map, and owner sign-offs are ready.",
      priority: "Low",
      owner: "Sam",
      dueDate: futureDate(-1),
      labels: ["Launch"],
    },
  ],
  ops: [
    {
      column: "todo",
      title: "Review weekly intake",
      description: "Sort requests by owner, urgency, and next action.",
      priority: "High",
      owner: "Jordan",
      dueDate: futureDate(1),
      labels: ["Content"],
    },
    {
      column: "progress",
      title: "Update vendor tracker",
      description: "Confirm renewal dates and owners for active contracts.",
      priority: "Medium",
      owner: "Riley",
      dueDate: futureDate(3),
      labels: ["Engineering"],
    },
    {
      column: "review",
      title: "Approve expense policy draft",
      description: "Check limits, exceptions, and manager approval flow.",
      priority: "Medium",
      owner: "Morgan",
      dueDate: futureDate(6),
      labels: ["Launch"],
    },
  ],
  hiring: [
    {
      column: "todo",
      title: "Write role scorecard",
      description: "Define must-haves, interview signals, and evaluation notes.",
      priority: "High",
      owner: "Casey",
      dueDate: futureDate(2),
      labels: ["Content"],
    },
    {
      column: "progress",
      title: "Screen design candidates",
      description: "Review portfolios and shortlist first-round interviews.",
      priority: "Medium",
      owner: "Taylor",
      dueDate: futureDate(4),
      labels: ["Design"],
    },
    {
      column: "done",
      title: "Publish job post",
      description: "Post is live on careers page and recruiting channels.",
      priority: "Low",
      owner: "Sam",
      dueDate: futureDate(-2),
      labels: ["Launch"],
    },
  ],
};

const state = loadWorkspace();

const board = document.querySelector("#board");
const dashboardView = document.querySelector("#dashboardView");
const boardView = document.querySelector("#boardView");
const dashboardGrid = document.querySelector("#dashboardGrid");
const dashboardButton = document.querySelector("#dashboardButton");
const boardViewButton = document.querySelector("#boardViewButton");
const dashboardNewBoardButton = document.querySelector("#dashboardNewBoardButton");
const searchWrap = document.querySelector("#searchWrap");
const searchInput = document.querySelector("#searchInput");
const boardSelect = document.querySelector("#boardSelect");
const boardTitle = document.querySelector("#boardTitle");
const boardMeta = document.querySelector("#boardMeta");
const deleteBoardButton = document.querySelector("#deleteBoardButton");
const newCardButton = document.querySelector("#newCardButton");
const resetBoardButton = document.querySelector("#resetBoardButton");
const labelsButton = document.querySelector("#labelsButton");

const cardDialog = document.querySelector("#cardDialog");
const cardForm = document.querySelector("#cardForm");
const dialogMode = document.querySelector("#dialogMode");
const cardIdInput = document.querySelector("#cardId");
const titleInput = document.querySelector("#cardTitle");
const descriptionInput = document.querySelector("#cardDescription");
const columnInput = document.querySelector("#cardColumn");
const priorityInput = document.querySelector("#cardPriority");
const ownerInput = document.querySelector("#cardOwner");
const dueDateInput = document.querySelector("#cardDueDate");
const deleteCardButton = document.querySelector("#deleteCardButton");
const cardLabels = document.querySelector("#cardLabels");
const commentsPanel = document.querySelector("#commentsPanel");
const commentsList = document.querySelector("#commentsList");
const commentUserInput = document.querySelector("#commentUser");
const commentTextInput = document.querySelector("#commentText");
const addCommentButton = document.querySelector("#addCommentButton");

const labelsDialog = document.querySelector("#labelsDialog");
const labelsForm = document.querySelector("#labelsForm");
const labelsList = document.querySelector("#labelsList");
const newLabelNameInput = document.querySelector("#newLabelName");
const newLabelColorInput = document.querySelector("#newLabelColor");
const addLabelButton = document.querySelector("#addLabelButton");

const boardDialog = document.querySelector("#boardDialog");
const boardForm = document.querySelector("#boardForm");
const boardDialogMode = document.querySelector("#boardDialogMode");
const boardIdInput = document.querySelector("#boardId");
const boardNameInput = document.querySelector("#boardName");
const boardTemplateInput = document.querySelector("#boardTemplate");
const boardTemplateWrap = document.querySelector("#boardTemplateWrap");

const totalCards = document.querySelector("#totalCards");
const dueSoonCards = document.querySelector("#dueSoonCards");
const completedCards = document.querySelector("#completedCards");
const workspaceBoards = document.querySelector("#workspaceBoards");
const workspaceCards = document.querySelector("#workspaceCards");
const workspaceDueSoon = document.querySelector("#workspaceDueSoon");
const workspaceDone = document.querySelector("#workspaceDone");

function futureDate(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function makeId(prefix) {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 100000)}`;
}

function labelSlug(value) {
  const slug = String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || `custom-${Math.round(Math.random() * 100000)}`;
}

function findLabel(value, palette = defaultLabels()) {
  const key = String(value || "").trim().toLowerCase();
  return palette.find((label) => label.id === value || label.name.toLowerCase() === key);
}

function labelForCardValue(value) {
  const match = findLabel(value, state.labels);
  if (match) return match;
  return { id: value, name: value, color: "slate" };
}

function normalizeLabels(labelItems, boards = []) {
  const result = [];

  function addLabel(label, allowUpdate = false) {
    const name = typeof label === "string" ? label : label?.name;
    if (!name?.trim()) return;
    const id = typeof label === "object" && label?.id ? label.id : `label-${labelSlug(name)}`;
    const color = typeof label === "object" && labelColors.includes(label?.color) ? label.color : "slate";
    const duplicate = result.find((item) => item.id === id || item.name.toLowerCase() === name.trim().toLowerCase());
    if (duplicate) {
      if (allowUpdate) {
        duplicate.name = name.trim();
        duplicate.color = color;
      }
      return;
    }
    result.push({ id, name: name.trim(), color });
  }

  if (Array.isArray(labelItems)) {
    labelItems.forEach((label) => addLabel(label, true));
  } else {
    defaultLabels().forEach(addLabel);
  }
  (Array.isArray(boards) ? boards : []).forEach((boardItem) => {
    (Array.isArray(boardItem.cards) ? boardItem.cards : []).forEach((card) => {
      (Array.isArray(card.labels) ? card.labels : []).forEach((label) => {
        if (!findLabel(label, result)) {
          addLabel(typeof label === "string" ? label : String(label));
        }
      });
    });
  });

  return result;
}

function normalizeCardLabels(labels, palette) {
  const normalized = [];
  (Array.isArray(labels) ? labels : []).forEach((label) => {
    const match = findLabel(label, palette);
    const value = match?.id || label;
    if (value && !normalized.includes(value)) {
      normalized.push(value);
    }
  });
  return normalized;
}

function normalizeComments(comments) {
  return (Array.isArray(comments) ? comments : []).map((comment) => ({
    id: comment.id || makeId("comment"),
    user: comment.user || "Guest",
    text: comment.text || "",
    createdAt: comment.createdAt || new Date().toISOString(),
  }));
}

function withCardIds(cards, palette = defaultLabels()) {
  return cards.map((card) => ({
    ...card,
    id: card.id || makeId("card"),
    column: card.column || "todo",
    title: card.title || "Untitled card",
    description: card.description || "",
    priority: card.priority || "Medium",
    owner: card.owner || "Unassigned",
    dueDate: card.dueDate || "",
    labels: normalizeCardLabels(card.labels, palette),
    comments: normalizeComments(card.comments),
  }));
}

function createBoard(title, template = "blank", id = makeId("board"), palette = defaultLabels()) {
  return {
    id,
    title,
    template,
    cards: withCardIds(boardTemplates[template] || [], palette),
  };
}

function seedWorkspace() {
  const labels = defaultLabels();
  const boards = [
    createBoard("Website Relaunch", "launch", "board-website", labels),
    createBoard("Operations", "ops", "board-operations", labels),
    createBoard("Hiring Plan", "hiring", "board-hiring", labels),
  ];

  return {
    boards,
    labels,
    activeBoardId: boards[0].id,
    view: "dashboard",
    filter: "all",
    search: "",
    draggingId: null,
  };
}

function loadWorkspace() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.boards) && parsed.boards.length > 0) {
        return normalizeWorkspace(parsed);
      }
    }

    const legacyCards = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyCards) {
      const cards = JSON.parse(legacyCards);
      if (Array.isArray(cards)) {
        const migratedBoard = {
          id: "board-website",
          title: "Website Relaunch",
          template: "launch",
          cards: withCardIds(cards),
        };
        return normalizeWorkspace({
          boards: [migratedBoard, createBoard("Operations", "ops", "board-operations"), createBoard("Hiring Plan", "hiring", "board-hiring")],
          labels: defaultLabels(),
          activeBoardId: migratedBoard.id,
        });
      }
    }
  } catch {
    return seedWorkspace();
  }

  return seedWorkspace();
}

function normalizeWorkspace(workspace) {
  const labels = normalizeLabels(workspace.labels, workspace.boards);
  const boards = workspace.boards.map((item, index) => ({
    id: item.id || makeId("board"),
    title: item.title || `Board ${index + 1}`,
    template: item.template || "blank",
    cards: withCardIds(Array.isArray(item.cards) ? item.cards : [], labels),
  }));

  const activeBoardId = boards.some((item) => item.id === workspace.activeBoardId) ? workspace.activeBoardId : boards[0].id;

  return {
    boards,
    labels,
    activeBoardId,
    view: workspace.view || "dashboard",
    filter: workspace.filter || "all",
    search: workspace.search || "",
    draggingId: null,
  };
}

function saveWorkspace() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      boards: state.boards,
      labels: state.labels,
      activeBoardId: state.activeBoardId,
      view: state.view,
      filter: state.filter,
      search: state.search,
    })
  );
}

function activeBoard() {
  return state.boards.find((item) => item.id === state.activeBoardId) || state.boards[0];
}

function activeCards() {
  return activeBoard().cards;
}

function setActiveCards(cards) {
  activeBoard().cards = cards;
}

function render() {
  const currentBoard = activeBoard();
  renderViewControls();
  renderDashboard();
  board.innerHTML = "";
  boardTitle.textContent = currentBoard.title;
  boardMeta.textContent = `${state.boards.length} board${state.boards.length === 1 ? "" : "s"}`;
  searchInput.value = state.search;
  deleteBoardButton.disabled = state.boards.length === 1;
  deleteBoardButton.title = state.boards.length === 1 ? "Keep at least one board" : "Delete board";
  renderBoardSelect();
  renderFilterButtons();

  columns.forEach((column) => {
    const columnElement = document.createElement("article");
    columnElement.className = "column";
    columnElement.dataset.column = column.id;
    columnElement.innerHTML = `
      <header class="column-header">
        <h3 class="column-title">${column.title}</h3>
        <span class="count-pill">${cardsForColumn(column.id).length}</span>
      </header>
      <div class="card-list" data-list="${column.id}" aria-label="${column.title} cards"></div>
      <button class="add-card-button" type="button" data-add="${column.id}">
        <span aria-hidden="true">+</span>
        Card
      </button>
    `;

    const list = columnElement.querySelector(".card-list");
    const visibleCards = cardsForColumn(column.id).filter(matchesFilters);

    if (visibleCards.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "No cards";
      list.append(empty);
    } else {
      visibleCards.forEach((card) => list.append(createCard(card)));
    }

    board.append(columnElement);
  });

  updateStats();
}

function renderViewControls() {
  const isDashboard = state.view === "dashboard";
  dashboardView.classList.toggle("hidden", !isDashboard);
  boardView.classList.toggle("hidden", isDashboard);
  dashboardButton.classList.toggle("active", isDashboard);
  boardViewButton.classList.toggle("active", !isDashboard);
  searchWrap.classList.toggle("hidden", isDashboard);
  newCardButton.classList.toggle("hidden", isDashboard);
  resetBoardButton.classList.toggle("hidden", isDashboard);
}

function renderDashboard() {
  const totals = state.boards.reduce(
    (summary, item) => {
      const stats = boardStats(item);
      summary.cards += stats.total;
      summary.dueSoon += stats.dueSoon;
      summary.done += stats.done;
      return summary;
    },
    { cards: 0, dueSoon: 0, done: 0 }
  );

  workspaceBoards.textContent = state.boards.length;
  workspaceCards.textContent = totals.cards;
  workspaceDueSoon.textContent = totals.dueSoon;
  workspaceDone.textContent = totals.done;

  dashboardGrid.innerHTML = state.boards.map((item) => createDashboardCard(item)).join("");
}

function createDashboardCard(item) {
  const stats = boardStats(item);
  const percent = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  const columnCounts = columns
    .map((column) => {
      const count = item.cards.filter((card) => card.column === column.id).length;
      return `<span>${escapeHtml(column.title)} <strong>${count}</strong></span>`;
    })
    .join("");

  return `
    <button class="dashboard-card" type="button" data-open-board="${escapeAttribute(item.id)}">
      <header>
        <span class="dashboard-mark">${escapeHtml(initials(item.title))}</span>
        <div>
          <p class="eyebrow">${stats.total} card${stats.total === 1 ? "" : "s"}</p>
          <h3>${escapeHtml(item.title)}</h3>
        </div>
      </header>
      <div class="dashboard-card-stats">
        <span><strong>${stats.inProgress}</strong> Active</span>
        <span><strong>${stats.dueSoon}</strong> Due soon</span>
        <span><strong>${stats.done}</strong> Done</span>
      </div>
      <div class="progress-wrap" aria-hidden="true">
        <span style="width: ${percent}%"></span>
      </div>
      <footer>
        <div class="column-mini">${columnCounts}</div>
        <span class="open-board">Open</span>
      </footer>
    </button>
  `;
}

function renderBoardSelect() {
  boardSelect.innerHTML = state.boards
    .map((item) => `<option value="${escapeAttribute(item.id)}">${escapeHtml(item.title)}</option>`)
    .join("");
  boardSelect.value = state.activeBoardId;
}

function renderFilterButtons() {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === state.filter);
  });
}

function cardsForColumn(columnId) {
  return activeCards().filter((card) => card.column === columnId);
}

function matchesFilters(card) {
  const labelText = card.labels.map((label) => labelForCardValue(label).name).join(" ");
  const commentText = (card.comments || []).map((comment) => `${comment.user} ${comment.text}`).join(" ");
  const searchText = `${card.title} ${card.description} ${card.owner} ${labelText} ${commentText}`.toLowerCase();
  const matchesSearch = searchText.includes(state.search.toLowerCase());
  const matchesPriority = state.filter === "all" || card.priority === state.filter;
  return matchesSearch && matchesPriority;
}

function createCard(card) {
  const cardElement = document.createElement("button");
  cardElement.className = "task-card";
  cardElement.type = "button";
  cardElement.draggable = true;
  cardElement.dataset.cardId = card.id;
  const priority = card.priority || "Medium";

  const labels = card.labels
    .map((label) => {
      const labelItem = labelForCardValue(label);
      return `<span class="tag ${labelItem.color}">${escapeHtml(labelItem.name)}</span>`;
    })
    .join("");
  const commentCount = card.comments?.length || 0;

  cardElement.innerHTML = `
    <div class="card-labels">${labels}</div>
    <p class="card-title">${escapeHtml(card.title)}</p>
    <p class="card-description">${escapeHtml(card.description || "No notes")}</p>
    <div class="card-meta">
      <span class="priority ${priority.toLowerCase()}">${escapeHtml(priority)}</span>
      ${card.dueDate ? `<span class="meta-pill">Due ${formatDate(card.dueDate)}</span>` : ""}
      ${commentCount ? `<span class="meta-pill">${commentCount} comment${commentCount === 1 ? "" : "s"}</span>` : ""}
    </div>
    <footer class="card-footer">
      <span class="avatar">${escapeHtml(initials(card.owner))}</span>
      <span class="card-menu" title="Edit card" aria-hidden="true">...</span>
    </footer>
  `;

  cardElement.addEventListener("click", () => openCardDialog(card.id));
  cardElement.addEventListener("dragstart", (event) => {
    state.draggingId = card.id;
    cardElement.classList.add("dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", card.id);
  });
  cardElement.addEventListener("dragend", () => {
    state.draggingId = null;
    document.querySelectorAll(".drop-target").forEach((target) => target.classList.remove("drop-target"));
    cardElement.classList.remove("dragging");
  });

  return cardElement;
}

function formatDate(value) {
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

function initials(name) {
  if (!name) return "NA";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

function dueSoonCount(cards) {
  return cards.filter((card) => {
    if (!card.dueDate || card.column === "done") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(`${card.dueDate}T00:00:00`);
    const diff = (due - today) / 86400000;
    return diff >= 0 && diff <= 3;
  }).length;
}

function boardStats(item) {
  const cards = item.cards || [];
  return {
    total: cards.length,
    done: cards.filter((card) => card.column === "done").length,
    dueSoon: dueSoonCount(cards),
    inProgress: cards.filter((card) => card.column === "progress" || card.column === "review").length,
  };
}

function updateStats() {
  totalCards.textContent = activeCards().length;
  completedCards.textContent = cardsForColumn("done").length;
  dueSoonCards.textContent = dueSoonCount(activeCards());
}

function populateColumns() {
  columnInput.innerHTML = columns.map((column) => `<option value="${column.id}">${column.title}</option>`).join("");
}

function renderCardLabelOptions(selectedLabels = []) {
  cardLabels.innerHTML = state.labels
    .map((label) => {
      const checked = selectedLabels.includes(label.id) ? "checked" : "";
      return `
        <label class="check-label">
          <input type="checkbox" name="labels" value="${escapeAttribute(label.id)}" ${checked} />
          <span class="label-dot ${label.color}"></span>
          ${escapeHtml(label.name)}
        </label>
      `;
    })
    .join("");
}

function renderComments(card) {
  const comments = card?.comments || [];
  commentsList.innerHTML =
    comments.length === 0
      ? '<div class="empty-state compact">No comments yet</div>'
      : comments
          .map(
            (comment) => `
              <article class="comment-item">
                <div class="comment-avatar">${escapeHtml(initials(comment.user))}</div>
                <div>
                  <header>
                    <strong>${escapeHtml(comment.user)}</strong>
                    <span>${escapeHtml(formatCommentDate(comment.createdAt))}</span>
                  </header>
                  <p>${escapeHtml(comment.text)}</p>
                </div>
              </article>
            `
          )
          .join("");
}

function formatCommentDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

function openCardDialog(cardId, columnId = "todo") {
  const card = activeCards().find((item) => item.id === cardId);
  const isEditing = Boolean(card);

  dialogMode.textContent = isEditing ? "Edit Card" : "New Card";
  deleteCardButton.classList.toggle("hidden", !isEditing);
  cardIdInput.value = card?.id || "";
  titleInput.value = card?.title || "";
  descriptionInput.value = card?.description || "";
  columnInput.value = card?.column || columnId;
  priorityInput.value = card?.priority || "Medium";
  ownerInput.value = card?.owner || "";
  dueDateInput.value = card?.dueDate || "";
  renderCardLabelOptions(card?.labels || []);
  commentsPanel.classList.toggle("hidden", !isEditing);
  renderComments(card);
  commentUserInput.value = card?.owner || "";
  commentTextInput.value = "";

  cardDialog.showModal();
  titleInput.focus();
}

function closeCardDialog() {
  cardForm.reset();
  commentTextInput.value = "";
  cardDialog.close();
}

function upsertCard(event) {
  event.preventDefault();
  const formData = new FormData(cardForm);
  const selectedLabels = formData.getAll("labels");
  const id = cardIdInput.value || makeId("card");
  const existingCard = activeCards().find((card) => card.id === id);
  const nextCard = {
    id,
    column: columnInput.value,
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    priority: priorityInput.value,
    owner: ownerInput.value.trim() || "Unassigned",
    dueDate: dueDateInput.value,
    labels: selectedLabels,
    comments: existingCard?.comments || [],
  };

  const cards = activeCards();
  const existingIndex = cards.findIndex((card) => card.id === id);
  if (existingIndex >= 0) {
    cards.splice(existingIndex, 1, nextCard);
  } else {
    cards.push(nextCard);
  }

  saveWorkspace();
  closeCardDialog();
  render();
}

function deleteActiveCard() {
  const id = cardIdInput.value;
  setActiveCards(activeCards().filter((card) => card.id !== id));
  saveWorkspace();
  closeCardDialog();
  render();
}

function addCommentToActiveCard() {
  const id = cardIdInput.value;
  const card = activeCards().find((item) => item.id === id);
  const text = commentTextInput.value.trim();
  if (!card || !text) return;

  const user = commentUserInput.value.trim() || "Guest";
  card.comments = [
    ...(card.comments || []),
    {
      id: makeId("comment"),
      user,
      text,
      createdAt: new Date().toISOString(),
    },
  ];

  commentTextInput.value = "";
  saveWorkspace();
  renderComments(card);
  render();
}

function moveCard(cardId, targetColumn, beforeCardId = null) {
  const moving = activeCards().find((card) => card.id === cardId);
  if (!moving) return;

  const nextCards = activeCards().filter((card) => card.id !== cardId);
  moving.column = targetColumn;

  if (!beforeCardId) {
    nextCards.push(moving);
  } else {
    const targetIndex = nextCards.findIndex((card) => card.id === beforeCardId);
    if (targetIndex >= 0) {
      nextCards.splice(targetIndex, 0, moving);
    } else {
      nextCards.push(moving);
    }
  }

  setActiveCards(nextCards);
  saveWorkspace();
  render();
}

function cardAfterPointer(list, y) {
  const cards = [...list.querySelectorAll(".task-card:not(.dragging):not(.hidden)")];
  return cards.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      }
      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY, element: null }
  ).element;
}

function openBoardDialog(mode) {
  const isEditing = mode === "edit";
  const currentBoard = activeBoard();

  boardDialogMode.textContent = isEditing ? "Rename Board" : "New Board";
  boardTemplateWrap.classList.toggle("hidden", isEditing);
  boardIdInput.value = isEditing ? currentBoard.id : "";
  boardNameInput.value = isEditing ? currentBoard.title : "";
  boardTemplateInput.value = "blank";

  boardDialog.showModal();
  boardNameInput.focus();
}

function closeBoardDialog() {
  boardForm.reset();
  boardDialog.close();
}

function saveBoardDetails(event) {
  event.preventDefault();
  const name = boardNameInput.value.trim();
  if (!name) return;

  if (boardIdInput.value) {
    activeBoard().title = name;
  } else {
    const nextBoard = createBoard(name, boardTemplateInput.value, makeId("board"), state.labels);
    state.boards.push(nextBoard);
    state.activeBoardId = nextBoard.id;
    state.view = "board";
    state.search = "";
  }

  saveWorkspace();
  closeBoardDialog();
  render();
}

function deleteActiveBoard() {
  if (state.boards.length === 1) return;
  const currentBoard = activeBoard();
  const confirmed = confirm(`Delete "${currentBoard.title}" and all of its cards?`);
  if (!confirmed) return;

  const deletedIndex = state.boards.findIndex((item) => item.id === currentBoard.id);
  state.boards = state.boards.filter((item) => item.id !== currentBoard.id);
  state.activeBoardId = state.boards[Math.max(0, deletedIndex - 1)]?.id || state.boards[0].id;
  state.search = "";

  saveWorkspace();
  render();
}

function openLabelsDialog() {
  renderLabelEditor();
  newLabelNameInput.value = "";
  newLabelColorInput.value = "teal";
  labelsDialog.showModal();
  newLabelNameInput.focus();
}

function closeLabelsDialog() {
  labelsForm.reset();
  labelsDialog.close();
}

function renderLabelEditor() {
  labelsList.innerHTML = state.labels.map((label) => labelEditorRow(label)).join("");
}

function labelEditorRow(label) {
  const colorOptions = labelColors
    .map((color) => `<option value="${color}" ${label.color === color ? "selected" : ""}>${colorLabel(color)}</option>`)
    .join("");

  return `
    <article class="label-row" data-label-id="${escapeAttribute(label.id)}">
      <span class="label-dot ${label.color}" aria-hidden="true"></span>
      <input class="label-name-input" type="text" value="${escapeAttribute(label.name)}" maxlength="28" aria-label="Label name" />
      <select class="label-color-input" aria-label="Label color">${colorOptions}</select>
      <button class="icon-button danger-icon" type="button" data-delete-label="${escapeAttribute(label.id)}" title="Delete label" aria-label="Delete label">X</button>
    </article>
  `;
}

function colorLabel(color) {
  return color.charAt(0).toUpperCase() + color.slice(1);
}

function addLabelRow() {
  const name = newLabelNameInput.value.trim();
  if (!name) return;
  const duplicate = [...labelsList.querySelectorAll(".label-name-input")].some(
    (input) => input.value.trim().toLowerCase() === name.toLowerCase()
  );
  if (duplicate) return;

  const label = {
    id: makeId("label"),
    name,
    color: newLabelColorInput.value,
  };
  labelsList.insertAdjacentHTML("beforeend", labelEditorRow(label));
  newLabelNameInput.value = "";
  newLabelColorInput.value = "teal";
  newLabelNameInput.focus();
}

function saveLabels(event) {
  event.preventDefault();
  const nextLabels = [];
  labelsList.querySelectorAll(".label-row").forEach((row) => {
    const name = row.querySelector(".label-name-input").value.trim();
    const color = row.querySelector(".label-color-input").value;
    if (!name) return;
    const duplicate = nextLabels.some((label) => label.name.toLowerCase() === name.toLowerCase());
    if (duplicate) return;
    nextLabels.push({
      id: row.dataset.labelId,
      name,
      color: labelColors.includes(color) ? color : "slate",
    });
  });

  state.labels = nextLabels.length > 0 ? nextLabels : [{ id: makeId("label"), name: "General", color: "slate" }];
  const validLabelIds = new Set(state.labels.map((label) => label.id));
  state.boards.forEach((boardItem) => {
    boardItem.cards.forEach((card) => {
      card.labels = card.labels.filter((label) => validLabelIds.has(label));
    });
  });

  saveWorkspace();
  closeLabelsDialog();
  render();
}

function updateLabelPreview(event) {
  const colorSelect = event.target.closest(".label-color-input");
  if (!colorSelect) return;

  const row = colorSelect.closest(".label-row");
  const dot = row.querySelector(".label-dot");
  dot.className = `label-dot ${colorSelect.value}`;
}

board.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  if (addButton) {
    openCardDialog(null, addButton.dataset.add);
  }
});

board.addEventListener("dragover", (event) => {
  const list = event.target.closest(".card-list");
  if (!list || !state.draggingId) return;

  event.preventDefault();
  document.querySelectorAll(".drop-target").forEach((target) => target.classList.remove("drop-target"));
  list.classList.add("drop-target");
});

board.addEventListener("drop", (event) => {
  const list = event.target.closest(".card-list");
  if (!list || !state.draggingId) return;

  event.preventDefault();
  const beforeCard = cardAfterPointer(list, event.clientY);
  moveCard(state.draggingId, list.dataset.list, beforeCard?.dataset.cardId || null);
});

dashboardGrid.addEventListener("click", (event) => {
  const boardCard = event.target.closest("[data-open-board]");
  if (!boardCard) return;

  state.activeBoardId = boardCard.dataset.openBoard;
  state.view = "board";
  state.search = "";
  saveWorkspace();
  render();
});

dashboardButton.addEventListener("click", () => {
  state.view = "dashboard";
  saveWorkspace();
  render();
});

boardViewButton.addEventListener("click", () => {
  state.view = "board";
  saveWorkspace();
  render();
});

newCardButton.addEventListener("click", () => openCardDialog(null, "todo"));
document.querySelector("#closeDialogButton").addEventListener("click", closeCardDialog);
document.querySelector("#cancelButton").addEventListener("click", closeCardDialog);
deleteCardButton.addEventListener("click", deleteActiveCard);
addCommentButton.addEventListener("click", addCommentToActiveCard);
cardForm.addEventListener("submit", upsertCard);

labelsButton.addEventListener("click", openLabelsDialog);
document.querySelector("#closeLabelsDialogButton").addEventListener("click", closeLabelsDialog);
document.querySelector("#cancelLabelsButton").addEventListener("click", closeLabelsDialog);
addLabelButton.addEventListener("click", addLabelRow);
labelsForm.addEventListener("submit", saveLabels);
labelsList.addEventListener("change", updateLabelPreview);
labelsList.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-label]");
  if (!deleteButton) return;
  deleteButton.closest(".label-row").remove();
});

document.querySelector("#newBoardButton").addEventListener("click", () => openBoardDialog("new"));
dashboardNewBoardButton.addEventListener("click", () => openBoardDialog("new"));
document.querySelector("#renameBoardButton").addEventListener("click", () => openBoardDialog("edit"));
document.querySelector("#deleteBoardButton").addEventListener("click", deleteActiveBoard);
document.querySelector("#closeBoardDialogButton").addEventListener("click", closeBoardDialog);
document.querySelector("#cancelBoardButton").addEventListener("click", closeBoardDialog);
boardForm.addEventListener("submit", saveBoardDetails);

resetBoardButton.addEventListener("click", () => {
  const currentBoard = activeBoard();
  currentBoard.cards = withCardIds(boardTemplates[currentBoard.template] || [], state.labels);
  saveWorkspace();
  render();
});

boardSelect.addEventListener("change", (event) => {
  state.activeBoardId = event.target.value;
  state.view = "board";
  state.search = "";
  saveWorkspace();
  render();
});

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  saveWorkspace();
  render();
});

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-filter]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state.filter = button.dataset.filter;
    saveWorkspace();
    render();
  });
});

populateColumns();
render();
