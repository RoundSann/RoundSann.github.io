/**
 * 表格首行悬挂功能
 * 当表格过长时,让表头固定在页面顶部,类似Excel的冻结窗格
 */
(function() {
  'use strict';

  // 配置
  const HEADER_HEIGHT = 60; // 固定导航栏高度
  const STICKY_Z_INDEX = 999; // sticky表头的z-index

  // 存储所有表格信息
  const tables = [];

  /**
   * 初始化所有表格
   */
  function initTables() {
    // 查找所有表格
    const allTables = document.querySelectorAll('.vscode-markdown table');

    allTables.forEach((table, index) => {
      const thead = table.querySelector('thead');
      if (!thead) return;

      // 为每个表格创建包装容器（如果还没有）
      let wrapper = table.parentElement;
      if (!wrapper.classList.contains('table-wrapper')) {
        wrapper = document.createElement('div');
        wrapper.className = 'table-wrapper';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }

      // 存储表格信息
      tables.push({
        table: table,
        thead: thead,
        wrapper: wrapper,
        stickyThead: null,
        isSticky: false,
        lastScrollLeft: 0
      });
    });

    // 创建sticky表头（延迟创建，避免影响初始渲染）
    setTimeout(() => {
      tables.forEach(tableInfo => createStickyThead(tableInfo));
    }, 100);
  }

  /**
   * 创建sticky表头（克隆原始表头）
   */
  function createStickyThead(tableInfo) {
    const { thead, wrapper } = tableInfo;

    // 创建sticky表头容器
    const stickyContainer = document.createElement('div');
    stickyContainer.className = 'sticky-thead-container';
    stickyContainer.style.cssText = `
      position: fixed;
      top: ${HEADER_HEIGHT}px;
      left: 0;
      right: 0;
      z-index: ${STICKY_Z_INDEX};
      display: none;
      overflow-x: auto;
      background-color: var(--vscode-bg-light);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      border-bottom: 1px solid var(--vscode-border);
    `;

    // 克隆表头
    const clonedThead = thead.cloneNode(true);
    const clonedTable = document.createElement('table');
    clonedTable.appendChild(clonedThead);
    clonedTable.style.cssText = `
      width: ${tableInfo.table.offsetWidth}px;
      margin: 0;
      border-collapse: collapse;
    `;

    // 同步列宽
    syncColumnWidths(tableInfo.table, clonedTable);

    stickyContainer.appendChild(clonedTable);
    document.body.appendChild(stickyContainer);

    tableInfo.stickyThead = stickyContainer;
    tableInfo.clonedTable = clonedTable;

    // 监听表格容器的横向滚动
    wrapper.addEventListener('scroll', () => {
      if (tableInfo.isSticky) {
        tableInfo.stickyThead.scrollLeft = wrapper.scrollLeft;
      }
      tableInfo.lastScrollLeft = wrapper.scrollLeft;
    });
  }

  /**
   * 同步列宽
   */
  function syncColumnWidths(sourceTable, targetTable) {
    const sourceThs = sourceTable.querySelectorAll('thead th');
    const targetThs = targetTable.querySelectorAll('thead th');

    sourceThs.forEach((th, index) => {
      if (targetThs[index]) {
        targetThs[index].style.width = `${th.offsetWidth}px`;
        targetThs[index].style.minWidth = `${th.offsetWidth}px`;
      }
    });
  }

  /**
   * 检查元素是否在视口中
   */
  function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.bottom > HEADER_HEIGHT &&
      rect.top < window.innerHeight
    );
  }

  /**
   * 检查表格是否需要sticky表头
   */
  function shouldShowSticky(tableInfo) {
    const tableRect = tableInfo.table.getBoundingClientRect();
    const theadRect = tableInfo.thead.getBoundingClientRect();

    // 表头已经滚出视口顶部（在导航栏下方）
    const theadAboveViewport = theadRect.bottom <= HEADER_HEIGHT;

    // 表格底部还在视口中
    const tableStillVisible = tableRect.bottom > HEADER_HEIGHT + 50;

    return theadAboveViewport && tableStillVisible;
  }

  /**
   * 更新sticky表头位置
   */
  function updateStickyThead(tableInfo) {
    const { wrapper, stickyThead, clonedTable } = tableInfo;

    if (!stickyThead) return;

    const needSticky = shouldShowSticky(tableInfo);

    if (needSticky && !tableInfo.isSticky) {
      // 显示sticky表头
      stickyThead.style.display = 'block';
      tableInfo.isSticky = true;

      // 同步横向滚动位置
      stickyThead.scrollLeft = wrapper.scrollLeft;

      // 更新宽度
      clonedTable.style.width = `${tableInfo.table.offsetWidth}px`;
      syncColumnWidths(tableInfo.table, clonedTable);

      // 设置sticky表头的位置
      const tableRect = tableInfo.table.getBoundingClientRect();
      stickyThead.style.left = `${tableRect.left}px`;
      stickyThead.style.width = `${tableRect.width}px`;

    } else if (!needSticky && tableInfo.isSticky) {
      // 隐藏sticky表头
      stickyThead.style.display = 'none';
      tableInfo.isSticky = false;

    } else if (needSticky && tableInfo.isSticky) {
      // 更新位置和宽度
      const tableRect = tableInfo.table.getBoundingClientRect();
      stickyThead.style.left = `${tableRect.left}px`;
      stickyThead.style.width = `${tableRect.width}px`;
      clonedTable.style.width = `${tableInfo.table.offsetWidth}px`;

      // 同步列宽（响应窗口大小变化）
      syncColumnWidths(tableInfo.table, clonedTable);
    }
  }

  /**
   * 滚动事件处理器（使用节流）
   */
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        tables.forEach(tableInfo => updateStickyThead(tableInfo));
        ticking = false;
      });
      ticking = true;
    }
  }

  /**
   * 窗口大小改变时重新计算
   */
  function onResize() {
    // 隐藏所有sticky表头
    tables.forEach(tableInfo => {
      if (tableInfo.stickyThead) {
        tableInfo.stickyThead.style.display = 'none';
        tableInfo.isSticky = false;
      }
    });

    // 延迟重新计算
    setTimeout(() => {
      tables.forEach(tableInfo => {
        if (tableInfo.clonedTable) {
          tableInfo.clonedTable.style.width = `${tableInfo.table.offsetWidth}px`;
          syncColumnWidths(tableInfo.table, tableInfo.clonedTable);
        }
        updateStickyThead(tableInfo);
      });
    }, 100);
  }

  /**
   * 初始化
   */
  function init() {
    // 等待DOM完全加载
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initTables, 200);
      });
    } else {
      setTimeout(initTables, 200);
    }

    // 监听滚动事件
    window.addEventListener('scroll', onScroll, { passive: true });

    // 监听窗口大小改变
    window.addEventListener('resize', onResize, { passive: true });
  }

  // 启动
  init();

  // 暴露API供调试使用
  window.TableStickyHeader = {
    refresh: initTables,
    tables: tables
  };
})();
