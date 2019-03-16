#!/bin/sh

ssh root@104.248.227.146 << EOF
  cd ~/rc-coffee-chats
  git pull
  npm run build
  pm2 start npm -- start
EOF