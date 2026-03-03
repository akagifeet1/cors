export default {
  async fetch(request, env, ctx) {
    // 1. Define the CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*", // You can change "*" to "https://your-frontend.com"
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    };

    // 2. Handle the Browser's Preflight (OPTIONS) request
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 3. Reconstruct the target URL
    const url = new URL(request.url);
    // This takes whatever path you sent to the worker and appends it to the target API
    const targetUrl = "https://console.gmicloud.ai" + url.pathname + url.search;

    // 4. Clone the request so we can forward it
    const modifiedRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: "follow"
    });

    try {
      // 5. Fetch the actual API
      const response = await fetch(modifiedRequest);

      // 6. Reconstruct the response to append the CORS header
      const modifiedResponse = new Response(response.body, response);
      modifiedResponse.headers.set("Access-Control-Allow-Origin", "*");
      
      return modifiedResponse;

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
  }
};