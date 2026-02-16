## Nginx - Roodi

Arquivos:
1. `deploy/nginx/api.roodi.app.conf`
2. `deploy/nginx/admin.roodi.app.conf`
3. `deploy/nginx/roodi.app.conf`

### Instalacao no servidor
Copiar os arquivos para:
1. `/etc/nginx/sites-available/`

Criar links simbolicos:
1. `sudo ln -sf /etc/nginx/sites-available/api.roodi.app.conf /etc/nginx/sites-enabled/api.roodi.app.conf`
2. `sudo ln -sf /etc/nginx/sites-available/admin.roodi.app.conf /etc/nginx/sites-enabled/admin.roodi.app.conf`
3. `sudo ln -sf /etc/nginx/sites-available/roodi.app.conf /etc/nginx/sites-enabled/roodi.app.conf`

Validar e recarregar:
1. `sudo nginx -t`
2. `sudo systemctl reload nginx`

### SSL com Let's Encrypt
Depois de validar DNS e HTTP:
1. `sudo certbot --nginx -d api.roodi.app -d admin.roodi.app -d roodi.app -d www.roodi.app`

Verificar renovacao:
1. `sudo systemctl status certbot.timer`
