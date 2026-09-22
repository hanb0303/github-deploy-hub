@echo off
chcp 65001 > nul
title GitDeploy Hub 원클릭 배포기
echo ========================================================
echo   GitDeploy Hub - GitHub Pages 최신 버전 배포 중...
echo ========================================================
echo.
echo [1/3] 프로젝트 빌드 중...
call npm.cmd run build
if %errorlevel% neq 0 (
    echo 빌드 실패!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] GitHub 저장소(main)로 소스코드 푸시 중...
git add .
git diff-index --quiet HEAD || git commit -m "update: site updates"
git push origin main

echo.
echo [3/3] GitHub Pages(gh-pages)로 빌드 결과물 배포 중...
cd dist
git add -A
git diff-index --quiet HEAD || git commit -m "deploy: update live site"
git push origin gh-pages --force
cd ..

echo.
echo ========================================================
echo   배포가 성공적으로 완료되었습니다!
echo   접속 주소: https://hanb0303.github.io/github-deploy-hub/
echo ========================================================
echo.
pause
