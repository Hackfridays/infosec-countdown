# Infosec-Countdown

## Dependencies
- Python

## Run

Edit the socket server path in `js/app.js` file and also the `index.html`.

```bash
$ ./run
```

## Auto-Run
- Install [R-kiosk add-on](https://addons.mozilla.org/en-us/firefox/addon/r-kiosk/)
- Edit `rc.local` and add the command `cd /home/pi/Desktop/infosec-countdown && sudo sh run` to the script before the `exit 0`
```bash
$ sudo nano /etc/rc.local
```
```bash
cd /home/pi/Desktop/infosec-countdown && sudo sh run
exit 0
```
