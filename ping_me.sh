#!/bin/bash

ping_t=300;
init_c=3;
counter=$init_c;
imhome=0;
deb=`ping 192.168.1.11 -s 1 -c 3 | grep "received" | sed 's/..* \(.\) received, ..*/\1/'`;
if [ "$deb" != "0" ]; then
    imhome=1;
fi

status=$imhome;
while [ 1 = 1 ]; do
    deb=`ping 192.168.1.11 -s 1 -c 3 | grep "received" | sed 's/..* \(.\) received, ..*/\1/'`;
    if [ "$deb" != "0" ]; then
        imhome=1;
    else
        imhome=0;	
    fi
    #echo $deb;
    #echo $status;
    #echo $imhome;
    if [ $imhome != $status ]; then
        if [ $imhome = "1" ]; then 
            date >> log_ping
            echo "Back home!" >> log_ping
            mopidy &
            echo "@MAIN:PWR=On" | telnet 192.168.1.25 50000 &>/dev/null
            sleep 40s
            echo "@MAIN:VOL=-23.0" | telnet 192.168.1.25 50000 &>/dev/null		
            mpc load meow 
            mpc random 
            mpc repeat  	
            mpc volume 85
            mpc play 
            ping_t=300;
            counter=$init_c;
            status=$imhome;
        else
            counter=$(($counter-1));
            date >> log_ping
            echo $counter >> log_ping
            if [ $counter == "0" ]; then
                date >> log_ping
                echo "Left!" >> log_ping
                echo "@MAIN:PWR=Standby" | telnet 192.168.1.25 50000 &>/dev/null
                pkill mopidy &>/dev/null
                #mpc stop &>/dev/null
                status=$imhome;
                piing_t=120;
            fi
        fi
    else
        if [ $imhome = "1" ]; then
            counter=$init_c;
        fi
    fi
    sleep $ping_t's';
done

