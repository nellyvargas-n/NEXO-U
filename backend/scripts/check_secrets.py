"""Comprobación básica para prevenir exposición de .env. No imprime secretos."""
from pathlib import Path
import sys
root=Path(__file__).resolve().parents[1]
prohibited=['.env','.env.local','.env.production','CREDENCIALES_GENERADAS.md']
# In a local machine, .env should exist, but NEVER be added to ZIP or Git.
files=list(root.rglob('*'))
gitignore=(root/'.gitignore').read_text(encoding='utf-8')
problems=[]
for x in files:
    if not x.is_file():continue
    if '.local_credentials' in x.parts:continue
    if x.name in prohibited:
        print(f'AVISO PRIVADO: {x.relative_to(root)} existe localmente. No subas este archivo.')
for required in ('.env','*.pem','.local_credentials/'):
    if required not in gitignore:problems.append(f'Falta proteger {required} en .gitignore')
for item in problems:print('ERROR:',item)
if not problems:print('OK: reglas básicas de .gitignore presentes. Revisa el historial de Git por secretos antiguos.')
sys.exit(bool(problems))
