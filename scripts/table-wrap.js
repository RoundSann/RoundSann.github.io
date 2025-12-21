/* scripts/table-wrap.js */
// 在文章渲染完成后，自动给 table 加上外层容器
hexo.extend.filter.register('after_post_render', function(data){
  // 简单的正则替换：给 <table> 包裹一个 div
  // 这样我们就可以对这个 div 设置 overflow-x: auto 了
  data.content = data.content.replace(/<table/g, '<div class="table-container"><table').replace(/<\/table>/g, '</table></div>');
  return data;
});