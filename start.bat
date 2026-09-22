@echo off
chcp 65001 > nul
title GitDeploy Hub 로컬 실행기
echo ========================================================
echo   GitDeploy Hub - 내 깃허브 배포 대시보드 실행 중...
echo ========================================================
echo.
echo 브라우저에서 자동으로 열립니다 (http://localhost:3000)
echo 종료하려면 창을 닫거나 Ctrl+C 를 누르세요.
echo.
npm.cmd run dev
pause
