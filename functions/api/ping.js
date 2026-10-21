export async function onRequest(context) {
const hasId = !!context.env.TENCENT_SECRET_ID;
return new Response(JSON.stringify({
ok: true,
runtime: "cf-pages-functions",
hasSecret: hasId
}), { headers: { "Content-Type": "application/json" } });
}
