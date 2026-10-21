export async function onRequest(context) {
const hasOcr   = !!context.env.TENCENT_OCR_SECRET_ID;
const hasLegacy= !!context.env.TENCENT_SECRET_ID;
return new Response(JSON.stringify({
ok: true,
runtime: "cf-pages-functions",
hasOcrSecret: hasOcr,
hasLegacySecret: hasLegacy
}), { headers: { "Content-Type": "application/json" } });
}
