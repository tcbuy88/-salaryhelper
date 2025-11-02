# API 映射说明

说明：前端 DEMO 中的 ApiClient 方法应替换为真实后端接口：
- ApiClient.login -> POST /api/v1/auth/login
- ApiClient.createConversation -> POST /api/v1/conversations
- ApiClient.sendMessage -> POST /api/v1/conversations/{id}/messages
- ApiClient.uploadFile -> POST /api/v1/upload
- ApiClient.createOrder -> POST /api/v1/orders/create
