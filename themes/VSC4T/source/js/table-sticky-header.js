
(function () {
  function initStickyHeaders() {
    document.querySelectorAll('table').forEach(function (table) {
      if (table._stickyInit) return;
      table._stickyInit = true;

      var thead = table.querySelector('thead');
      if (!thead) return;

      // table 本身是 display:block + overflow-x:auto 的滚动容器
      // sticky top 相对于 table 容器，不相对视口，需要 JS 方案

      var clone = thead.cloneNode(true);
      clone.style.cssText = [
        'position:fixed',
        'top:0',
        'z-index:100',
        'pointer-events:none',
        'overflow:hidden',
        'visibility:hidden',
        'background-color:var(--vscode-bg-light)',
        'border-bottom:1px solid var(--vscode-border)',
        'box-sizing:border-box',
      ].join(';');

      // 克隆内的 th 保持原始宽度
      document.body.appendChild(clone);

      function syncClone() {
        var rect = table.getBoundingClientRect();
        var viewH = window.innerHeight;

        // 表格不在视口内，或表头已可见（表格顶部在视口内），隐藏克隆
        if (rect.bottom < 0 || rect.top > viewH) {
          clone.style.visibility = 'hidden';
          return;
        }

        var origRect = thead.getBoundingClientRect();
        // 原始表头仍在视口内，不需要固定克隆
        if (origRect.top >= 0) {
          clone.style.visibility = 'hidden';
          return;
        }

        // 表格底部快到顶时，让克隆随表格底部上移
        var cloneH = clone.offsetHeight;
        var topPos = Math.min(0, rect.bottom - cloneH);

        clone.style.visibility = 'visible';
        clone.style.top = topPos + 'px';
        clone.style.left = rect.left + 'px';
        clone.style.width = rect.width + 'px';

        // 同步横向滚动偏移（table 自身是滚动容器）
        var scrollLeft = table.scrollLeft;
        clone.style.transform = 'translateX(-' + scrollLeft + 'px)';
        // 裁剪到表格可视宽度
        clone.style.clip = 'rect(0,' + (rect.width + scrollLeft) + 'px,' + cloneH + 'px,' + scrollLeft + 'px)';

        // 同步每列宽度
        var origThs = thead.querySelectorAll('th');
        var cloneThs = clone.querySelectorAll('th');
        origThs.forEach(function (th, i) {
          if (cloneThs[i]) {
            cloneThs[i].style.width = th.offsetWidth + 'px';
            cloneThs[i].style.minWidth = th.offsetWidth + 'px';
          }
        });
      }

      window.addEventListener('scroll', syncClone, { passive: true });
      table.addEventListener('scroll', syncClone, { passive: true });
      window.addEventListener('resize', syncClone, { passive: true });

      // 兼容 <details> 展开时重新计算
      var details = table.closest('details');
      if (details) {
        details.addEventListener('toggle', function () {
          setTimeout(syncClone, 50);
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStickyHeaders);
  } else {
    initStickyHeaders();
  }

  // 兼容动态插入的表格（如 details 展开后才渲染）
  var observer = new MutationObserver(function (mutations) {
    var needInit = false;
    mutations.forEach(function (m) {
      m.addedNodes.forEach(function (n) {
        if (n.nodeType === 1 && (n.tagName === 'TABLE' || n.querySelector && n.querySelector('table'))) {
          needInit = true;
        }
      });
    });
    if (needInit) initStickyHeaders();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
