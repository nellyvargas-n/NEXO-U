/** Read-only connectivity check: does not transmit credentials or alter Neon. */
const base=(process.env.NEXO_API_URL||'http://localhost:8000').replace(/\/$/,'')
async function check(path){
  const url=`${base}${path}`
  try {
    const response=await fetch(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(6000)})
    const body=await response.json().catch(()=>null)
    if(!response.ok){console.error(`${path}: HTTP ${response.status} (${body?.detail||'sin detalle'})`);return false}
    if(Array.isArray(body)) console.log(`${path}: OK · ${body.length} registro(s) reales`)
    else console.log(`${path}: OK · ${body?.status||'responde'}`)
    return true
  } catch(error){console.error(`${path}: no se pudo conectar (${error.message})`);return false}
}
console.log(`Verificando FastAPI local en ${base}`)
const results=await Promise.all([check('/health'),check('/ready'),check('/api/v1/oportunidades/publicas'),check('/api/v1/cursos/publicos')])
if(!results.every(Boolean)) process.exitCode=1
