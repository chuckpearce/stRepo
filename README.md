### Take out the Dog

<b>Files</b><br>
SmartApp: apps/takeOutDog.groovy
<br>Device Type: devices/takeOutDog.groovy

<b>Description</b><br>
This application was designed as a companion to SmartAlarm. The need was to allow someone to leave a door while the system is disarmed, then once returned trigger the alarm system back on. Set the actions to take when the switch is in the on state or the lock is put in an unlock state. This includes a Hello Home, mode change, and/or enabling switches. Next, select when to register as returned. This can be done either by setting the delay time or by selecting a contact sensor. Selecting a contact sensor means that once the door goes open/closed/open/closed it will register that you have returned. Finally select the actions that should occur when you return which are the same as when you leave except the lights will turn off.

<b>How to use</b><br>
Either turn on the "Feed the Dog" device or add a door lock to the application.

### TCP/IP Serial WebBridge

<b>Files</b><br>
NodeJS: /nodejs/

<b>Description</b><br>
This applications works as a bridge between the corresponding lib/ files and the SmartThings supported poller app.

<b>How to Install</b><br>
- Checkout the nodejs folder on a system with NodeJS installed https://nodejs.org/
- Navigate into the folder in a command window and run "npm install". 
- Edit the config.js file with your parameters.
- Execute "npm start" to srart the bridge.

<b>Notes</b><br>
The username/password field are the ones prompted for on the SmartApp.

### Rain8Net Irrigation 

<b>Prerequisites</b><br>
TCP/IP Serial WebBridge

<b>Files</b><br>
NodeJS: nodejs/lib/rain8net.js
SmartApp: apps/rain8net.groovy
<br>Device Type: devices/sprinklerZone.groovy

<b>Description</b><br>
Using the web service bridge this application manages your sprinkler schedule. With the following features
- Schedule a time and any number of days of the week to water
- Enter the duration for each zone
- Inhibit watering by virtual rain gauge based on zip code
- Pausing watering by contact sensors being placed in the open state with user definable duration
- Allowing you to pause a zone, doing so automatically delays 30 minutes
- Switch for each zone

### AquaController 

<b>Prerequisites</b><br>
TCP/IP Serial WebBridge

<b>Files</b><br>
NodeJS: nodejs/lib/aquaController.js
SmartApp: apps/aquaController.groovy
<br>Device Type: devices/aquaControllerStatus.groovy; devices/aquaControllerSwitch.groovy

<b>Description</b><br>
Using the web service bridge this application manages your aquarium. With the following features
- Set alerts if pH, Temp, or Time cross high and low thresholds w/Switch on/off manipulation. Notifications only sent 1nce every 12 hrs
- Set reminders to feed and/or clean the aquarium
- Each switch has its own device
