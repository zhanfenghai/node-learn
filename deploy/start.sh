#!/bin/sh
if [ ! -f "pid" ]
then
    node ../daemon.js 
    echo $! > pid
fi