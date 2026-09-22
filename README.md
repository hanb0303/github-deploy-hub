# 🚀 GitDeploy Hub (깃허브 배포 주소 통합 대시보드)

내 깃허브(`hanb0303`) 아이디로 배포된 모든 웹 프로젝트를 한눈에 모아보고, 실시간 상태 및 프리뷰를 확인하며 원클릭으로 접속할 수 있는 올인원 대시보드 웹 서비스입니다.

---

## ✨ 핵심 기능

1. **배포 주소 자동 감지 (Auto-Discovery Engine)**
   - **Repository Homepage**: 레포지토리 설정의 웹사이트 URL 자동 추출 (Vercel, Netlify, Render, Cloudflare, Custom 도메인 등)
   - **GitHub Pages**: `has_pages: true` 상태인 레포의 `https://{user}.github.io/{repo}/` 주소 자동 생성
   - **스마트 검증**: 레포 본인 주소나 유효하지 않은 링크는 자동 필터링

2. **반응형 모던 대시보드 UI**
   - **다크 모드 / 라이트 모드** 원클릭 지원
   - **배포 플랫폼별 탭 필터링** (`전체`, `GitHub Pages`, `Vercel`, `Netlify`, `Cloudflare`, `직접등록`)
   - **주요 언어/기술스택 필터** 및 **실시간 검색어 필터링**
   - **정렬 옵션**: 최신 업데이트순, Star 많은순, 이름순
   - **프로젝트 썸네일 미리보기** (실시간 스크린샷 렌더링 및 Fallback 지원)

3. **커스터마이징 & 관리 기능**
   - **배포 링크 직접 추가(Custom Add)**: GitHub에 등록되지 않은 외부 배포나 프라이빗 프로젝트도 직접 추가 가능
   - **상단 고정 (Pin)**: 자주 쓰는 프로젝트를 대시보드 최상단에 고정
   - **프로젝트 숨김 (Hide)**: 표시하고 싶지 않은 레포지토리는 임시 숨김 처리 및 원클릭 복원
   - **공유 URL 지원**: `?user=hanb0303` 파라미터로 다른 사람에게 본인 배포 대시보드 링크를 그대로 공유 가능
   - **데이터 백업/복원**: 커스텀 설정 및 즐겨찾기 데이터를 JSON 파일로 다운로드 및 복원

4. **GitHub API Rate Limit 대응**
   - 브라우저 로컬 캐시(LocalStorage) 15분 적용 (불필요한 반복 호출 방지)
   - Personal Access Token(PAT) 입력 지원 (시간당 60회 제한을 5,000회로 확장)

---

## 💻 실행 방법

### 방법 1. 원클릭 실행 (Windows)
- 폴더 내 `start.bat` 파일을 더블 클릭하면 개발 서버(`http://localhost:3000`)가 실행되고 브라우저가 자동으로 열립니다.

### 방법 2. 터미널 명령어로 실행
```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview
```

---

## 🌐 GitHub Pages로 이 대시보드 사이트 배포하기

이 대시보드 사이트 자체를 본인의 GitHub Pages로 배포해 언제 어디서나 인터넷 주소로 접속할 수 있습니다:

1. GitHub에서 `my-deployments` (또는 원하는 이름) 새 레포지토리를 생성합니다.
2. 현재 폴더의 소스코드를 해당 레포지토리에 푸시합니다:
   ```bash
   git init
   git add .
   git commit -m "feat: GitDeploy Hub 초기 구축"
   git branch -M main
   git remote add origin https://github.com/hanb0303/<레포이름>.git
   git push -u origin main
   ```
3. GitHub 레포지토리의 **Settings -> Pages -> Build and deployment**에서 `GitHub Actions`를 선택하거나, `dist` 폴더의 내용을 `gh-pages` 브랜치에 배포하면 끝납니다!
