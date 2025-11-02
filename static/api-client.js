/*
  ApiClient - local mock implementation backed by localStorage
  Provides functions:
    - _initDemoData()   // seed initial demo data
    - _mockSendSms(phone)
    - _mockGuest()
    - login(phone, code)
    - getCurrentUser()
    - logout()
    - listConversations(), createConversation(), getConversation(id), sendMessage(convId, payload)
    - listKb(), listTemplates(), getTemplate(id), renderTemplate(id, values)
    - uploadFile(file), listAttachments()
    - createOrder(payload), _mockPaymentCallback(orderId, success)
    - adminListUsers(), adminListConversations(), adminListOrders(), getAdminMetrics()
*/
(function(global){
  const LS = window.localStorage;
  function _get(key){ const v=LS.getItem(key); return v?JSON.parse(v):null; }
  function _set(key,val){ LS.setItem(key, JSON.stringify(val)); }
  function genId(){ return 'id_'+Math.random().toString(36).slice(2,10); }

  const ApiClient = {
    _initDemoData(){
      if(_get('sh_inited')) return;
      // users
      const user = { id: genId(), phone: '13800000000', name: 'Demo User' };
      _set('sh_users', [user]);
      _set('sh_current_user', user);
      // kb
      _set('sh_kb', [
        { id: genId(), title:'未发工资-流程', content:'如果未发工资，先证据收集...'},
        { id: genId(), title:'试用期与社保', content:'试用期内社保处理说明...'}
      ]);
      // templates
      _set('sh_templates', [
        { id: 'tpl_claim', name:'劳动仲裁起诉状', fields:[{name:'claimant',title:'当事人'},{name:'employer',title:'单位'},{name:'amount',title:'赔偿金额'}], content_template:'<h1>起诉状</h1><p>原告：{{claimant}}</p><p>被告：{{employer}}</p><p>请求赔偿：{{amount}}</p>'}
      ]);
      // conversations/messages/attachments/orders
      _set('sh_conversations', []);
      _set('sh_messages', []);
      _set('sh_attachments', []);
      _set('sh_orders', []);
      _set('sh_ai_requests', []);
      _set('sh_inited', true);
    },
    _mockSendSms(phone){ /* no-op */ },
    _mockGuest(){ const u={id:genId(), phone:'guest', name:'Guest'}; const us=_get('sh_users')||[]; us.push(u); _set('sh_users',us); _set('sh_current_user',u); },
    async login(phone, code){
      let users = _get('sh_users')||[];
      let u = users.find(x=>x.phone===phone);
      if(!u){ u={id:genId(), phone, name:'User-'+phone}; users.push(u); _set('sh_users',users); }
      _set('sh_current_user', u);
      return { token: 'demo-'+u.id, user: u };
    },
    async getCurrentUser(){ return _get('sh_current_user'); },
    logout(){ LS.removeItem('sh_current_user'); },
    async listConversations(){ return _get('sh_conversations')||[]; },
    async createConversation(payload){
      const conv = { id: genId(), title: payload.title || '会话-'+Date.now(), user_id: (ApiClient.getCurrentUser()||{}).id, created_at:new Date().toISOString() };
      const arr = _get('sh_conversations')||[]; arr.push(conv); _set('sh_conversations',arr);
      return conv;
    },
    async getConversation(id){
      const messages = (_get('sh_messages')||[]).filter(m=>m.conversation_id===id);
      return { id, messages };
    },
    async sendMessage(convId, payload){
      const u = _get('sh_current_user')||{id:'unknown'};
      const msg = { id: genId(), conversation_id: convId, sender:'user', sender_id:u.id, content: payload.text || payload.content, created_at:new Date().toISOString() };
      const msgs = _get('sh_messages')||[]; msgs.push(msg); _set('sh_messages', msgs);
      // schedule AI mock reply
      setTimeout(()=> {
        const reply = { id: genId(), conversation_id: convId, sender:'ai', content: '（模拟回复）已收到：'+ (payload.text||''), created_at:new Date().toISOString() };
        const msgs2 = _get('sh_messages')||[]; msgs2.push(reply); _set('sh_messages', msgs2);
        // record ai_request
        const reqs = _get('sh_ai_requests')||[]; reqs.push({ id: genId(), user_id: u.id, conversation_id: convId, model_name:'demo', prompt: payload.text, response_text: reply.content, created_at:new Date().toISOString() }); _set('sh_ai_requests', reqs);
      }, 900 + Math.floor(Math.random()*800));
      return msg;
    },
    async listKb(){ return _get('sh_kb')||[]; },
    async listTemplates(){ return _get('sh_templates')||[]; },
    async getTemplate(id){ return (_get('sh_templates')||[]).find(t=>t.id===id) || { id, fields:[] }; },
    async renderTemplate(id, values){
      const tpl = await ApiClient.getTemplate(id);
      let html = tpl.content_template || '';
      Object.keys(values||{}).forEach(k=> { html = html.replace(new RegExp('{{\\s*'+k+'\\s*}}','g'), values[k]); });
      // save as generated doc (attachment)
      const attachments = _get('sh_attachments')||[];
      const file = { id: genId(), file_name: 'doc_'+Date.now()+'.html', content_type:'text/html', size_bytes: html.length, storage_url: '', preview_url: 'data:text/html;charset=utf-8,'+encodeURIComponent(html), metadata:{ template_id: id }, created_at:new Date().toISOString() };
      attachments.push(file); _set('sh_attachments', attachments);
      return { rendered_html: html, rendered_text: html, attachment: file };
    },
    async uploadFile(file){
      // create preview URL (not persisted across sessions if big)
      const reader = new FileReader();
      return new Promise((res,rej)=>{
        reader.onload = function(e){ const attachments = _get('sh_attachments')||[]; const a={ id: genId(), file_name: file.name, content_type: file.type, size_bytes: file.size, preview_url: e.target.result, created_at:new Date().toISOString() }; attachments.push(a); _set('sh_attachments', attachments); res(a); };
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
    },
    async listAttachments(){ return _get('sh_attachments')||[]; },
    async createOrder(payload){
      const uid = (_get('sh_current_user')||{}).id || 'anonymous';
      const orders = _get('sh_orders')||[]; const o = { id: genId(), user_id:uid, sku: payload.sku || 'demo', amount_cents: payload.amount_cents || 100, status:'pending', created_at:new Date().toISOString() }; orders.push(o); _set('sh_orders', orders); return o;
    },
    async _mockPaymentCallback(orderId, success){
      const orders = _get('sh_orders')||[]; const o = orders.find(x=>x.id===orderId); if(o){ o.status = success ? 'paid' : 'failed'; _set('sh_orders', orders); }
    },
    async adminListUsers(){ return _get('sh_users')||[]; },
    async adminListConversations(){ return _get('sh_conversations')||[]; },
    async adminListOrders(){ return _get('sh_orders')||[]; },
    async getAdminMetrics(){
      const convs = _get('sh_conversations')||[]; const orders = _get('sh_orders')||[]; return { conversations: convs.length, orders: orders.length, users: (_get('sh_users')||[]).length };
    }
  };

  // init on load
  ApiClient._initDemoData();
  global.ApiClient = ApiClient;
})(window);
