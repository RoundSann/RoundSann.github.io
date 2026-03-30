/* 
  scripts/import-code.js 
  自定义代码导入标签，完美适配 markdown-it 和 VS Code 主题
  用法: {% import_code 文件名 [语言] %}
*/
const fs = require('fs');
const path = require('path');

hexo.extend.tag.register('import_code', function(args) {
    const filename = args[0];
    // 如果没有指定语言，就自动从文件后缀名提取 (比如 .py 提取为 python)
    let lang = args.length > 1 ? args[1] : filename.split('.').pop();
    if (lang === 'py') lang = 'python';
    if (lang === 'js') lang = 'javascript';
    
    // 强制指定去 source/downloads/code/ 文件夹下找文件
    const filePath = path.join(hexo.source_dir, 'downloads/code', filename);
    
    // 错误检查：如果文件不存在，在网页上显示显眼的红色报错，方便排查
    if (!fs.existsSync(filePath)) {
        return `<div style="color: #f14c4c; border: 1px solid #f14c4c; padding: 10px; background: #1e1e1e;">
                  ❌ 导入失败：找不到文件 <b>${filename}</b><br>
                  请检查文件是否放在了 <code>source/downloads/code/</code> 目录下。
                </div>`;
    }
    
    // 读取文件内容
    const code = fs.readFileSync(filePath, 'utf8');
    
    // 拼接成标准的 Markdown 代码块
    const markdownCode = '```' + lang + '\n' + code + '\n```';
    
    // 交给 markdown-it 引擎进行完美的渲染
    return hexo.render.renderSync({text: markdownCode, engine: 'markdown'});
});