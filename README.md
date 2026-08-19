# 이노블록 A-QMS

골재·반제품·완제품 품질관리 및 생산 모니터링 시스템. React 프론트엔드 + FastAPI 백엔드로 구성된 레퍼런스/데모 프로젝트입니다.

## 지금 상태

- **프론트엔드(`frontend/`)** — 전체 15개 화면(로그인, 메인 대시보드, 골재 입도분석 4종, 기층몰탈, 반제품, 완제품, LOT 3종, 모니터링 3종)이 React로 구현되어 있습니다.
- **데이터는 전부 목업**입니다. 로그인/회원가입 포함 어떤 화면도 실제 백엔드나 DB를 호출하지 않습니다 — `frontend/src/mocks/`에서 그럴듯한 더미 데이터를 생성해서 보여줍니다. 로그인은 아이디/비밀번호를 비어있지 않게만 입력하면 통과되고, 세션은 브라우저 `localStorage`에 저장됩니다.
- **백엔드(`backend/`)** — 실제 SQL Server 연동 로직이 있는 FastAPI 서버가 그대로 남아있습니다. 지금은 프론트엔드가 이걸 전혀 호출하지 않지만, 나중에 실제 데이터 연동을 다시 붙일 때 그대로 쓸 수 있게 보존해둔 상태입니다.

즉 **지금 이 프로젝트를 그냥 구경/데모하려면 `frontend/`만 실행하면 됩니다.** 백엔드나 DB는 필요 없습니다.

## 빠른 시작 (프론트엔드만)

```bash
cd frontend
npm install
npm run dev
```

`http://localhost:5173`에서 로그인 화면이 뜨고, 이메일/비밀번호를 아무거나 입력하면 로그인됩니다.

## 프로젝트 구조

```
inoblock_server/
├─ frontend/     # React + TypeScript + Vite + Tailwind v4 + shadcn/ui
│  ├─ src/mocks/     # 화면에 뿌려지는 더미 데이터 생성기
│  ├─ src/pages/     # 15개 화면
│  ├─ src/hooks/     # 데이터 훅 (지금은 전부 mocks/ 데이터를 반환)
│  └─ src/components/
└─ backend/      # FastAPI + SQLAlchemy + SQL Server (지금은 미사용, 보존용)
```

### 프론트엔드 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 (`http://localhost:5173`) |
| `npm run build` | 프로덕션 빌드 (`tsc -b && vite build`) |
| `npm run lint` | ESLint |
| `npm run preview` | 빌드 결과 로컬 프리뷰 |

## 백엔드 (선택 — 실제 DB 연동이 다시 필요할 때)

`backend/`는 지금 프론트엔드에서 전혀 호출되지 않지만, 실제 SQL Server 데이터로 되돌리고 싶을 때를 위해 그대로 남겨뒀습니다.

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```

- SQL Server 접속 정보는 `backend/db/config/.env`에 둡니다 (git에 커밋되지 않음).
- NAS 이미지 프록시용 환경변수(`IMAGE_SERVER_BASE`, `NAS_USER_NAME`, `NAS_USER_PASSWORD`)는 `backend/config/.env`에 둡니다.
- Docker로 띄우려면 루트에서 `docker compose up --build` (`backend/db/config/.env`를 자동으로 읽어서 `http://localhost:8000`에 뜹니다).

실제 데이터 연동을 다시 켜려면, `frontend/src/hooks/`의 각 훅에서 `@/mocks/*` 호출을 원래 API 호출로 되돌리면 됩니다 — 각 훅이 반환하는 타입은 백엔드 JSON 응답과 동일하게 맞춰져 있어서 페이지 컴포넌트는 손댈 필요가 없습니다.

## 참고

- 프론트엔드는 원래 `backend/templates` + `backend/static`으로 서버 렌더링되던 Jinja2 페이지들을 React SPA로 이관한 것입니다. 레거시 페이지는 모두 제거되었고 백엔드는 이제 JSON API만 제공합니다.
- oxlint 대신 ESLint(flat config, `eslint.config.js`)를 사용합니다.
