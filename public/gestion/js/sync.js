'use strict';
;(async()=>{
  const config=window.QUIO_CLOUD_CONFIG||{},C=window.QuioCore,status=document.querySelector('#syncStatus');
  if(!config.enabled){setStatus('local','Datos en este dispositivo');return}
  if(!window.supabase?.createClient){
    try{await loadSupabase()}catch(error){setStatus('error','Sin conexión con la nube');return}
  }

  const client=window.supabase.createClient(config.supabaseUrl,config.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  let session=null,workspaceId=config.workspaceId||'',role='',revision=0,channel=null,uploadTimer=null,suppress=false;

  function setStatus(state,text){
    if(!status)return;
    status.className=`sidebar-foot sync-${state}`;
    status.innerHTML=`<span class="status-dot"></span><span>${text}</span>`;
  }
  function loadSupabase(){return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';script.onload=resolve;script.onerror=reject;document.head.appendChild(script)})}
  function notice(message){const el=document.querySelector('#toast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(el.t);el.t=setTimeout(()=>el.classList.remove('show'),3200)}
  function authScreen(message=''){
    let gate=document.querySelector('#cloudAuthGate');
    if(!gate){gate=document.createElement('div');gate.id='cloudAuthGate';gate.className='auth-gate';document.body.appendChild(gate)}
    gate.innerHTML=`<form class="auth-card" id="cloudLogin">
      <div class="auth-brand auth-logo"><span class="logo-crop"><img src="assets/images/logo-quio.png" alt="Quio"></span></div>
      <p class="eyebrow">ESPACIO DE TRABAJO</p><h1>Accede a Gestión Quio</h1>
      <p>Tu información se sincroniza con las personas autorizadas.</p>
      ${message?`<div class="auth-message" role="alert">${escapeHtml(message)}</div>`:''}
      <label>Correo<input name="email" type="email" autocomplete="email" required></label>
      <label>Contraseña<input name="password" type="password" autocomplete="current-password" minlength="6" required></label>
      <button class="btn primary" type="submit">Entrar</button>
      <button class="btn link-btn" type="button" id="cloudReset">Restablecer contraseña</button>
    </form>`;
    gate.querySelector('#cloudLogin').onsubmit=login;
    gate.querySelector('#cloudReset').onclick=resetPassword;
  }
  function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  async function login(event){
    event.preventDefault();const data=new FormData(event.currentTarget),button=event.currentTarget.querySelector('[type=submit]');
    button.disabled=true;button.textContent='Entrando…';
    const {error}=await client.auth.signInWithPassword({email:data.get('email'),password:data.get('password')});
    if(error)authScreen('No fue posible entrar. Revisa el correo y la contraseña.');
  }
  async function resetPassword(){
    const email=document.querySelector('#cloudLogin [name=email]')?.value;
    if(!email)return authScreen('Escribe tu correo para enviarte el enlace.');
    const redirectTo=new URL('./',location.href).href;
    const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo});
    authScreen(error?'No se pudo enviar el enlace.':'Revisa tu correo para crear una contraseña nueva.');
  }
  function recoveryScreen(){
    let gate=document.querySelector('#cloudAuthGate');if(!gate){gate=document.createElement('div');gate.id='cloudAuthGate';gate.className='auth-gate';document.body.appendChild(gate)}
    gate.innerHTML=`<form class="auth-card" id="cloudRecovery"><div class="auth-brand auth-logo"><span class="logo-crop"><img src="assets/images/logo-quio.png" alt="Quio"></span></div><p class="eyebrow">NUEVA CONTRASEÑA</p><h1>Protege tu cuenta</h1><label>Contraseña nueva<input name="password" type="password" autocomplete="new-password" minlength="8" required></label><button class="btn primary" type="submit">Guardar contraseña</button></form>`;
    gate.querySelector('form').onsubmit=async event=>{event.preventDefault();const password=new FormData(event.currentTarget).get('password'),{error}=await client.auth.updateUser({password});if(error)authScreen('No fue posible guardar la contraseña.');else{hideAuth();notice('Contraseña actualizada.')}};
  }
  function hideAuth(){document.querySelector('#cloudAuthGate')?.remove()}
  async function connect(currentSession){
    session=currentSession;if(!session){disconnect();authScreen();return}
    setStatus('loading','Conectando…');
    let membershipQuery=client.from('workspace_members').select('workspace_id,role,workspaces(name)').eq('user_id',session.user.id);
    if(workspaceId)membershipQuery=membershipQuery.eq('workspace_id',workspaceId);
    const {data:memberships,error:memberError}=await membershipQuery.limit(1);
    if(memberError||!memberships?.length){authScreen('Tu cuenta todavía no tiene acceso a un espacio Quio.');setStatus('error','Acceso no configurado');return}
    workspaceId=memberships[0].workspace_id;role=memberships[0].role;
    const {data:remote,error}=await client.from('workspace_states').select('payload,revision,updated_by').eq('workspace_id',workspaceId).single();
    if(error){authScreen('La base compartida todavía no está configurada.');setStatus('error','Configuración incompleta');return}
    revision=Number(remote.revision||0);
    if(remote.payload){
      suppress=true;C.replace(remote.payload,{silent:true});suppress=false;window.QuioApp?.render();
    }else await upload(true);
    hideAuth();addAccountMenu();subscribe();setStatus('online',`Sincronizado · ${role==='admin'?'Administrador':'Staff'}`);
  }
  function addAccountMenu(){
    if(document.querySelector('#cloudAccount'))return;
    const button=document.createElement('button');button.id='cloudAccount';button.className='btn cloud-account';button.textContent=session.user.email;
    button.title='Cerrar sesión';button.onclick=async()=>{await client.auth.signOut()};
    document.querySelector('.top-actions')?.prepend(button);
  }
  function disconnect(){
    if(channel){client.removeChannel(channel);channel=null}
    document.querySelector('#cloudAccount')?.remove();session=null;setStatus('offline','Sesión cerrada');
  }
  function subscribe(){
    if(channel)client.removeChannel(channel);
    channel=client.channel(`quio-workspace-${workspaceId}`).on('postgres_changes',{event:'UPDATE',schema:'public',table:'workspace_states',filter:`workspace_id=eq.${workspaceId}`},payload=>{
      const next=payload.new;if(!next?.payload||Number(next.revision)<=revision)return;
      revision=Number(next.revision);if(next.updated_by===session?.user?.id)return;
      suppress=true;C.replace(next.payload,{silent:true});suppress=false;window.QuioApp?.render();
      setStatus('online',`Actualizado ahora · ${role==='admin'?'Administrador':'Staff'}`);notice('Cambios recibidos en tiempo real.');
    }).subscribe(state=>{if(state==='SUBSCRIBED')setStatus('online',`Sincronizado · ${role==='admin'?'Administrador':'Staff'}`)});
  }
  async function upload(initial=false){
    if(!session||!workspaceId||suppress)return;
    setStatus('loading','Guardando cambios…');
    const expected=revision;
    const {data,error}=await client.rpc('save_quio_state',{p_workspace:workspaceId,p_payload:C.db(),p_expected_revision:expected});
    const result=Array.isArray(data)?data[0]:data;
    if(error){setStatus('error','Pendiente de sincronizar');if(!initial)notice('Los cambios siguen guardados en este dispositivo.');return}
    if(!result?.success){
      const {data:remote}=await client.from('workspace_states').select('payload,revision').eq('workspace_id',workspaceId).single();
      if(remote?.payload){revision=Number(remote.revision);suppress=true;C.merge(remote.payload,{silent:true});suppress=false;window.QuioApp?.render();await upload()}
      return;
    }
    revision=Number(result.revision);setStatus('online',`Sincronizado · ${role==='admin'?'Administrador':'Staff'}`);
  }
  window.addEventListener('quio:change',()=>{if(suppress||!session)return;clearTimeout(uploadTimer);uploadTimer=setTimeout(()=>upload(),450)});
  window.addEventListener('online',()=>{if(session)upload()});window.addEventListener('offline',()=>setStatus('offline','Sin internet · cambios protegidos'));
  client.auth.onAuthStateChange((event,nextSession)=>{setTimeout(()=>{if(event==='PASSWORD_RECOVERY')recoveryScreen();else if(event==='SIGNED_OUT')connect(null);else if(nextSession&&nextSession.user.id!==session?.user?.id)connect(nextSession)},0)});
  client.auth.getSession().then(({data})=>connect(data.session));
  window.QuioCloud={client,upload:()=>upload(),signOut:()=>client.auth.signOut()};
})();
