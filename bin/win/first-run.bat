@echo off

IF NOT EXIST %AppData%\Anon (
    mkdir %AppData%\Anon
)

IF NOT EXIST %AppData%\AnonParams (
    mkdir %AppData%\AnonParams
)

IF NOT EXIST %AppData%\Anon\anon.conf (
   (
    echo addnode=mainnet.z.cash 
    echo rpcuser=username 
    echo rpcpassword=password%random%%random%
    echo daemon=1 
    echo showmetrics=0 
    echo gen=0 
) > %AppData%\Anon\anon.conf
) 
