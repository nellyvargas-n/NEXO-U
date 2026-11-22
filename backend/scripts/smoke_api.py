"""Comprueba el backend DESPLEGADO sin modificar la base ni mostrar secretos.

Ejemplo: python -m scripts.smoke_api --base-url http://localhost:8000
Opcional: NEXOU_TEST_EMAIL y NEXOU_TEST_PASSWORD en entorno local para probar login.
"""
import argparse
import os
import sys
import httpx


def main():
    parser=argparse.ArgumentParser(description='Prueba no destructiva API NEXO U')
    parser.add_argument('--base-url',default='http://localhost:8000')
    args=parser.parse_args()
    url=args.base_url.rstrip('/')
    if not url.startswith(('http://localhost:', 'http://127.0.0.1:', 'https://')):
        print('ERROR: usa localhost o una URL HTTPS para evitar enviar credenciales por HTTP remoto')
        return 2
    results=[]
    try:
        with httpx.Client(base_url=url, timeout=15.0, follow_redirects=False) as client:
            for path in ('/health','/ready','/api/v1/meta','/api/v1/oportunidades/publicas','/api/v1/cursos/publicos'):
                r=client.get(path)
                good=r.status_code==200
                results.append(good)
                if path=='/ready' and good:
                    result=r.json()
                    good=result.get('status')=='ready' and result.get('database')=='connected'
                    results[-1]=good
                print(f'{"OK" if good else "ERROR"} {r.status_code} {path}')
            email=os.getenv('NEXOU_TEST_EMAIL')
            password=os.getenv('NEXOU_TEST_PASSWORD')
            if email and password:
                login=client.post('/api/v1/auth/login',json={'email':email,'password':password})
                good=login.status_code==200
                results.append(good)
                print(f'{"OK" if good else "ERROR"} {login.status_code} /api/v1/auth/login')
                if good:
                    access=login.json()['access_token']
                    me=client.get('/api/v1/auth/me',headers={'Authorization':f'Bearer {access}'})
                    expected=login.json().get('role')
                    good=me.status_code==200 and me.json().get('role')==expected
                    results.append(good)
                    print(f'{"OK" if good else "ERROR"} {me.status_code} /api/v1/auth/me (rol {expected})')
            elif email or password:
                print('AVISO: indica ambas NEXOU_TEST_EMAIL y NEXOU_TEST_PASSWORD para probar login')
    except httpx.RequestError:
        print('ERROR de red: servidor inaccesible. Comprueba Docker, URL y SSL; no compartas tus credenciales.')
        return 2
    print(f'{sum(results)}/{len(results)} comprobaciones correctas.')
    return 0 if results and all(results) else 1


if __name__=='__main__':
    sys.exit(main())
