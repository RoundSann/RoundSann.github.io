/**
 * 表格首行悬挂功能
 * 当表格在垂直方向超出视口时，克隆表头固定在导航栏下方
 */
(function() {
  'use strict';

  var tables = [];

  /**
   * 获取导航栏底部相对于视口的实时位置
   */
  function getNavBottom() {
    var nav = document.querySelector('.vs-header');
    if (!nav) return 0;
    return nav.getBoundingClientRect().bottom;
  }

  /**
   * 检测元素是否位于折叠的 <details> 内
   */
  function isHiddenByDetails(el) {
    var p = el.parentElement;
    while (p) {
      if (p.tagName === 'DETAILS' && !p.open) return true;
      p = p.parentElement;
    }
    return false;
  }

  /**
   * 初始化：遍历所有表格，创建 wrapper 和克隆表头
   */
  function init() {
    var allTables = document.querySelectorAll('.vscode-markdown table');
    allTables.forEach(function(table) {
      var thead = table.querySelector('thead');
      if (!thead) return;

      // 如果还没有 wrapper，创建一个
      var wrapper = table.parentElement;
      if (!wrapper.classList.contains('table-wrapper')) {
        wrapper = document.createElement('div');
        wrapper.className = 'table-wrapper';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }

      // 创建浮动表头
      var floatDiv = document.createElement('div');
      floatDiv.className = 'table-floating-header';
      floatDiv.style.display = 'none';
      document.body.appendChild(floatDiv);

      var info = {
        table: table,
        thead: thead,
        wrapper: wrapper,
        floatDiv: floatDiv,
        active: false
      };

      // 监听 wrapper 横向滚动，同步到浮动表头
      wrapper.addEventListener('scroll', function() {
        if (info.active) {
          info.floatDiv.scrollLeft = wrapper.scrollLeft;
        }
      });

      // 监听 details toggle
      var details = wrapper.closest('details');
      if (details) {
        details.addEventListener('toggle', function() {
          if (!details.open) {
            floatDiv.style.display = 'none';
            info.active = false;
          }
        });
      }

      tables.push(info);
    });
  }

  /**
   * 重建克隆表头的内部 HTML（延迟调用，等列宽稳定）
   */
  function rebuildClone(info) {
    var thead = info.thead;
    var table = info.table;
    var wrapper = info.wrapper;

    // 测量原始列宽
    var origThs = thead.querySelectorAll('th');
    var colWidths = [];
    origThs.forEach(function(th) { colWidths.push(th.offsetWidth); });

    // 计算总宽度
    var totalWidth = 0;
    colWidths.forEach(function(w) { totalWidth += w; });

    // 构建内部 HTML：一个宽度=原表的 table
    var html = '<table style="margin:0;border-collapse:collapse;width:' + totalWidth + 'px">';
    html += '<thead style="background-color:var(--vscode-bg-light);border-bottom:1px solid var(--vscode-border)">';
    html += '<tr>';
    origThs.forEach(function(th, i) {
      html += '<th style="' +
        'width:' + colWidths[i] + 'px;' +
        'min-width:' + colWidths[i] + 'px;' +
        'padding:' + (th.style.padding || '10px 15px') + ';' +
        'text-align:left;' +
        'font-weight:500;' +
        'color:var(--vscode-accent-light);' +
        'border-right:1px solid var(--vscode-border);' +
        '">' + th.innerHTML + '</th>';
    });
    html += '</tr></thead></table>';

    info.floatDiv.innerHTML = html;
  }

  /**
   * 主更新逻辑：每帧检查每个表格是否需要显示/隐藏浮动表头
   */
  function update() {
    var navBottom = getNavBottom();

    tables.forEach(function(info) {
      var fd = info.floatDiv;
      if (!fd) return;

      // 如果表格被折叠的 details 隐藏，立即关闭
      if (isHiddenByDetails(info.wrapper)) {
        if (info.active) { fd.style.display = 'none'; info.active = false; }
        return;
      }

      // 如果表格本身不可见（display:none 或高度为 0）
      if (info.wrapper.offsetHeight === 0) {
        if (info.active) { fd.style.display = 'none'; info.active = false; }
        return;
      }

      var theadRect = info.thead.getBoundingClientRect();
      var wrapperRect = info.wrapper.getBoundingClientRect();

      // 需要显示浮动表头的条件：
      // 1. 原始 thead 已经滚到导航栏上方（theadRect.bottom <= navBottom）
      // 2. 但表格底部还在视口中可见（wrapperRect.bottom > navBottom）
      var need = (theadRect.bottom <= navBottom) && (wrapperRect.bottom > navBottom + 20);

      if (need) {
        if (!info.active) {
          rebuildClone(info);
          fd.style.display = 'block';
          fd.style.position = 'fixed';
          fd.style.zIndex = '999';
          fd.style.overflow = 'hidden';
          fd.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
          fd.style.borderBottom = '1px solid var(--vscode-border)';
          fd.style.backgroundColor = 'var(--vscode-bg-light)';
          info.active = true;
        }

        // 更新位置：紧跟导航栏底部，宽度=wrapper可见宽度
        fd.style.top = navBottom + 'px';
        fd.style.left = wrapperRect.left + 'px';
        fd.style.width = wrapperRect.width + 'px';

        // 同步横向滚动
        fd.scrollLeft = info.wrapper.scrollLeft;

      } else if (info.active) {
        fd.style.display = 'none';
        info.active = false;
      }
    });
  }

  // ---- 滚动 & resize ----
  var ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function() { update(); ticking = false; });
      ticking = true;
    }
  }

  function onResize() {
    // 先隐藏，等布局稳定后重新计算
    tables.forEach(function(info) {
      if (info.active) {
        info.floatDiv.style.display = 'none';
        info.active = false;
      }
    });
    setTimeout(update, 150);
  }

  // ---- 启动 ----
  function start() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() { init(); setTimeout(update, 300); }, 100);
      });
    } else {
      setTimeout(function() { init(); setTimeout(update, 300); }, 100);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
  }

  start();
})();
