@echo off
title Hexo Blog Deploy Tool

echo.
echo ==========================================
echo       环境自检 (Debug)
echo ==========================================
echo.

echo 正在尝试查找 Pandoc...
where pandoc
echo.
echo 正在尝试运行 Pandoc...
pandoc -v

if %errorlevel% neq 0 (
    echo.
    echo [严重错误] Bat 文件找不到 Pandoc！
    echo 请检查是否将 Pandoc 添加到了系统环境变量 Path 中。
    echo 或者尝试重启电脑。
    pause
    exit
)

echo.
echo [环境正常] Pandoc 已就绪。
echo.

echo ==========================================
echo       正在执行 Hexo 自动化部署...
echo ==========================================
REM 下面是你原来的命令...
call hexo clean
call hexo g
call hexo d
pause