// Cloudflare Worker
// Store your OpenRouter key with:
// wrangler secret put OPENROUTER_API_KEY
//
// The browser calls POST /chat.
// The API key is NEVER sent to the iPhone.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {headers: cors()});
    }

    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ok:true}), {
        headers: {"Content-Type":"application/json", ...cors()}
      });
    }

    if (url.pathname !== "/chat" || request.method !== "POST") {
      return new Response("Not found", {status:404, headers:cors()});
    }

    try {
      const body = await request.json();
      const model = body.model || "openrouter/free";
      const messages = Array.isArray(body.messages) ? body.messages : [];

      const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method:"POST",
        headers:{
          "Authorization":`Bearer ${env.OPENROUTER_API_KEY}`,
          "Content-Type":"application/json",
          "HTTP-Referer": url.origin,
          "X-Title":"My LLM iPhone"
        },
        body:JSON.stringify({
          model,
          messages,
          stream:true
        })
      });

      const headers = new Headers(upstream.headers);
      for (const [k,v] of Object.entries(cors())) headers.set(k,v);
      headers.set("Content-Type","text/event-stream; charset=utf-8");
      headers.set("Cache-Control","no-cache");
      return new Response(upstream.body,{status:upstream.status,headers});
    } catch(e) {
      return new Response(JSON.stringify({error:e.message}), {
        status:500,
        headers:{"Content-Type":"application/json",...cors()}
      });
    }
  }
};

function cors(){
  return {
    "Access-Control-Allow-Origin":"*",
    "Access-Control-Allow-Methods":"GET,POST,OPTIONS",
    "Access-Control-Allow-Headers":"Content-Type"
  };
}
