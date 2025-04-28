@echo off
start "" /b cloudflared tunnel --config "D:\.cloudflared\7392f952-5d42-49c6-8a79-576a50bcf11b.json" --protocol http2 run freshbox-tunnel
exit
