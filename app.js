const $=id=>document.getElementById(id);
let messages=[];
let cfg=JSON.parse(localStorage.getItem("myllm_cfg")||"{}");
$("workerUrl").value=cfg.workerUrl||"";
$("model").value=cfg.model||"openrouter/free";
$("systemPrompt").value=cfg.systemPrompt||$("systemPrompt").value;

function add(role,text){
  const d=document.createElement("div");
  d.className="msg "+role;
  d.textContent=text;
  $("messages").appendChild(d);
  $("messages").scrollTop=$("messages").scrollHeight;
  return d;
}
$("settings").onclick=()=>$("settingsPanel").classList.toggle("hidden");
$("saveSettings").onclick=()=>{
  cfg={workerUrl:$("workerUrl").value.trim().replace(/\/$/,""),model:$("model").value,systemPrompt:$("systemPrompt").value};
  localStorage.setItem("myllm_cfg",JSON.stringify(cfg));
  $("settingsPanel").classList.add("hidden");
};
$("newChat").onclick=()=>{messages=[];$("messages").innerHTML='<div class="welcome"><h2>New chat</h2><p>Ready.</p></div>';};

$("composer").onsubmit=async e=>{
  e.preventDefault();
  const text=$("input").value.trim();
  if(!text)return;
  if(!cfg.workerUrl){$("settingsPanel").classList.remove("hidden");alert("Set your Worker URL in Settings first.");return;}
  $("input").value="";
  add("user",text);
  messages.push({role:"user",content:text});
  const bubble=add("assistant","");
  try{
    const r=await fetch(cfg.workerUrl+"/chat",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:cfg.model,messages:[{role:"system",content:cfg.systemPrompt},...messages],stream:true})
    });
    if(!r.ok) throw new Error(await r.text());
    const reader=r.body.getReader(), decoder=new TextDecoder();
    let buffer="";
    while(true){
      const {value,done}=await reader.read();
      if(done)break;
      buffer+=decoder.decode(value,{stream:true});
      const parts=buffer.split("\n");
      buffer=parts.pop();
      for(const line of parts){
        if(!line.startsWith("data:"))continue;
        const data=line.slice(5).trim();
        if(data==="[DONE]")continue;
        try{
          const j=JSON.parse(data);
          const delta=j.choices?.[0]?.delta?.content||"";
          bubble.textContent+=delta;
          $("messages").scrollTop=$("messages").scrollHeight;
        }catch{}
      }
    }
    messages.push({role:"assistant",content:bubble.textContent});
  }catch(err){
    bubble.textContent="Error: "+err.message;
  }
};
