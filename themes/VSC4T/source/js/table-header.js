(function () {
  const FLOATING_CLASS = 'floating-table-header';
  const ACTIVE_CLASS = 'is-visible';
  const HEADER_OFFSET = 48;

  function getTables() {
    return Array.from(document.querySelectorAll('.post-body table')).filter((table) => {
      return table.tHead && table.tHead.rows.length > 0;
    });
  }

  function isWideTable(table) {
    return table.scrollWidth > table.clientWidth + 1;
  }

  function setColumnWidths(sourceRow, cloneRow) {
    if (!sourceRow || !cloneRow) return;

    Array.from(sourceRow.cells).forEach((cell, index) => {
      const cloneCell = cloneRow.cells[index];
      if (!cloneCell) return;

      const width = cell.getBoundingClientRect().width;
      cloneCell.style.width = `${width}px`;
      cloneCell.style.minWidth = `${width}px`;
      cloneCell.style.maxWidth = `${width}px`;
    });
  }

  function createFloatingHeader(table) {
    const floating = document.createElement('div');
    floating.className = FLOATING_CLASS;
    floating.setAttribute('aria-hidden', 'true');

    const cloneTable = document.createElement('table');
    const cloneHead = table.tHead.cloneNode(true);
    cloneTable.appendChild(cloneHead);
    floating.appendChild(cloneTable);
    document.body.appendChild(floating);

    return { floating, cloneTable, cloneHead };
  }

  function initTable(table) {
    const state = createFloatingHeader(table);
    table.__floatingHeader = state;

    const update = () => updateTable(table);
    table.addEventListener('scroll', update, { passive: true });
  }

  function updateTable(table) {
    if (!table.__floatingHeader) return;

    const { floating, cloneTable, cloneHead } = table.__floatingHeader;
    const rect = table.getBoundingClientRect();
    const headRect = table.tHead.getBoundingClientRect();
    const shouldShow =
      isWideTable(table) &&
      rect.top < HEADER_OFFSET &&
      rect.bottom > HEADER_OFFSET + headRect.height;

    floating.classList.toggle(ACTIVE_CLASS, shouldShow);
    if (!shouldShow) return;

    floating.style.top = `${HEADER_OFFSET}px`;
    floating.style.left = `${rect.left}px`;
    floating.style.width = `${rect.width}px`;
    floating.style.height = `${headRect.height}px`;

    cloneTable.style.width = `${table.scrollWidth}px`;
    cloneTable.style.transform = `translateX(${-table.scrollLeft}px)`;

    setColumnWidths(table.tHead.rows[0], cloneHead.rows[0]);
  }

  function updateAll() {
    getTables().forEach((table) => {
      if (!table.__floatingHeader) {
        initTable(table);
      }
      updateTable(table);
    });
  }

  function init() {
    updateAll();
    window.addEventListener('scroll', updateAll, { passive: true });
    window.addEventListener('resize', updateAll);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
