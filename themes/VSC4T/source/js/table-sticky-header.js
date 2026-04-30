/**
 * 表格首行悬挂功能
 * 当表格在垂直方向超出视口时,表头固定在页面顶部,类似Excel冻结窗格
 */
(function() {
  'use strict';

  var tables = [];

  /**
   * 获取固定导航栏的实际底部位置（动态计算）
   */
  function getHeaderBottom() {
    var header = document.querySelector('.vs-header');
    if (!header) return 0;
    return header.getBoundingClientRect().bottom;
  }

  /**
   * 检查元素是否处于折叠的 <details> 内
   */
  function isInCollapsedDetails(el) {
    var p = el.parentElement;
    while (p) {
      if (p.tagName === 'DETAILS' && !p.open) return true;
      p = p.parentElement;
    }
    return false;
  }

  /**
   * 初始化所有表格：包裹 wrapper + 创建浮动表头
   */
  function initTables() {
    var allTables = document.querySelectorAll('.vscode-markdown table');

    allTables.forEach(function(table) {
      var thead = table.querySelector('thead');
      if (!thead) return;

      // 包裹 table-wrapper（如果尚未包裹）
      var wrapper = table.parentElement;
      if (!wrapper.classList.contains('table-wrapper')) {
        wrapper = document.createElement('div');
        wrapper.className = 'table-wrapper';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }

      var info = {
        table: table,
        thead: thead,
        wrapper: wrapper,
        floatingHeader: null,
        clonedTable: null,
        syncLayer: null,
        isActive: false
      };

      tables.push(info);
    });

    // 延迟创建浮动表头，等布局稳定
    setTimeout(function() {
      tables.forEach(function(info) { createFloatingHeader(info); });
    }, 300);
  }

  /**
   * 创建浮动表头 DOM
   */
  function createFloatingHeader(info) {
    var fh = document.createElement('div');
    fh.className = 'table-floating-header';
    fh.style.cssText =
      'position:fixed;z-index:999;display:none;overflow:hidden;' +
      'background-color:var(--vscode-bg-light);' +
      'border-bottom:1px solid var(--vscode-border);' +
      'box-shadow:0 2px 8px rgba(0,0,0,0.15);';

    // 同步层：通过 transform 跟随横向滚动
    var syncLayer = document.createElement('div');
    syncLayer.className = 'table-sync-layer';

    // 克隆表头
    var clonedTable = document.createElement('table');
    clonedTable.style.cssText = 'margin:0;border-collapse:collapse;';
    clonedTable.appendChild(info.thead.cloneNode(true));

    syncLayer.appendChild(clonedTable);
    fh.appendChild(syncLayer);
    document.body.appendChild(fh);

    info.floatingHeader = fh;
    info.clonedTable = clonedTable;
    info.syncLayer = syncLayer;

    // 横向滚动同步
    info.wrapper.addEventListener('scroll', function() {
      if (info.isActive) {
        info.syncLayer.style.transform = 'translateX(' + (-info.wrapper.scrollLeft) + 'px)';
      }
    });

    // 监听 details 的 toggle 事件
    var details = info.wrapper.closest('details');
    if (details) {
      details.addEventListener('toggle', function() {
        if (!details.open && info.isActive) {
          info.floatingHeader.style.display = 'none';
          info.isActive = false;
        }
      });
    }
  }

  /**
   * 同步列宽（源表 -> 克隆表）
   */
  function syncColumnWidths(srcTable, tgtTable) {
    var srcThs = srcTable.querySelectorAll('thead th');
    var tgtThs = tgtTable.querySelectorAll('thead th');
    for (var i = 0; i < srcThs.length; i++) {
      if (tgtThs[i]) {
        var w = srcThs[i].offsetWidth;
        tgtThs[i].style.width = w + 'px';
        tgtThs[i].style.minWidth = w + 'px';
      }
    }
  }

  /**
   * 更新单个表格的浮动表头状态
   */
  function updateTable(info) {
    var fh = info.floatingHeader;
    if (!fh) return;

    // 折叠状态检查
    if (isInCollapsedDetails(info.wrapper)) {
      if (info.isActive) { fh.style.display = 'none'; info.isActive = false; }
      return;
    }

    var headerBottom = getHeaderBottom();
    var theadRect = info.thead.getBoundingClientRect();
    var wrapperRect = info.wrapper.getBoundingClientRect();

    // 表头已滚出导航栏底部 && 表格底部仍然可见
    var needSticky = theadRect.bottom <= headerBottom && wrapperRect.bottom > headerBottom + 30;

    if (needSticky) {
      if (!info.isActive) {
        fh.style.display = 'block';
        info.isActive = true;
      }
      // 位置 = 导航栏底部, 宽度 = wrapper 可见宽度
      fh.style.top = headerBottom + 'px';
      fh.style.left = wrapperRect.left + 'px';
      fh.style.width = wrapperRect.width + 'px';

      // 克隆表宽度 = 原表全宽（可能超出 wrapper，由 overflow:hidden 裁剪）
      info.clonedTable.style.width = info.table.offsetWidth + 'px';
      syncColumnWidths(info.table, info.clonedTable);

      // 同步横向滚动偏移
      info.syncLayer.style.transform = 'translateX(' + (-info.wrapper.scrollLeft) + 'px)';

    } else if (info.isActive) {
      fh.style.display = 'none';
      info.isActive = false;
    }
  }

  // ---- 滚动 & resize ----
  var ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function() {
        tables.forEach(updateTable);
        ticking = false;
      });
      ticking = true;
    }
  }

  function onResize() {
    tables.forEach(function(info) {
      if (info.floatingHeader) {
        info.floatingHeader.style.display = 'none';
        info.isActive = false;
      }
    });
    setTimeout(function() { tables.forEach(updateTable); }, 100);
  }

  // ---- 启动 ----
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initTables, 200);
      });
    } else {
      setTimeout(initTables, 200);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
  }

  init();
})();
