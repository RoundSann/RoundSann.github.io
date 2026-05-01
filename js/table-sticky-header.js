(function () {
  function initStickyHeaders() {
    document.querySelectorAll('table').forEach(function (table) {
      if (table._stickyInit) return;
      table._stickyInit = true;

      var thead = table.querySelector('thead');
      if (!thead) return;

      // 外层容器：固定在视口，宽度=表格可视宽，overflow:hidden 做裁剪
      var wrapper = document.createElement('div');
      wrapper.style.cssText = 'position:fixed;top:0;z-index:100;overflow:hidden;visibility:hidden;box-sizing:border-box;pointer-events:none;';
      document.body.appendChild(wrapper);

      // 克隆表头：宽度=表格内容宽，随横向滚动平移
      var clone = thead.cloneNode(true);
      clone.style.cssText = 'display:table;table-layout:fixed;border-collapse:collapse;background-color:var(--vscode-bg-light);border-bottom:1px solid var(--vscode-border);box-sizing:border-box;';
      wrapper.appendChild(clone);

      function isHidden() {
        var details = table.closest('details');
        return details && !details.open;
      }

      function syncClone() {
        if (isHidden()) {
          wrapper.style.visibility = 'hidden';
          return;
        }

        var rect = table.getBoundingClientRect();
        var viewH = window.innerHeight;

        if (rect.bottom < 0 || rect.top > viewH) {
          wrapper.style.visibility = 'hidden';
          return;
        }

        var origRect = thead.getBoundingClientRect();
        if (origRect.top >= 0) {
          wrapper.style.visibility = 'hidden';
          return;
        }

        // 同步每列宽度
        var origThs = thead.querySelectorAll('th');
        var cloneThs = clone.querySelectorAll('th');
        origThs.forEach(function (th, i) {
          if (cloneThs[i]) {
            var w = th.offsetWidth + 'px';
            cloneThs[i].style.width = w;
            cloneThs[i].style.minWidth = w;
            cloneThs[i].style.maxWidth = w;
          }
        });

        var cloneH = clone.offsetHeight;
        var topPos = Math.min(0, rect.bottom - cloneH);

        // wrapper 裁剪到表格可视区域
        wrapper.style.visibility = 'visible';
        wrapper.style.top = topPos + 'px';
        wrapper.style.left = rect.left + 'px';
        wrapper.style.width = rect.width + 'px';
        wrapper.style.height = cloneH + 'px';

        // 克隆随表格横向滚动平移
        clone.style.transform = 'translateX(-' + table.scrollLeft + 'px)';
        // 克隆宽度=内容宽，保证所有列都渲染出来再裁剪
        clone.style.width = table.scrollWidth + 'px';
      }

      window.addEventListener('scroll', syncClone, { passive: true });
      table.addEventListener('scroll', syncClone, { passive: true });
      window.addEventListener('resize', syncClone, { passive: true });

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

  var observer = new MutationObserver(function (mutations) {
    var needInit = false;
    mutations.forEach(function (m) {
      m.addedNodes.forEach(function (n) {
        if (n.nodeType === 1 && (n.tagName === 'TABLE' || (n.querySelector && n.querySelector('table')))) {
          needInit = true;
        }
      });
    });
    if (needInit) initStickyHeaders();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
