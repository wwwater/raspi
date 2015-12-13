#!/bin/bash
killall mopidy
mopidy &
sleep 30s
echo "@MAIN:PWR=On" | telnet 192.168.1.25 50000 &>/dev/null
mpc load meow;
#mpc ls | mpc add; 
mpc random; mpc repeat; 
mpc volume 85
mpc play
~/ping_me.sh &
cd server; python server.py > /dev/null 2>&1 &
cd ~
