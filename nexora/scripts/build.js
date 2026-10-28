import {readFileSync,existsSync,readdirSync,rmSync,mkdirSync,cpSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
for(const dir of ['dist','server'])for(const f of readdirSync(dir).filter(x=>x.endsWith('.js')))execFileSync(process.execPath,['--check',`${dir}/${f}`]);
for(const f of ['index.html','style.css'])if(!existsSync('dist/'+f))throw Error('Missing '+f);
const manifest=JSON.parse(readFileSync('.openai/hosting.json'));if(!manifest.project_id)throw Error('Missing Site ID');
rmSync('build',{recursive:true,force:true});mkdirSync('build',{recursive:true});
cpSync('dist','build/dist',{recursive:true,filter:p=>!p.endsWith('.zip')});cpSync('server','build/server',{recursive:true});cpSync('package.json','build/package.json');cpSync('package-lock.json','build/package-lock.json');cpSync('.env.example','build/.env.example');
console.log('Production build created: build/dist + build/server. Run node --env-file-if-exists=.env build/server/index.js. All source modules passed syntax checks.');
