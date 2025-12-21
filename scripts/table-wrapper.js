/* scripts/table-wrapper.js */

// 在文章渲染完成后，自动给 table 加上滚动容器
hexo.extend.filter.register('after_post_render', function(data) {
  // 使用正则查找表格，并包裹 div
  // 这里的正则匹配 <table>...</table>，将其替换为 <div class="table-container"><table>...</table></div>
  data.content = data.content.replace(/<table[^>]*>([\s\S]*?)<\/table>/g, function(match) {
    return '<div class="table-container">' + match + '</div>';
  });
  return data;
});