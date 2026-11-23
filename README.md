# 알록달록 색칠놀이터

경찰차, 소방차, 공룡, 나비를 골라 같은 숫자의 영역을 순서대로 색칠하는 웹앱입니다. 갤러리에서 진행 중인 그림과 완성한 그림을 다시 열 수 있습니다.

## 개발과 검증

Node.js 24와 pnpm 11.25.0을 사용합니다.

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm dev
pnpm build
pnpm verify:dist
sha256sum --check docs/source-assets.sha256
pnpm exec playwright install chromium
pnpm test
```

개발 경로는 `/kids-coloring-studio/`입니다. Playwright는 프로덕션 빌드를 사용합니다. 시스템 Chromium을 사용하는 경우 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`로 실행 파일을 지정할 수 있습니다.

## 원본과 데이터

기준은 `leedb333/kids-game-playground@d608a79becc6ea9731c7ddf72ef8671fe25eb92e`입니다. 색칠 엔진, 작업실, SVG 렌더러, PNG 출력 코드와 운영 도안 JSON·배경 PNG를 그대로 가져왔습니다. 도안별 `kids-game-playground:v1:game:coloring:<id>:r4` 키와 버전 1 형식을 사용합니다. 기존 Pages 앱과 같은 브라우저 프로필 및 출처에서 열 때 이전 기록을 읽습니다. 두 앱에서 같은 도안을 동시에 편집하면 나중에 저장한 이력이 앞선 저장을 덮어쓸 수 있습니다.

새 도안은 `src/games/coloring/data/scenes/`에 JSON, `public/assets/coloring-v4/`에 같은 출처에서 제공할 배경을 추가하고 `data/drawings.ts`에 등록합니다. 서비스 워커는 등록된 도안의 배경을 빌드 시 사전 캐시 목록에 포함합니다.

## 운영 검수

GitHub Pages는 GitHub Actions를 배포 소스로 설정한 다음, 승인 후 `main`에서 수동 워크플로를 실행합니다. 앱 설치 ID와 서비스 워커 범위는 `/kids-coloring-studio/`입니다. 첫 온라인 방문에서 서비스 워커 준비가 끝나면 갤러리, 도안, PNG 다운로드를 오프라인에서도 사용할 수 있습니다.

배포 전에 원본 Pages 실행 [#27](https://github.com/leedb333/kids-game-playground/actions/runs/44020543234)의 실제 산출물 보관 상태와 갤럭시탭의 기존 기록을 확인합니다. 배포 후 같은 기기와 브라우저에서 독립 앱의 이어하기, 설치, 오프라인 실행 및 PNG 다운로드를 확인합니다. 실제 사용자 기록은 기기 밖이나 공개 저장소에 복사하지 않습니다.
