/* scripts/table-wrap.js */
// 在生成页面前，自动给所有表格套一个 div 容器，用于处理滚动
hexo.extend.filter.register('after_post_render', function(data) {
  // 匹配 markdown 生成的 table 标签，包裹一层 div class="table-container"
  data.content = data.content.replace(/<table/g, '<div class="table-container"><table');
  data.content = data.content.replace(/<\/table>/g, '</table></div>');
  return data;
});