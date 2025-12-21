// 为所有文章中的表格添加固定表头和第一列功能
document.addEventListener('DOMContentLoaded', function() {
  // 找到文章内容区域中的所有表格
  const articleTables = document.querySelectorAll('.post-content table');
  
  articleTables.forEach(table => {
    // 检查表格是否需要滚动（宽度超过父容器）
    const tableWidth = table.offsetWidth;
    const parentWidth = table.parentElement.offsetWidth;
    
    if (tableWidth > parentWidth) {
      // 创建滚动容器
      const scrollContainer = document.createElement('div');
      scrollContainer.className = 'table-scroll-container';
      
      const scrollWrapper = document.createElement('div');
      scrollWrapper.className = 'table-scroll-wrapper';
      
      // 包装表格
      table.parentNode.insertBefore(scrollContainer, table);
      scrollContainer.appendChild(scrollWrapper);
      scrollWrapper.appendChild(table);
      
      // 确保表格占满宽度
      table.style.minWidth = '100%';
    }
  });
});