// scripts/table-wrap.js
// 这是一个 Hexo 过滤器，它会在文章渲染完成后自动运行
hexo.extend.filter.register('after_post_render', function(data){
  // 简单的正则替换：给 table 包裹一层 div class="table-container"
  // 这样我们就可以用 CSS 控制这个 div 来实现滚动，而不会撑破页面
  data.content = data.content.replace(/<table/g, '<div class="table-container"><table').replace(/<\/table>/g, '</table></div>');
  return data;
});