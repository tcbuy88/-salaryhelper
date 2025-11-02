# SalaryHelper - Delivery Package

This package contains the demo static site, server stub, OpenAPI mock and documentation for SalaryHelper (劳动纠纷助手).
Use the provided create_full_package.sh to recreate these files locally if needed.

交付物（目录与主要文件清单）
- static/ （H5 DEMO）
  - index.html
  - admin.html
  - styles.css
  - api-client.js
  - app-real.js
- server/ （后端 stub）
  - Dockerfile
  - requirements.txt
  - app/main.py
- docs/
  - UI-Design-Spec.md（视觉/组件/样式说明 — 占位/可替换）
  - components.md（组件清单）
  - development-tasks-AI-chat-doc-gen-payments.md（开发任务清单）
  - CONFIRM_MVP.md
  - API_REPLACEMENT_MAP.md
  - AI_INTEGRATION.md
  - PAYMENTS.md
  - SECURITY_COMPLIANCE.md
  - README_NEXT_STEPS.md
- openapi.yaml（OpenAPI 3.0 mock-ready）
- docker-compose-full.yml（静态 + Prism mock + stub）
- nginx.conf / nginx.stub.conf
- wechat_alipay_examples.py（支付下单/验签示例占位）
- package_static.sh（打包脚本）
- issues-salaryhelper-mvp.json（Issue 列表 JSON）
- README.md / README-DEPLOY.md（运行与部署说明）

 
