/**
 *	Web Service Bridge SmartApp
 * 
 *  Author: Chuck Pearce
 *  Date: 2015-03-10
 *
 **************************
 */
import groovy.json.*

definition(
	name: "Rain8Net Poller",
	namespace: "chuck-pearce",
	author: "Chuck Pearce",
	description: "Connect to local nodejs bridge for com based devices and access rain8.js",
	category: "SmartThings Labs",
	iconUrl:   "http://i.imgur.com/Ln4BPWg.png",
	iconX2Url: "http://i.imgur.com/Ln4BPWg.png",
	iconX3Url: "http://i.imgur.com/Ln4BPWg.png"
)

preferences {
	section("Server information"){
		input("username", "text", title: "Username", required: true, description: "Server Address", default: 'admin')
		input("password", "text", title: "Password", required: true, description: "Server Port", default: '12345')
		input("server", "text", title: "Server", required: true, description: "Server Address")
		input("port", "text", title: "Port", required: true, description: "Server Port", default: '8082')
	}
	section("Connectivity"){
		input(name: "polling", title: "Server Polling (in Minutes)", type: "int", description: "in minutes", defaultValue: "5" )
	}
	section("Zone 1"){
		input("z1name", "text", title: "Name", description: "Name of zone")
		input("z1duration", "text", title: "Run Time", description: "Duration (min) zone should run")
	}
	section("Zone 2"){
		input("z2name", "text", title: "Name", description: "Name of zone")
		input("z2duration", "text", title: "Run Time", description: "Duration (min) zone should run")
	}
	section("Zone 3"){
		input("z3name", "text", title: "Name", description: "Name of zone")
		input("z3duration", "text", title: "Run Time", description: "Duration (min) zone should run")
	}
	section("Zone 4"){
		input("z4name", "text", title: "Name", description: "Name of zone")
		input("z4duration", "text", title: "Run Time", description: "Duration (min) zone should run")
	}
	section("Zone 5"){
		input("z5name", "text", title: "Name", description: "Name of zone")
		input("z5duration", "text", title: "Run Time", description: "Duration (min) zone should run")
	}
	section("Zone 6"){
		input("z6name", "text", title: "Name", description: "Name of zone")
		input("z6duration", "text", title: "Run Time", description: "Duration (min) zone should run")
	}
	section("Zone 7"){
		input("z7name", "text", title: "Name", description: "Name of zone")
		input("z7duration", "text", title: "Run Time", description: "Duration (min) zone should run")
	}
	section("Zone 8"){
		input("z8name", "text", title: "Name", description: "Name of zone")
		input("z8duration", "text", title: "Run Time", description: "Duration (min) zone should run")
	}
	section("Schedule"){
		input("Days", "enum", title: "Water Days", description: "Days of the week to water", multiple: true, required: true, options: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"])
		input("waterTime", "time", title: "Start Time", required: true, description: "When to start watering")
	}
	section("Notification"){
		input("notifySchedule", "boolean", title: "Notify on Schedule", required: false)
		input("notifyFail", "boolean", title: "Notify on Failure", required: false)
	}
    
    section("Virtual Rain Gauge") {
        input "zipcode", "text", title: "Zipcode?", required: false
    	input "isYesterdaysRainEnabled", "boolean", title: "Yesterday's Rain", description: "Include?", defaultValue: "true", required: false
    	input "isTodaysRainEnabled", "boolean", title: "Today's Rain", description: "Include?", defaultValue: "true", required: false
    	input "isForecastRainEnabled", "boolean", title: "Forecasted Rain", description: "Include?", defaultValue: "false", required: false
    	input "wetThreshold", "decimal", title: "Inches to Inhibit (0.5)", required: false
    }

    section("Auto Inhibit On") {
    	input(name: "contact", title: "Contact Sensor", type: "capability.contactSensor", required: false, multiple: true )
        input "inhibitDuration", "number", title: "Duration to Pause (min)", required: false

    }
		
}

/* Initialization */
def installed() {
    log.debug "Installed with settings: ${settings}"
    addChildDevice("chuck-pearce", "Rain8Net: Sprinkler Status", 'SprinklerStatus|0', null, ["name": "Rain8Net: Sprinkler Status",  "completedSetup": true])
    addChildDevice("chuck-pearce", "Rain8Net: Sprinkler Zone", 'SprinklerZone|1', null, ["name": "Rain8Net: Sprinkler Zone 1",  "completedSetup": true])
    addChildDevice("chuck-pearce", "Rain8Net: Sprinkler Zone", 'SprinklerZone|2', null, ["name": "Rain8Net: Sprinkler Zone 2",  "completedSetup": true])
    addChildDevice("chuck-pearce", "Rain8Net: Sprinkler Zone", 'SprinklerZone|3', null, ["name": "Rain8Net: Sprinkler Zone 3",  "completedSetup": true])
    addChildDevice("chuck-pearce", "Rain8Net: Sprinkler Zone", 'SprinklerZone|4', null, ["name": "Rain8Net: Sprinkler Zone 4",  "completedSetup": true])
    addChildDevice("chuck-pearce", "Rain8Net: Sprinkler Zone", 'SprinklerZone|5', null, ["name": "Rain8Net: Sprinkler Zone 5",  "completedSetup": true])
    addChildDevice("chuck-pearce", "Rain8Net: Sprinkler Zone", 'SprinklerZone|6', null, ["name": "Rain8Net: Sprinkler Zone 6",  "completedSetup": true])
    addChildDevice("chuck-pearce", "Rain8Net: Sprinkler Zone", 'SprinklerZone|7', null, ["name": "Rain8Net: Sprinkler Zone 7",  "completedSetup": true])
    addChildDevice("chuck-pearce", "Rain8Net: Sprinkler Zone", 'SprinklerZone|8', null, ["name": "Rain8Net: Sprinkler Zone 8",  "completedSetup": true])

    initialize()
}

def uninstalled() {
	unschedule()
	def deleteDevices = getAllChildDevices()
	deleteDevices.each { deleteChildDevice(it.deviceNetworkId) }
}


def disconnected () {
	def childDevice = getAllChildDevices()
	childDevice.each { 
		if (it.deviceNetworkId.toString() != "SprinklerStatus|0") {
			it.updateDeviceStatus(2)
		}
	}
}

def updated() { 
    log.debug "Updated with settings: ${settings}"

	def childDevice = getAllChildDevices()
	childDevice.each {
		switch ( getChildZoneID(it).split("\\|")[1] ) {
		    case "1":
		    	if (z1name) { it.name = z1name }	
                break	    	
		    case "2":
		    	if (z2name) { it.name = z2name }
                break
		    case "3":
		    	if (z3name) { it.name = z3name }
                break
		    case "4":
		    	if (z4name) { it.name = z4name }
                break
		    case "5":
		    	if (z5name) { it.name = z5name }
                break
		    case "6":
		    	if (z6name) { it.name = z6name }
                break
		    case "7":
		    	if (z7name) { it.name = z7name }
                break
		    case "8":
		    	if (z8name) { it.name = z8name }
                break
		}
	}

    initialize()
}

def initialize() { 

	unschedule("getZoneStatus")
	unschedule("executeSchedule")
	schedule("0 0/" + ((settings.polling.toInteger() > 0 )? settings.polling.toInteger() : 1)  + " * * * ?", "getZoneStatus" )
	
	if (waterTime) {
		schedule(waterTime, "executeSchedule")
	}

/*

http://community.smartthings.com/t/scheduling-via-cron/12697

	if (waterDays && waterTime) {
		def cronDays = ""
		waterDays.each {
			switch (it) {
				case "Monday":
					cronDays += "MON,"
                    break
				case "Tuesday":
					cronDays += "TUE,"
                    break
				case "Wednesday":
					cronDays += "WED,"
                    break
				case "Thursday":
					cronDays += "THU,"
                    break
				case "Friday":
					cronDays += "FRI,"
                    break
				case "Saturday":
					cronDays += "SAT,"
                    break
				case "Sunday":
					cronDays += "SUN,"
                    break
			}
		}
		cronDays = cronDays.substring(0, cronDays.length()-1)
		def timeParts = waterTime.split('T')[1].split(":")
		def min = timeParts[1].toInteger()
		def hr = timeParts[0].toInteger()
		//0 44 14 * * 5 ?
		//0 $min $hr ? * MON-FRI
		def sched = "0 $min $hr ? $cronDays"

		log.debug "Starting schedule $sched"
		schedule(sched, executeSchedule )
*/
		//executeSchedule()
}

def waterDays() {
	if(!days) return true

	def today = new Date().format("EEEE", location.timeZone)
	log.debug "today: ${today}, days: ${days}"
 		if (Days.contains(today)) { 
 			return true
    }
    log.trace"water heater is not scheduled for today"
    return false
}

def clearPause () {
	state.pausedDuration = 0

	def childDevice = getAllChildDevices()
	childDevice.each { 				
        if (it.deviceNetworkId != "SprinklerStatus|0") {
			it.updateDeviceStatus(0)
		}
	}
}

def contactOpen () {
	unsubscribe()
	child = getChildDevice("SprinklerZone|$state.currentWatering");
	state.contactTrigger = true
	toggleZoneStatus(child, "false")
	pauseSchedule(child, inhibitDuration ? inhibitDuration : 10 )
}

def executeSchedule (valve = 1) {
	// Verify we have a good connection
	// Verify all zones are off
	// Verify zone X is available
	// Turn zone X on
	// Schedule zone X off in Z minutes, upon trigger of off proceed to Y for loop

	if (!waterDays()) {
		return
	}

	if (contact && state.watering) {
		unsubscribe()
		subscribe(contact, "contact.open", contactOpen)
	}

	var rainGauge = isRainDelay()

	if (rainGauge > (wetThreshold?.toFloat() ?: 0.5)) {
		sendEvent(name: "Rain8Net Poller", value: "inhibit", display: true, descriptionText: "Lawn will not be watered today. It has rained $rainGauge in.")
		state.waterStatus = "Rain Inhibit - $rainGauge in"
	}

	if (!state.watering) {
		sendEvent(name: "Rain8Net Poller", value: "on", display: true, descriptionText: "Starting to water the lawn")
		state.waterStatus = "Currently Watering"
		state.lastWaterDate = new Date().format("dd/MM/yyyy")

		// Set the status to Scheduled
		def childDevice = getAllChildDevices()
		childDevice.each { 
			if (it.deviceNetworkId.toString() != "SprinklerStatus|0") {
				it.updateDeviceStatus(3)
			}
		}

		if (notifySchedule) {
			sendPush( "Starting to water the lawn")
		}
	} else if ( (state.watering) && (valve > 8) ){
		state.watering = false
		state.currentWatering = 0
		sendEvent(name: "Rain8Net Poller", value: "off", display: true, descriptionText: "Ending watering the lawn")
		state.waterStatus = "Completed Today"
		if (notifySchedule) {
			sendPush( "Ending watering the lawn")
		}
		return
	} else {
		state.watering = true
	}

	// Verify we have a connection to the rain8 device
	def valveDuration = lookupValveDuration(valve) * 60;

	if (state.pausedDuration > 0) {
		valveDuration = state.pausedDuration
		clearPause()
	}
	
	if (valveDuration > 0) {
		webServiceCall("/rain8/connection", []) { response ->
			if (response.status == 200) {
				// Verify all zones are currently off
				webServiceCall("/rain8/status", []) { statResp ->
					def running = false
					for (int i = 1; i < 9; i++) {
						if (statResp.data[i.toString()] == "on") {
							running = true
						}
					}

					if (running) {
						sendEvent(name: "Rain8Net Poller", value: "fail", display: true, descriptionText: "Active zones are preventing execution of schedule")
					} else {
						// Turn on the zone
						toggleZoneStatus(valve, "true");
						state.currentWatering = valve
						switch (valve.toInteger()) {
							case 1:
								runIn( valveDuration.toInteger(), toggleScheduleValve1)
								break
							case 2:
								runIn( valveDuration.toInteger(), toggleScheduleValve2)
								break
							case 3:
								runIn( valveDuration.toInteger(), toggleScheduleValve3)
								break
							case 4:
								runIn( valveDuration.toInteger(), toggleScheduleValve4)
								break
							case 5:
								runIn( valveDuration.toInteger(), toggleScheduleValve5)
								break
							case 6:
								runIn( valveDuration.toInteger(), toggleScheduleValve6)
								break
							case 7:
								runIn( valveDuration.toInteger(), toggleScheduleValve7)
								break
							case 8:
								runIn( valveDuration.toInteger(), toggleScheduleValve8)
								break
						}

					}
				}
			} else {
				sendEvent(name: "Rain8Net Poller", value: "fail", display: true, descriptionText: "Unable to execute schedule, module not responding")
				disconnected()
			}
		}
	} else {
		executeSchedule ( valve.toInteger() + 1 )
	}
	// X = Zone 1
	// Y = Zone increment
	// Z = Zone duration
}

// This is dumb but I couldn't find a way to call a method in a schedule and pass params....

def toggleScheduleValve1 () {
	toggleZoneStatus("1", "false");
}

def toggleScheduleValve2 () {
	toggleZoneStatus("2", "false");
}

def toggleScheduleValve3 () {
	toggleZoneStatus("3", "false");
}

def toggleScheduleValve4 () {
	toggleZoneStatus("4", "false");
}

def toggleScheduleValve5 () {
	toggleZoneStatus("5", "false");
}

def toggleScheduleValve6 () {
	toggleZoneStatus("6", "false");
}

def toggleScheduleValve7 () {
	toggleZoneStatus("7", "false");
}

def toggleScheduleValve8 () {
	toggleZoneStatus("8", "false");
}

def lookupValveDuration(valve) {
	switch (valve) {
		case "1":
			return (z1duration) ? z1duration.toInteger() : 0
			break
		case "2":
			return (z2duration) ? z2duration.toInteger() : 0
			break
		case "3":
			return (z3duration) ? z3duration.toInteger() : 0
			break
		case "4":
			return (z4duration) ? z4duration.toInteger() : 0
			break
		case "5":
			return (z5duration) ? z5duration.toInteger() : 0
			break
		case "6":
			return (z6duration) ? z6duration.toInteger() : 0
			break
		case "7":
			return (z7duration) ? z7duration.toInteger() : 0
			break
		case "8":
			return (z8duration) ? z8duration.toInteger() : 0
			break
	}
}

def webServiceCall (path, query = [], callback = {}) {

	def call = [
	    uri: "http://$username:$password@$server:$port",
	    path: path,
	    headers: ["Content-Type": "text/json"],
	    query: query
	]

	try{
    	httpGet(call) { response ->
    		callback(response)
    	}
	} catch(Exception e) {
		log.debug "ERROR: Making web service call to $path" + e
	}

}
def getZoneStatus () {
	
	def call = [
	    uri: "http://$username:$password@$server:$port",
	    path: "/rain8/status",
	    headers: ["Content-Type": "text/json"]
	]

	try{
    	httpGet(call) { response ->        
    		def childDevice = getAllChildDevices()
			childDevice.each { 				
                if (it.deviceNetworkId != "SprinklerStatus|0") {
	            	def status = "${response.data[it.deviceNetworkId.split("\\|")[1]]}"
	                state.failures = 0

					if (status.toString() == "on") {
						it.updateDeviceStatus(1)
					} else {
						it.updateDeviceStatus(0)
					}
				}
			}
		}
	} catch(Exception e)
	{
	  	log.debug "___exception getting stats: " + e
	  	if (state.failures >= 3) {
			disconnected()
	  	} else {
		  	runIn(60, getZoneStatus)
		  	state.failures = (1 + state.failures)
	  	}
	}

}

def allOff ( ) {
	def call = [
	    uri: "http://$username:$password@$server:$port",
	    path: "/rain8/off",
	    headers: ["Content-Type": "text/json"]
	]
	try{
    	httpGet(call) { response ->
			if (response == "Success") {
				log.debug "All zones have been turned off"
			}
		}
	} catch(Exception e)
	{
	  log.debug "___exception turning off all zones: " + e
		disconnected()
	}
}

def pauseSchedule (child, duration) {
	sendEvent(name: "Rain8Net Poller", value: "paused", display: true, descriptionText: "Watering the lawn has been paused for $duration minutes")
	state.waterStatus = "Currently Paused"
	state.pausedOn = getChildZoneID(child).split("\\|")[1]
	child.updateDeviceStatus(4)
	state.pausedDuration = lookupValveDuration(state.pausedOn.toString()) - (((now() - state.zoneStartTime) / 1000) / 60)
	log.debug "Paused on $state.pausedOn and Pause duration for $state.pausedDuration"
	runIn(duration * 60, resumePausedSchedule)
}

def resumePausedSchedule () {
	state.waterStatus = "Currently Watering"
	state.contactTrigger = false
	executeSchedule(state.pausedOn.toInteger())
}

def toggleZoneStatus ( child, value ) {
	// value = true/false
	def zoneID = 0
	def valve = 0
	def fromButton = false

	try {
		if (child.toInteger() > 0) {
			zoneID = child
			valve = zoneID.toInteger()
			child = getChildDevice("SprinklerZone|$valve");
		} else {
			zoneID = getChildZoneID(child).split("\\|")[1]
			fromButton = true;
		}
	} catch (Exception e){
		zoneID = getChildZoneID(child).split("\\|")[1]
			fromButton = true;
	}

	def call = [
	    uri: "http://$username:$password@$server:$port",
	    path: "/rain8/zone",
	    headers: ["Content-Type": "text/json"],
	    query: [zone: zoneID.toString(), enable: value.toString()]
	]
	try{
    	httpGet(call) { response ->
    		log.debug "Zone toggle response ${response.status}"
			if (response.status == 200) {
				log.debug "Zone $zoneID set to status $value"
				// Refresh all zones just in case
				runIn(10, getZoneStatus)

				if (value.toString() == "true") {
					child.updateDeviceStatus(1)
					state.zoneStartTime = now()
				} else {
					child.updateDeviceStatus(0)
				}

				if (state.watering && value == "false" && child.currentValue("switch") == "paused" && fromButton) {
					// End watering cycle
					state.watering = false
					state.currentWatering = 0
					sendEvent(name: "Rain8Net Poller", value: "off", display: true, descriptionText: "Watering the lawn has been cancelled today")
					state.waterStatus = "Cancelled Today"
					clearPause()
				} else if (state.watering && value == "false" && fromButton && !state.contactTrigger) {
					pauseSchedule(child, 30)
				} else if ( (valve > 0) && (value == "false") && (valve < 9) && !fromButton && !state.contactTrigger) {
					executeSchedule ( valve.toInteger() + 1 )
				}
			}
		}
	} catch(Exception e)
	{
	  log.debug "___exception toggling zone: " + e
	  disconnected()
	}
}

def getChildZoneID(child) {
	return child.device.deviceNetworkId
}

/*
* All credit for the rain functions goes to Stan Dotson (stan@dotson.info) and Matthew Nichols (matt@nichols.name)
* Thanks to SmartSprinkler https://github.com/d8adrvn/smart_sprinkler
*/

def isRainDelay() { 

	def rainGauge = 0
    
    	log.debug "Start check"
    if (isYesterdaysRainEnabled.equals("true")) {    
    	log.debug "Start yesterday"
    	log.debug wasWetYesterday()    
    	rainGauge = rainGauge + 0
   	}
    
    if (isTodaysRainEnabled.equals("true")) {
    	rainGauge = rainGauge + isWet()
    }
    
    if (isForecastRainEnabled.equals("true")) {
    	rainGauge = rainGauge + isStormy()
  	}
    
    return rainGauge

}

def safeToFloat(value) {
    if(value && value.isFloat()) return value.toFloat()
    return 0.0
}

def wasWetYesterday() {
    if (!zipcode) return false

    def yesterdaysWeather = getWeatherFeature("yesterday", zipcode)
    def yesterdaysPrecip=yesterdaysWeather.history.dailysummary.precipi.toArray()
    def yesterdaysInches=safeToFloat(yesterdaysPrecip[0])
    log.info("Checking yesterday's percipitation for $zipcode: $yesterdaysInches in")
	return yesterdaysInches
}


def isWet() {
    if (!zipcode) return false

    def todaysWeather = getWeatherFeature("conditions", zipcode)
    def todaysInches = safeToFloat(todaysWeather.current_observation.precip_today_in)
    log.info("Checking today's percipitation for $zipcode: $todaysInches in")
    return todaysInches
}

def isStormy() {
    if (!zipcode) return false

    def forecastWeather = getWeatherFeature("forecast", zipcode)
    def forecastPrecip=forecastWeather.forecast.simpleforecast.forecastday.qpf_allday.in.toArray()
    def forecastInches=forecastPrecip[0]
    log.info("Checking forecast percipitation for $zipcode: $forecastInches in")
    return forecastInches
}

/*
* End code borrowed from Smart Sprinkler
*/
