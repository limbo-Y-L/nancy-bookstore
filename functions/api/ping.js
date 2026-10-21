export async function onRequest({ env }) {
  const hasOcrSecret = !!(
    env.TENCENT_OCR_SECRET_ID &&
    env.TENCENT_OCR_SECRET_KEY
  );
  
  return new Response(
    JSON.stringify({
      ok: true,
      runtime: "cf-pages-functions",
      hasOcrSecret: hasOcrSecret,
      hasLegacySecret: false
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}