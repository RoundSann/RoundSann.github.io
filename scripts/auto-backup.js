/* scripts/auto-backup.js */
const { execSync } = require('child_process');

// 监听 'deployAfter' 事件：当 hexo d 执行完毕后触发
hexo.on('deployAfter', function() {
  console.log('======================================================');
  console.log('🎉 网页部署完成！正在自动备份源码到 source 分支...');
  console.log('======================================================');

  try {
    // 1. 添加所有变动 (md文件、配置、主题修改等)
    // 注意：受 .gitignore 保护的文件(如 public, node_modules)不会被添加
    execSync('git add .');
    
    // 2. 提交变动
    // 这里的 || true 是防止"没有文件变动"时报错导致脚本停止
    execSync('git commit -m "Auto backup: ' + new Date().toLocaleString() + '" || true');
    
    // 3. 强制推送到远程的 source 分支
    // HEAD:source 的意思是：把当前本地的分支内容，推送到远程的 source 分支
    // 如果远程没有 source 分支，它会自动创建
    execSync('git push origin HEAD:source');
    
    console.log('✅ 源码备份成功！GitHub 分支: source');
  } catch (e) {
    console.error('❌ 源码备份失败！请检查 Git 配置。');
    console.error('错误信息:', e.message);
  }
  
  console.log('======================================================');
});