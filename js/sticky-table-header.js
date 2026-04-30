/**
 * 表格首行悬浮功能
 * 当表格过长超出可视区域时，表头会悬浮在页面顶端
 * 让读者知道自己在读的数据隶属于哪一列
 */

(function() {
  'use strict';

  // 悬浮表头容器
  let stickyContainer = null;

  // 当前激活的悬浮表头
  let activeStickyHeaders = new Map();

  // 获取页面顶栏的高度
  function getHeaderHeight() {
    const header = document.querySelector('.vs-header');
    return header ? header.offsetHeight : 48;
  }

  // 创建悬浮表头容器
  function createStickyContainer() {
    if (stickyContainer) return;

    stickyContainer = document.createElement('div');
    stickyContainer.id = 'sticky-table-headers-container';
    stickyContainer.style.cssText = `
      position: fixed;
      top: ${getHeaderHeight()}px;
      left: 0;
      width: 100%;
      z-index: 99;
      pointer-events: none;
      display: block;
    `;
    document.body.appendChild(stickyContainer);
  }

  // 为表格创建克隆表头
  function createCloneHeader(table) {
    const thead = table.querySelector('thead');
    if (!thead) return null;

    // 创建克隆
    const clone = thead.cloneNode(true);
    clone.removeAttribute('id');

    // 创建包装容器
    const wrapper = document.createElement('div');
    wrapper.className = 'sticky-header-clone';
    wrapper.dataset.tableId = table.dataset.stickyId || '';
    wrapper.style.cssText = `
      pointer-events: auto;
      visibility: hidden;
      opacity: 0;
      transition: opacity 0.15s ease, visibility 0.15s ease;
    `;

    // 创建克隆表格
    const cloneTable = document.createElement('table');
    cloneTable.className = table.className + ' sticky-clone-table';
    cloneTable.style.cssText = `
      width: ${table.offsetWidth}px;
      margin: 0;
    `;
    cloneTable.appendChild(clone);

    wrapper.appendChild(cloneTable);
    return wrapper;
  }

  // 更新克隆表头的宽度和位置
  function updateClonePosition(table, cloneWrapper) {
    const tableRect = table.getBoundingClientRect();
    const cloneTable = cloneWrapper.querySelector('table');
    const cloneThead = cloneWrapper.querySelector('thead');

    // 更新宽度
    cloneTable.style.width = `${table.offsetWidth}px`;

    // 更新位置
    cloneWrapper.style.left = `${tableRect.left}px`;

    // 同步列宽
    const originalThs = table.querySelectorAll('thead th');
    const cloneThs = clone.querySelectorAll('th');

    originalThs.forEach((th, index) => {
      if (cloneThs[index]) {
        cloneThs[index].style.width = `${th.offsetWidth}px`;
        cloneThs[index].style.minWidth = `${th.offsetWidth}px`;
      }
    });
  }

  // 初始化表格悬浮功能
  function initStickyTableHeaders() {
    const tables = document.querySelectorAll('.vscode-markdown table, .post-body table');

    if (tables.length === 0) return;

    // 创建悬浮容器
    createStickyContainer();

    // 给每个表格分配唯一 ID
    tables.forEach((table, index) => {
      const stickyId = `sticky-table-${index}`;
      table.dataset.stickyId = stickyId;

      // 创建克隆表头
      const cloneWrapper = createCloneHeader(table);
      if (cloneWrapper) {
        stickyContainer.appendChild(cloneWrapper);
        activeStickyHeaders.set(stickyId, {
          table: table,
          clone: cloneWrapper,
          active: false
        });
      }
    });

    // 开始监听滚动
    startScrollListener();
  }

  // 滚动监听器
  let scrollListenerActive = false;
  function startScrollListener() {
    if (scrollListenerActive) return;
    scrollListenerActive = true;

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    // 初始检查
    handleScroll();
  }

  // 处理滚动事件
  let scrollRAF = null;
  function handleScroll() {
    if (scrollRAF) {
      cancelAnimationFrame(scrollRAF);
    }

    scrollRAF = requestAnimationFrame(() => {
      const headerHeight = getHeaderHeight();
      const containerTop = headerHeight;

      // 更新容器位置
      if (stickyContainer) {
        stickyContainer.style.top = `${containerTop}px`;
      }

      // 检查每个表格
      activeStickyHeaders.forEach((data, id) => {
        const { table, clone, active } = data;
        const tableRect = table.getBoundingClientRect();

        // 判断是否需要显示悬浮表头：
        // 1. 表格顶部已经滚出视口顶部（低于 header）
        // 2. 表格底部仍然在视口内
        const needSticky = tableRect.top < containerTop && tableRect.bottom > containerTop;

        if (needSticky && !active) {
          // 激活悬浮
          showStickyHeader(data);
        } else if (!needSticky && active) {
          // 取消悬浮
          hideStickyHeader(data);
        }

        if (needSticky) {
          // 更新位置
          updateClonePosition(table, clone);
        }
      });
    });
  }

  // 处理窗口大小变化
  let resizeTimeout = null;
  function handleResize() {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }

    resizeTimeout = setTimeout(() => {
      // 更新容器位置
      if (stickyContainer) {
        stickyContainer.style.top = `${getHeaderHeight()}px`;
      }

      // 更新所有活跃的克隆表头
      activeStickyHeaders.forEach((data) => {
        if (data.active) {
          updateClonePosition(data.table, data.clone);
        }
      });
    }, 100);
  }

  // 显示悬浮表头
  function showStickyHeader(data) {
    data.active = true;
    data.clone.style.visibility = 'visible';
    data.clone.style.opacity = '1';
    updateClonePosition(data.table, data.clone);
  }

  // 隐藏悬浮表头
  function hideStickyHeader(data) {
    data.active = false;
    data.clone.style.visibility = 'hidden';
    data.clone.style.opacity = '0';
  }

  // 初始化
  function init() {
    // 等待 DOM 和资源加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        // 延迟初始化，确保所有样式都已应用
        setTimeout(initStickyTableHeaders, 100);
      });
    } else {
      setTimeout(initStickyTableHeaders, 100);
    }
  }

  // 执行初始化
  init();

  // 暴露 API 以便手动重新初始化（例如在动态加载内容后）
  window.StickyTableHeaders = {
    init: initStickyTableHeaders,
    refresh: function() {
      // 清理旧的
      if (stickyContainer) {
        stickyContainer.remove();
        stickyContainer = null;
      }
      activeStickyHeaders.clear();
      // 重新初始化
      initStickyTableHeaders();
    }
  };

})();