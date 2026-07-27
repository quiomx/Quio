'use strict';
;(async()=>{
  const config=window.QUIO_CLOUD_CONFIG||{},STORAGE_KEY='quio_diagnostics_v6';
  if(!config.enabled)return;
  try{await loadSupabase()}catch(error){showAuth('No fue posible conectar con el servicio de acceso.');return}
  const client=window.supabase.createClient(config.supabaseUrl,config.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  let session=null,role='',revision=0,channel=null,suppress=false,uploadTimer=null;

  function loadSupabase(){return new Promise((resolve,reject)=>{if(window.supabase?.createClient)return resolve();const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';script.onload=resolve;script.onerror=reject;document.head.appendChild(script)})}
  function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function showAuth(message=''){
    let gate=document.querySelector('#cloudAuthGate');if(!gate){gate=document.createElement('div');gate.id='cloudAuthGate';gate.className='auth-gate';document.body.appendChild(gate)}
    gate.innerHTML=`<form class="auth-card" id="cloudLogin"><div class="auth-brand"><span>Q</span><strong>Quio</strong></div><p class="eyebrow">MÓDULO INTERNO</p><h1>Accede a Revisiones Quio</h1><p>Usa la misma cuenta de Administrador o Staff de Gestión.</p>${message?`<div class="auth-message" role="alert">${esc(message)}</div>`:''}<label>Correo<input name="email" type="email" autocomplete="email" required></label><label>Contraseña<input name="password" type="password" autocomplete="current-password" minlength="6" required></label><button class="btn btn-primary" type="submit">Entrar</button><button class="text-btn" id="cloudReset" type="button">Restablecer contraseña</button></form>`;
    gate.querySelector('form').onsubmit=login;gate.querySelector('#cloudReset').onclick=resetPassword;
  }
  async function login(event){
    event.preventDefault();const form=event.currentTarget,data=new FormData(form),button=form.querySelector('[type=submit]');button.disabled=true;button.textContent='Entrando…';
    const {error}=await client.auth.signInWithPassword({email:data.get('email'),password:data.get('password')});
    if(error)showAuth('No fue posible entrar. Revisa el correo y la contraseña.');
  }
  async function resetPassword(){
    const email=document.querySelector('#cloudLogin [name=email]')?.value;if(!email)return showAuth('Escribe tu correo para enviarte el enlace.');
    const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:new URL('./',location.href).href});
    showAuth(error?'No se pudo enviar el enlace.':'Revisa tu correo para crear una contraseña nueva.');
  }
  function recoveryScreen(){
    let gate=document.querySelector('#cloudAuthGate');if(!gate){gate=document.createElement('div');gate.id='cloudAuthGate';gate.className='auth-gate';document.body.appendChild(gate)}
    gate.innerHTML=`<form class="auth-card" id="cloudRecovery"><div class="auth-brand"><span>Q</span><strong>Quio</strong></div><p class="eyebrow">NUEVA CONTRASEÑA</p><h1>Protege tu cuenta</h1><label>Contraseña nueva<input name="password" type="password" autocomplete="new-password" minlength="8" required></label><button class="btn btn-primary" type="submit">Guardar contraseña</button></form>`;
    gate.querySelector('form').onsubmit=async event=>{event.preventDefault();const password=new FormData(event.currentTarget).get('password'),{error}=await client.auth.updateUser({password});if(error)showAuth('No fue posible guardar la contraseña.');else document.querySelector('#cloudAuthGate')?.remove()};
  }
  function rawReview(row){return row?.original&&row.sourceId?row.original:row}
  function cloudReview(raw,existing){
    return{...(existing||{}),id:existing?.id||`review_${raw.id}`,sourceId:raw.id,sourceSchemaVersion:raw.schemaVersion||'18.0',reviewDate:raw.date,iqpd:raw.iqpd,level:raw.level,pillars:raw.pillars,findings:raw.findings,recommendation:raw.recommendation,plan:raw.plan||[],future:raw.future||[],verification:raw.verification,inventory:raw.inventory,answers:raw.answers,answerNotes:raw.answerNotes,original:raw,status:'Registrada',createdAt:existing?.createdAt||raw.date,updatedAt:raw.updatedAt||new Date().toISOString()};
  }
  function localRecords(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')}catch{return[]}}
  function mergeRaw(local,remote){
    const map=new Map();[...remote,...local].forEach(item=>{const current=map.get(item.id);if(!current||String(item.updatedAt||item.date||'')>=String(current.updatedAt||current.date||''))map.set(item.id,item)});return[...map.values()].sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  }
  function hydrate(payload){
    const remote=(payload?.reviews||[]).map(rawReview).filter(Boolean),merged=mergeRaw(localRecords(),remote);
    suppress=true;localStorage.setItem(STORAGE_KEY,JSON.stringify(merged));suppress=false;
    window.renderDashboard?.();window.renderHistory?.();const mode=document.querySelector('#storageMode');if(mode)mode.textContent='Sincronizado en la nube';
    return merged.length>remote.length;
  }
  async function connect(currentSession){
    session=currentSession;if(!session){disconnect();showAuth();return}
    const {data:memberships,error:membershipError}=await client.from('workspace_members').select('workspace_id,role').eq('workspace_id',config.workspaceId).eq('user_id',session.user.id).limit(1);
    if(membershipError||!memberships?.length){showAuth('Tu cuenta todavía no tiene acceso al espacio Quio.');return}
    role=memberships[0].role;
    const {data:state,error}=await client.from('workspace_states').select('payload,revision').eq('workspace_id',config.workspaceId).single();
    if(error){showAuth('No fue posible abrir el espacio compartido.');return}
    revision=Number(state.revision||0);const needsUpload=hydrate(state.payload||{reviews:[]});
    document.querySelector('#cloudAuthGate')?.remove();addAccount();subscribe();if(needsUpload)await upload();
  }
  function addAccount(){
    let button=document.querySelector('#cloudAccount');if(button)return;button=document.createElement('button');button.id='cloudAccount';button.className='btn btn-secondary cloud-account';button.textContent=role==='admin'?'Administrador':'Staff';button.title=session.user.email;button.onclick=()=>client.auth.signOut();document.querySelector('.top-actions')?.prepend(button);
  }
  function disconnect(){if(channel){client.removeChannel(channel);channel=null}document.querySelector('#cloudAccount')?.remove();session=null}
  function subscribe(){
    if(channel)client.removeChannel(channel);
    channel=client.channel(`quio-reviews-${config.workspaceId}`).on('postgres_changes',{event:'UPDATE',schema:'public',table:'workspace_states',filter:`workspace_id=eq.${config.workspaceId}`},payload=>{const next=payload.new;if(!next?.payload||Number(next.revision)<=revision)return;revision=Number(next.revision);if(next.updated_by===session?.user?.id)return;hydrate(next.payload)}).subscribe();
  }
  async function upload(deletedId=null,attempt=0){
    if(!session||suppress||attempt>2)return;
    const {data:remote,error}=await client.from('workspace_states').select('payload,revision').eq('workspace_id',config.workspaceId).single();if(error)return;
    revision=Number(remote.revision||0);const payload=remote.payload||{},records=localRecords(),bySource=new Map((payload.reviews||[]).map(row=>[row.sourceId||row.id,row]));
    if(deletedId)bySource.delete(deletedId);
    records.forEach(raw=>bySource.set(raw.id,cloudReview(raw,bySource.get(raw.id))));
    payload.reviews=[...bySource.values()];
    const {data,error:saveError}=await client.rpc('save_quio_state',{p_workspace:config.workspaceId,p_payload:payload,p_expected_revision:revision});const result=Array.isArray(data)?data[0]:data;
    if(saveError)return;if(!result?.success)return upload(deletedId,attempt+1);revision=Number(result.revision);
  }
  window.addEventListener('quio:reviews-change',event=>{clearTimeout(uploadTimer);uploadTimer=setTimeout(()=>upload(event.detail?.deletedId||null),350)});
  client.auth.onAuthStateChange((event,nextSession)=>setTimeout(()=>{if(event==='PASSWORD_RECOVERY')recoveryScreen();else if(event==='SIGNED_OUT')connect(null);else if(nextSession&&nextSession.user.id!==session?.user?.id)connect(nextSession)},0));
  client.auth.getSession().then(({data})=>connect(data.session));
})();
