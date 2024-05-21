# SignalK plugin for ModemManager Location 
_Use your modem's GPS with SignalK_

## Enabling the pi user to read location
To enable the `pi` user to read location from ModemManager a PolicyKit rule needs to be added. Create `/etc/polkit-1/localauthority/50-local.d/modemmanager.pkla` with the rule:
```
[pi is allowed to control the modem and read location]
Identity=unix-user:pi
Action=org.freedesktop.ModemManager1.Device.Control;org.freedesktop.ModemManager1.Location
ResultAny=yes
```

## Debugging

You can inspect ModemManager location with the `mmcli` command, to first enable location:

`mmcli -m 0 --location-enable-gps-nmea --location-enable-gps-raw`

Get the location:

`mmcli -m 0 --location-get`