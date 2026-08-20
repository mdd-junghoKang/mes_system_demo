# 이노블록 A-QMS

골재·반제품·완제품 품질관리 및 생산 모니터링 시스템. React 프론트엔드로 구성된 레퍼런스/데모 프로젝트입니다. 실제 데이터 연동은 별도로 새로 만들어질 백엔드가 맡을 예정이라, 이 저장소에는 프론트엔드만 있습니다.

## 지금 상태

- 전체 15개 화면(로그인, 메인 대시보드, 골재 입도분석 4종, 기층몰탈, 반제품, 완제품, LOT 3종, 모니터링 3종)이 React로 구현되어 있습니다.
- **데이터는 전부 목업**입니다. 로그인/회원가입 포함 어떤 화면도 실제 백엔드나 DB를 호출하지 않습니다 — `src/mocks/`에서 그럴듯한 더미 데이터를 생성해서 보여줍니다. 로그인은 아이디/비밀번호를 비어있지 않게만 입력하면 통과되고, 세션은 브라우저 `localStorage`에 저장됩니다.

## 빠른 시작

```bash
npm install
npm run dev
```

`http://localhost:5173`에서 로그인 화면이 뜨고, 이메일/비밀번호를 아무거나 입력하면 로그인됩니다.

## 프로젝트 구조

```
inoblock_server/     # React + TypeScript + Vite + Tailwind v4 + shadcn/ui
├─ src/mocks/     # 화면에 뿌려지는 더미 데이터 생성기
├─ src/pages/     # 15개 화면
├─ src/hooks/     # 데이터 훅 (지금은 전부 mocks/ 데이터를 반환)
└─ src/components/
```

### 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 (`http://localhost:5173`) |
| `npm run build` | 프로덕션 빌드 (`tsc -b && vite build`) |
| `npm run lint` | ESLint |
| `npm run preview` | 빌드 결과 로컬 프리뷰 |

## 실제 데이터 연동

지금은 백엔드가 없습니다. 별도로 새 백엔드가 만들어지면, `src/hooks/`의 각 훅에서 `@/mocks/*` 호출을 실제 API 호출로 바꾸면 됩니다 — 각 훅이 반환하는 타입(`src/types/`)이 화면이 기대하는 응답 형태를 그대로 보여주므로, 새 백엔드가 이 형태에 맞춰 응답을 주면 페이지 컴포넌트는 손댈 필요가 없습니다.

## 참고

- oxlint 대신 ESLint(flat config, `eslint.config.js`)를 사용합니다.
