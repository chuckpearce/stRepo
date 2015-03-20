/**
 *	AquaController Jr Serial SmartApp
 * 
 *  Author: Chuck Pearce
 *  Date: 2015-03-10
 */
import groovy.json.*

definition(
	name: "AquaController Poller",
	namespace: "chuck-pearce",
	author: "Chuck Pearce",
	description: "Connect to local nodejs bridge for com based devices and access AquaController.js",
	category: "SmartThings Labs",
	iconUrl:   "http://blogs.artcenter.edu/dottedline/wp-content/uploads/2013/04/long-beach-aquarium.png",
	iconX2Url: "http://blogs.artcenter.edu/dottedline/wp-content/uploads/2013/04/long-beach-aquarium.png",
	iconX3Url: "http://blogs.artcenter.edu/dottedline/wp-content/uploads/2013/04/long-beach-aquarium.png"
)

preferences {
	page(name: "Server", title: "Server", nextPage: "Notifications", uninstall: true) {
		section("Server information"){
			input("username", "text", title: "Username", required: true, description: "Server Address", default: 'admin')
			input("password", "text", title: "Password", required: true, description: "Server Port", default: '12345')
			input("server", "text", title: "Server", required: true, description: "Server Address")
			input("port", "text", title: "Port", required: true, description: "Server Port", default: '8082')
		}
		section("Connectivity"){
			input(name: "polling", title: "Server Polling (in Minutes)", type: "int", description: "in minutes", defaultValue: "5" )
		}
	}
	page(name: "Notifications", title: "Notifications", nextPage: "Reminders") {
		section("pH Notifications"){
			input("phAbove", "decimal", title: "pH High Limit", required: false)
			input("phBelow", "decimal", title: "pH Low Limit", required: false)		
			input("phEnableSwitch", "capability.switch", multiple: true, title: "Switches On", required: false)
			input("phDisableSwitch", "capability.switch", multiple: true, title: "Switches Off", required: false)
			input("phNotify", "boolean", title: "Notify", required: false)
		}
		section("Temperature Notifications"){
			input("tempAbove", "decimal", title: "Temp High Limit", required: false)
			input("tempBelow", "decimal", title: "Temp Low Limit", required: false)	
			input("tempEnableSwitch", "capability.switch", multiple: true, title: "Switches On", required: false)
			input("tempDisableSwitch", "capability.switch", multiple: true, title: "Switches Off", required: false)
			input("tempNotify", "boolean", title: "Notify", required: false)
		}
		section("Time Notifications"){
			input("timeDiff", "number", title: "Time Difference (min)", required: false)	
			input("timeEnableSwitch", "capability.switch", multiple: true, title: "Switches On", required: false)
			input("timeDisableSwitch", "capability.switch", multiple: true, title: "Switches Off", required: false)
			input("timeNotify", "boolean", title: "Notify", required: false)
		}		
	}
	page(name: "Reminders", title: "Reminders", install: true) {
		section("Feeding Reminder"){
			input("feedFreq", "enum", title: "Feed Days", description: "Days of the week to feed", multiple: true, required: false, options: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"])
			input("feedTime", "time", title: "Time to Feed", required: false)
			input("feedEnableSwitch", "capability.switch", multiple: true, title: "Switches On", required: false)
			input("feedNotify", "boolean", title: "Notify", required: false)
		}
		section("Cleaning Reminder"){
			input("cleaningFreq", "number", title: "Cleaning Frequency (days)", required: false)
			input("cleaningNotify", "boolean", title: "Notify", required: false)
		}

	}
}

/* Initialization */
def installed() {
    log.debug "Installed with settings: ${settings}"
    addChildDevice("chuck-pearce", "Aquarium Status", 'AquariumStatus', null, ["name": "Aquarium Status",  "completedSetup": true])
    addChildDevice("chuck-pearce", "Aquarium Switch", 'AquariumSwitch|1', null, ["name": "Aquarium Switch 1",  "completedSetup": true])
    addChildDevice("chuck-pearce", "Aquarium Switch", 'AquariumSwitch|2', null, ["name": "Aquarium Switch 2",  "completedSetup": true])
    addChildDevice("chuck-pearce", "Aquarium Switch", 'AquariumSwitch|3', null, ["name": "Aquarium Switch 3",  "completedSetup": true])
    addChildDevice("chuck-pearce", "Aquarium Switch", 'AquariumSwitch|4', null, ["name": "Aquarium Switch 4",  "completedSetup": true])
    addChildDevice("chuck-pearce", "Aquarium Switch", 'AquariumSwitch|5', null, ["name": "Aquarium Switch 5",  "completedSetup": true])
    addChildDevice("chuck-pearce", "Aquarium Switch", 'AquariumSwitch|6', null, ["name": "Aquarium Switch 6",  "completedSetup": true])
    addChildDevice("chuck-pearce", "Aquarium Switch", 'AquariumSwitch|7', null, ["name": "Aquarium Switch 7",  "completedSetup": true])
    addChildDevice("chuck-pearce", "Aquarium Switch", 'AquariumSwitch|8', null, ["name": "Aquarium Switch 8",  "completedSetup": true])

    initialize()
}

def uninstalled() {
	unschedule()
	unsubscribe()
	def deleteDevices = getAllChildDevices()
	deleteDevices.each { deleteChildDevice(it.deviceNetworkId) }
}	

def updated() { 
    log.debug "Updated with settings: ${settings}"

    initialize()
}

def initialize() { 

    log.debug "Calling initialize"
	unschedule()
	unsubscribe()
    schedule("0 0/" + ((settings.polling.toInteger() > 0 )? settings.polling.toInteger() : 1)  + " * * * ?", getStatus )
    subscriptions();

    if (cleaningNotify && cleaningFreq > 0) { 
	    if (!state.lastWaterChange) {
	    	state.lastWaterChange = new Date().time
	    }


	    waterChangeReminder()
	}

	if (feedFreq && feedTime) { 
		feedReminder()
	}
}

def disconnected () {
	def childDevice = getAllChildDevices()
	childDevice.each { 
		if (it.deviceNetworkId.toString() != "AquariumStatus") {
			it.updateDeviceStatus(2)
		}
	}
}

def feedReminder () {
	schedule(feedTime, feedChangeNotify)
}

def feedChangeNotify () {

	def dayCheck = feedFreq.contains(new Date().format("E"))
	if(dayCheck){
		if (feedNotify) {
			sendPush( "Aquarium needs feeding")
		}

		if (feedEnableSwitch) {
			feedEnableSwitch?.on()
		}
	}

	feedReminder();
}

def waterChangeReminder () {
	if (waterChangeReminder && cleaningFreq > 0) {
		def futureDate = (new Date(state.lastWaterChange) + cleaningFreq)
		runOnce(futureDate, waterChangeNotify)
	}
}

def waterChangeNotify () {
	sendPush( "Aquarium needs to be cleaned")
	state.lastWaterChange = new Date()
	waterChangeReminder()
}

def subscriptions () {

	def yesterday = new Date() - 1

	state.phNotifications = yesterday.time
	state.tempNotifications = yesterday.time
	state.timeNotifications = yesterday.time

	def child = getChildDevice("AquariumStatus");

	if (phBelow && phAbove ) {
		subscribe(child, "ph", phNotice)
	}

	if (tempBelow && tempAbove ) {
		subscribe(child, "temperature", tempNotice)
	}

	if (timeDiff) {
		subscribe(child, "aquariumTime", timeNotice)
	}
}

def phNotice (evt) {
	def newValue = evt.value.replace("\n", " ").replace("\r", "").replace("pH","").toBigDecimal()
	if (newValue < phBelow.toBigDecimal() || newValue > phAbove.toBigDecimal() ) {
		if (phNotify && checkNoticePeriod(state.phNotifications)) {
			if (newValue < phBelow.toBigDecimal() ) {
				sendPush( "Aquarium pH level below $phBelow at $evt.value")
				sendEvent(name: "AquaController Poller", value: "ph", display: true, descriptionText: "Aquarium pH level below $phBelow at $evt.value") 
			} else {
				sendPush( "Aquarium pH level above $phAbove at $evt.value")
				sendEvent(name: "AquaController Poller", value: "ph", display: true, descriptionText: "Aquarium pH level above $phAbove at $evt.value") 
			}			
		}
		if (phEnableSwitch) {
			phEnableSwitch?.on()
		}
		if (phDisableSwitch) {
			phEnableSwitch?.off()
		}
		state.phNotifications = new Date().time
	}
}

def tempNotice (evt) {
	if ((evt.value).toBigDecimal() < (tempBelow).toBigDecimal() || (evt.value).toBigDecimal() > (tempAbove).toBigDecimal() ) {
		if (tempNotify && checkNoticePeriod(state.tempNotifications)) {
			if ((evt.value).toBigDecimal() < (tempBelow).toBigDecimal() ) {
				sendPush( "Aquarium temperature below $tempBelow at $evt.value")
				sendEvent(name: "AquaController Poller", value: "temp", display: true, descriptionText: "Aquarium temperature below $tempBelow at $evt.value") 
			} else {
				sendPush( "Aquarium temperature above $tempAbove at $evt.value")
				sendEvent(name: "AquaController Poller", value: "temp", display: true, descriptionText: "Aquarium temperature above $tempAbove at $evt.value") 
			}			
		}
		if (tempEnableSwitch) {
			tempEnableSwitch?.on()
		}
		if (tempDisableSwitch) {
			tempDisableSwitch?.off()
		}
		state.tempNotifications = new Date().time
	}
}

def timeNotice (evt) {
	Date now = new Date()

	java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("M/d/yyyy H:m a")
	sdf.setTimeZone(location.timeZone)
	Date timeProcessed = sdf.parse( evt.value.replace("\n", " ").replace("\r", "") )

	def diffTime = (now.time - timeProcessed.time)
	def timeOffMin = ((diffTime / 1000) / 60)
	if ( timeOffMin > timeDiff) {
		if (timeNotify && checkNoticePeriod(state.timeNotifications) ) {
			def timeOffDisplay = Math.round(timeOffMin)
			sendPush( "Aquarium time is off by $timeOffDisplay minutes")
			sendEvent(name: "AquaController Poller", value: "time", display: true, descriptionText: "Aquarium time is off by $timeOffDisplay minutes") 
		}
		if (timeEnableSwitch) {
			timeEnableSwitch?.on()
		}
		if (timeDisableSwitch) {
			timeDisableSwitch?.off()
		}

		state.timeNotifications = new Date().time
	}
}

def checkNoticePeriod (time) {
	if (time) {
		Date now = new Date()
		def diff = (now.time - time)
		// Allow a notification every 12 hours
		if ( (diff / 1000) > (60 * 60 * 12) ) {
			return true
		} else {
			return false
		}
	} else {
		return true
	}
}

def toggleSwitch (child, status) {

	def switchName = state.switchNames[child.deviceNetworkId.split("\\|")[1].toInteger()]

	log.debug "Switch name is $switchName"
	def call = [
	    uri: "http://$username:$password@$server:$port",
	    path: "/AquaController/toggle",
	    headers: ["Content-Type": "text/json"],
	    query: [name: "s" + switchName, status: status.toString()]
	]

	
	try{
    	httpGet(call) { response ->      
        	
		}
	} catch(Exception e)
	{
		log.debug "___exception getting stats: " + e
		disconnected()
	}
    
}


def getStatus () {
	state.switchNames = []

	def call = [
	    uri: "http://$username:$password@$server:$port",
	    path: "/AquaController/status",
	    headers: ["Content-Type": "text/json"]
	]

	
	try{
    	httpGet(call) { response ->      
        
    		def childDevice = getAllChildDevices()

    		if (response.status == 500) {
    			disconnected()
    		}

			childDevice.each { 
            	try {
                	
					def sVal = it.deviceNetworkId.split("\\|")[1]

                    def childData = response.data["s" + sVal ]
					
					state.switchNames[sVal.toInteger()] = childData.label.toString()
                    
                    if (childData.status.toString() == "ON") {
                        it.updateDeviceStatus(1)
                    } else {
                        it.updateDeviceStatus(0)
                    }

                 	if (childData.mode == "Auto") {
                 		it.updateDeviceStatus(3)
                 	} else if (childData.mode == "Manual") {
                 		it.updateDeviceStatus(4)
                 	}
                  
                  	// Wrapped due to rouge switch that I do not have permission to access.
                  	
                  	try {
	                    if (it.name.toString() == "Aquarium Switch " + sVal) {
	                    	it.displayName = childData.label
	                    }
                 	} catch (Exception e) {

                 	}
                 	
                } catch (Exception e) {
                	
                }

                if (it.deviceNetworkId.toString() == "AquariumStatus") {
                	it.setTempPh(response.data.temp, response.data.ph, response.data.time, response.data.date)
                }
            	

			}
		}
	} catch(Exception e)
	{
		log.debug "___exception getting stats: " + e
		disconnected()
	}

}

def getChildZoneID(child) {
	return child.device.deviceNetworkId
}
