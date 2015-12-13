#!/bin/bash
# This script puts the system in $1 minutes under suspend mode for $2 hours
#

#kill executing ping_me script
killall ping_me.sh & > /dev/null

mpc clear; mpc load zzz; mpc play;

if [ $# -ne 2 ]
then
    #echo "usage: $0 <suspend in min> <wake up in hours>"
    #exit 0
    min=30
    hours=7
else
    min=$1
    hours=$2
fi

echo "The music will be off in "$min" minutes becoming meanwhile quiter."
echo "I will start the music again in/at "$hours" hours/o'clock and the volume will increase slowly since then."

#divide time before sleeping in 60 parts and convert in seconds
steps_sec=`echo $min | awk '{print $1 * 60 / 60}'` 

for i in {1..60}
do
    sleep $steps_sec's'
    #volume control. decrease by 0.5 dB%
    echo "@MAIN:VOL=Down" | telnet 192.168.1.25 50000 &>/dev/null
done

now=`date +"%H %M" | awk '{print $1 + $2 / 60}'`; 

#2 arg - wake up at h:r, 1 arg - wake up in h
wakeupin=`echo $hours | sed 's/:/ /' | awk -v t=$now '{ 
    if (NF == 2) { 
        w = $1 + $2/60;
        if (w < t) { 
            wi = 24 - t + w;
        } else {
            wi = w - t;
        }
        printf "%d", wi*60;
    } else {
        printf "%d", $1*60;
    }
}'`


#echo "@MAIN:PWR=Standby" | telnet 192.168.1.25 50000 &>/dev/null
mpc stop & > /dev/null
#echo $wakeupin | awk '{print $1}'
sleep "$wakeupin"m
sleep 5s
#echo "@MAIN:PWR=On" | telnet 192.168.1.25 50000 &>/dev/null
mpc play & > /dev/null
#echo "Morning Raspi and Dariushka!"

for i in {1..60}
do
    sleep 30s
    echo "@MAIN:VOL=Up" | telnet 192.168.1.25 50000 & > /dev/null
done

/home/pi/ping_me.sh &
