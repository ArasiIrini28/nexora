import {createAuthHandler} from './auth.js';
import http from 'node:http';import {readFile,stat} from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';import {answerTutor,TutorError} from './tutor.js';
const root=fileURLToPath(new URL('../dist/',import.meta.url));const port=Number(process.env.PORT)||3000;const host=process.env.HOST||'127.0.0.1';const buckets=new Map();let daily={day:'',count:0};let active=0;
const contentTypes={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.md':'text/plain; charset=utf-8','.zip':'application/zip','.svg':'image/svg+xml'};
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data))}
export function createServer(){const handleAuth=createAuthHandler();return http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');if(await handleAuth(req,res,url,json))return;
 if(url.pathname==='/api/assistant/status'&&req.method==='GET')return json(res,200,{configured:!!process.env.OPENAI_API_KEY,provider:'OpenAI'});
 if(url.pathname==='/api/assistant'){
  if(req.method!=='POST')return json(res,405,{error:'Use POST.'});
  const origin=req.headers.origin;if(origin){let originHost;try{originHost=new URL(origin).host}catch{throw new TutorError(403,'Invalid origin.')}if(originHost!==req.headers.host)throw new TutorError(403,'Cross-origin requests are not allowed.');}
  if(!String(req.headers['content-type']||'').startsWith('application/json'))throw new TutorError(415,'Use application/json.');
  const now=Date.now(),id=req.socket.remoteAddress||'local';for(const[k,v]of buckets)if(now-v.start>60000)buckets.delete(k);const b=buckets.get(id)||{start:now,count:0};if(++b.count>10)throw new TutorError(429,'Please wait a minute before asking more questions.');buckets.set(id,b);
  if(active>=3)throw new TutorError(429,'The tutor is helping several learners. Please retry shortly.');
  const day=new Date().toISOString().slice(0,10);if(daily.day!==day)daily={day,count:0};if(daily.count>=Math.max(1,Number(process.env.AI_DAILY_REQUEST_LIMIT)||100))throw new TutorError(429,'The tutor reached its daily request limit. Please return tomorrow.');
  let body='',bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>24000)throw new TutorError(413,'This request is too large. Start a new conversation.');body+=chunk}
  let parsed;try{parsed=JSON.parse(body)}catch{throw new TutorError(400,'Invalid JSON request.')}
  active++;try{const answer=await answerTutor(parsed,process.env);daily.count++;return json(res,200,answer)}finally{active--}
 }
 if(url.pathname.startsWith('/api/'))return json(res,404,{error:'Unknown API route.'});
 if(!['GET','HEAD'].includes(req.method))return json(res,405,{error:'Method not allowed.'});
 const requested=decodeURIComponent(url.pathname);const file=path.resolve(root,'.'+(requested==='/'?'/index.html':requested));if(!file.startsWith(root)||requested.includes('\0'))throw new TutorError(403,'Invalid path.');
 try{if(!(await stat(file)).isFile())throw Error();const body=await readFile(file);res.writeHead(200,{'Content-Type':contentTypes[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-eval' blob:; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'"});res.end(req.method==='HEAD'?undefined:body)}catch{return json(res,404,{error:'File not found.'})}
 }catch(e){json(res,e instanceof TutorError?e.status:500,{error:e instanceof TutorError?e.message:'The request could not be completed.'})}})}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){createServer().listen(port,host,()=>console.log(`NEXORA: http://${host}:${port} · AI tutor ${process.env.OPENAI_API_KEY?'configured':'not configured'}`));}
