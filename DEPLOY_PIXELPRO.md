# Deploy PixelPro subdomain (Docker + Nginx)

Muc tieu:
- `vivutrade.io.vn` van chay nhu cu.
- Them web moi tai `pixelpro.vivutrade.io.vn`.

## 1) DNS
Tao ban ghi `A`:
- Host: `pixelpro`
- Value: IP server dang chay Docker/Nginx

## 2) Chay container PixelPro (khong dung cong 80)
Trong project:

```powershell
cd d:\porfolio\betterdeal
docker compose down
docker compose up -d --build
```

Mac dinh compose da map:
- Host `18081` -> Container `8787`

Neu muon doi cong host, set trong `.env`:

```env
HOST_PORT=18081
```

## 3) Cau hinh Nginx cho subdomain
Copy file `deploy/nginx/pixelpro.vivutrade.io.vn.conf` len server:
- Debian/Ubuntu: `/etc/nginx/sites-available/pixelpro.vivutrade.io.vn.conf`
- Tao symlink sang `sites-enabled`

Vi du:

```bash
sudo ln -s /etc/nginx/sites-available/pixelpro.vivutrade.io.vn.conf /etc/nginx/sites-enabled/pixelpro.vivutrade.io.vn.conf
sudo nginx -t
sudo systemctl reload nginx
```

## 4) Bat HTTPS (Let's Encrypt)
```bash
sudo certbot --nginx -d pixelpro.vivutrade.io.vn
```

## 5) Kiem tra
```bash
curl -I http://127.0.0.1:18081
curl -I https://pixelpro.vivutrade.io.vn
```
