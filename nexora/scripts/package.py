"""Package only project source, public assets, configuration examples, and test evidence."""
from pathlib import Path
import zipfile, json, hashlib
root=Path(__file__).resolve().parents[1]
target=root/'dist'/'NEXORA-MASTER-SOURCE.zip'
allowed_files=['README.md','COMPLETION.md','package.json','package-lock.json','.gitignore','.env.example','.openai/hosting.json']
files=[root/f for f in allowed_files]
for directory in ['dist','server','scripts','tests','verification','database']:
 files.extend(p for p in (root/directory).rglob('*') if p.is_file() and p.suffix not in ['.zip','.pyc'] and '__pycache__' not in p.parts)
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as archive:
 for p in sorted(set(files)):
  assert p.name!='.env' and 'node_modules' not in p.parts
  archive.write(p,'nexora/'+str(p.relative_to(root)))
with zipfile.ZipFile(target) as archive:
 assert archive.testzip() is None
 names=set(archive.namelist())
 for required in ['server/index.js','server/tutor.js','dist/navigation.js','dist/tutor-ui.js','dist/curriculum.js','dist/guides.js','dist/stories.js','.env.example','README.md','package-lock.json','tests/tutor.test.js','server/auth.js','database/001_auth_progress.sql','dist/accounts.js','dist/course-content.js','dist/course-ages.js','dist/course-models.js','dist/course-ui.js','dist/learning.js','tests/learning.test.js','COMPLETION.md']:
  assert 'nexora/'+required in names,required
 assert not any('/node_modules/' in n or '/work/' in n or n.endswith('/.env') or '/.git/' in n for n in names)
print(json.dumps({'archive':str(target),'files':len(names),'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'zip_integrity':'passed','required_files':'passed','exclusions':'passed'},indent=2))
