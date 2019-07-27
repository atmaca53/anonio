@echo off

IF NOT EXIST %AppData%\Anon (
    mkdir %AppData%\Anon
)

IF NOT EXIST %AppData%\ZcashParams (
    mkdir %AppData%\ZcashParams
)

IF NOT EXIST %AppData%\Anon\anon.conf (
   (
    echo rpcuser=anonuser
    echo rpcpassword=anonpass
    echo rpcallowip=127.0.0.1
    echo txindex=1
    echo server=1
) > %AppData%\Anon\anon.conf
) 
