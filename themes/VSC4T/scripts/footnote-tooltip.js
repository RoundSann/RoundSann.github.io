/* scripts/footnote-tooltip.js */

// 注册资源注入：在页面底部插入 JS 和 CSS
hexo.extend.injector.register('body_end', `
<style>
  /* Tooltip 提示框样式 (VS Code 深色风格) */
  #fn-tooltip-box {
    position: fixed;
    z-index: 9999;
    background-color: var(--vscode-sidebar, #252526); /* 使用主题变量 */
    color: var(--vscode-text, #cccccc);
    border: 1px solid var(--vscode-active, #454545);
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 0.9em;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    max-width: 300px;
    display: none; /* 默认隐藏 */
    pointer-events: none; /* 让鼠标穿透提示框，防止闪烁 */
    line-height: 1.5;
    word-wrap: break-word;
  }
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // 1. 创建悬停框元素
    const tooltip = document.createElement('div');
    tooltip.id = 'fn-tooltip-box';
    document.body.appendChild(tooltip);

    // 2. 获取所有的脚注引用 (上标数字 [1])
    // markdown-it-footnote 生成的 class 是 .footnote-ref
    const refs = document.querySelectorAll('.footnote-ref');

    refs.forEach(ref => {
        // 鼠标移入
        ref.addEventListener('mouseenter', (e) => {
            // 获取目标 ID (例如 #fn1)
            const href = ref.getAttribute('href'); 
            // 兼容有些浏览器 href 包含完整 URL 的情况
            const targetId = href.substring(href.indexOf('#') + 1);
            
            // 找到底部的对应条目
            const targetItem = document.getElementById(targetId);
            
            if (targetItem) {
                // 克隆内容，防止修改原内容
                const clone = targetItem.cloneNode(true);
                
                // 移除 "↩" 返回按钮，只保留解释文字
                const backRef = clone.querySelector('.footnote-backref');
                if (backRef) backRef.remove();
                
                // 设置 Tooltip 内容
                // 很多时候 Markdown 会把脚注包在 <p> 里，我们去掉外层 p 标签让显示更紧凑
                let content = clone.innerHTML.trim();
                if (content.startsWith('<p>') && content.endsWith('</p>')) {
                    content = content.substring(3, content.length - 4);
                }
                
                tooltip.innerHTML = content;
                tooltip.style.display = 'block';
            }
        });

        // 鼠标移动 (跟随鼠标)
        ref.addEventListener('mousemove', (e) => {
            // 计算位置：鼠标右下方一点点
            let x = e.clientX + 15;
            let y = e.clientY + 15;
            
            // 防止超出屏幕右边缘
            if (x + 300 > window.innerWidth) {
                x = e.clientX - 315; // 改为显示在左侧
            }
            
            // 防止超出屏幕底边缘
            if (y + tooltip.offsetHeight > window.innerHeight) {
                y = e.clientY - tooltip.offsetHeight - 10; // 改为显示在上方
            }

            tooltip.style.left = x + 'px';
            tooltip.style.top = y + 'px';
        });

        // 鼠标移出
        ref.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
    });
});
</script>
`);