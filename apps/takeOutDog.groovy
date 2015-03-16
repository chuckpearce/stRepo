/**
 *	Take Out Dog
 * 
 *  Author: Chuck Pearce
 *  Date: 2015-03-10
 * 
 * Items under "trigger when enabled" will occur when the "Take out dog" switch is triggered.
 * Items under "return trigger" determine what causes the switch to automatically turn off. If you select both a delay and contact then the delay time will be used as a failsafe.
 * For example, if you set the delay to 10, then after 10 minutes even if the contact is not tripped 2x the system will execute the return procedure.
 * Items under "trigger when returned" will occur when the trigger is executed.
 */

definition(
	name: "Take out Dog",
	namespace: "chuck-pearce",
	author: "Chuck Pearce",
	description: "Used to execute a mode or hello home, dekay or wait for a door sensor 2x then change mode or hello home",
	category: "Convenience",
	iconUrl:   "http://i.imgur.com/kztKxez.png",
	iconX2Url: "http://i.imgur.com/kztKxez.png",
	iconX3Url: "http://i.imgur.com/kztKxez.png"
)

preferences {
	section("Auto Trigger When"){
		input("lock", "capability.lock", title: "Lock", required: false)
		input("timeStart", "time", title: "Time Start", required: false)
		input("timeEnd", "time", title: "Time End", required: false)
		input("modes", "mode", multiple: true, title: "Modes", required: false)
	}
	section("Trigger When Enabled"){
		input("modeEnabled", "mode", title: "Mode", required: true)
		input("lightsEnabled", "capability.switch", multiple: true, title: "Lights On", required: false)
	}
	section("Return Trigger"){
		input(name: "delay", title: "Delay Before Returned", type: "int", description: "in minutes", defaultValue: "10", required: false )
		input(name: "contact", title: "Contact Detection", type: "capability.contactSensor", description: "Sensor to detect open/close two times", required: false )
	}
	section("Trigger When Enabled"){
		input("modeReturn", "mode", title: "Mode", required: true)
		input("lightsReturn", "capability.switch", multiple: true, title: "Lights Off", required: false)
	}
	section("General"){
		input("actionName", "text", title: "Action Name", required: false, description: "Name used to reference this action", defaultValue: "Taking out the dog")
	}
}
/* Initialization */
def installed() {
    log.debug "Installed with settings: ${settings}"
    addChildDevice("chuck-pearce", "Take out Dog", 'TakeOutDog', null, ["name": "Take Out Dog",  "completedSetup": true])

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
	if (lock) {
		subscribe(lock, "lock", startTakeOut)
	}
}

private getTimeOk() {
	def result = true
	if (timeStart && timeEnd) {
		def currTime = now()
		def start = timeToday(timeStart).time
		def stop = timeToday(timeEnd).time
		result = start < stop ? currTime >= start && currTime <= stop : currTime <= stop || currTime >= start
	}
	log.trace "timeOk = $result"
	result
}

private getModeOk() {
	def result = !modes || modes.contains(location.mode)
	log.trace "modeOk = $result"
	result
}

def startTakeOut(lock) {
	
	if (lock && lock.value != "unlocked") {
		return
	}

	int closeCount = 0

	if (lightsEnabled) {
		lightsEnabled?.on()
	}

	if (delay) {
		runIn(60*delay.toInteger(), endTakeOut)
	}

	if (contact) {
		subscribe(contact, "contact.closed", doorClosed)
	}

	setLocationMode(modeEnabled)

}

def doorClosed () {
	closeCount++
	if (closeCount >= 2) {
		endTakeOut()
	}
}

def endTakeOut() {
	unschedule()
	unsubscribe()
    
	def child = getChildDevice("TakeOutDog");
	child.updateDeviceStatus(0)

	setLocationMode(modeReturn)

	if (lightsReturn) {
		lightsReturn?.off()
	}

}
