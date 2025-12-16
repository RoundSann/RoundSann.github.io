@echo off
title Hexo Blog Deploy Tool
echo.
echo ==========================================
echo       正在执行 Hexo 自动化部署...
echo ==========================================
echo.

echo [1/3] 正在清理缓存 (hexo clean)...
call hexo clean

echo.
echo [2/3] 正在生成静态网页 (hexo g)...
call hexo g

echo.
echo [3/3] 正在部署并备份源码 (hexo d)...
call hexo d

echo.
echo ==========================================
echo       恭喜！全部操作已完成。
echo ==========================================
pause