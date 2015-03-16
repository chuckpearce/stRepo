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
	section("Trigger When Enabled"){
		input("modeEnabled", "mode", title: "Mode", required: true)
		input("lightsEnabled", "capability.switch", title: "Lights On", required: false)
	}
	section("Return Trigger"){
		input(name: "delay", title: "Delay Before Returned", type: "int", description: "in minutes", defaultValue: "10", required: false )
		input(name: "contact", title: "Contact Detection", type: "capability.contactSensor", description: "Sensor to detect open/close two times", required: false )
	}
	section("Trigger When Enabled"){
		input("modeReturn", "mode", title: "Mode", required: true)
		input("lightsReturn", "capability.switch", title: "Lights Off", required: false)
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
	def deleteDevices = getAllChildDevices()
	deleteDevices.each { deleteChildDevice(it.deviceNetworkId) }
}	

def updated() { 
    log.debug "Updated with settings: ${settings}"
    initialize()
}

def initialize() { 

}

def enable() {
	send("$actionName, chaning mode to $modeEnabled")
	
	int closeCount = 0

	setLocationMode(modeEnabled)

	if (lightsEnabled) {
		lightsEnabled?.on()
	}

	if (delay) {
		runIn(60*delay, disable)
	}

	if (contact) {
		subscribe(contact, "contact.closed", doorClosed)
	}

}

def doorClosed () {
	doorClosed++
	if (doorClosed >= 2) {
		disable()
	}
}

def disable() {
	unschedule()
	unsubscribe()

	send("$actionName completed, chaning mode to $modeEnabled")
	
	child = getChildDevice("TakeOutDog");
	child.updateDeviceStatus(0)

	setLocationMode(modeReturn)

	if (lightsReturn) {
		lightsReturn?.off()
	}

}
