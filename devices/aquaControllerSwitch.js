/**
 *	AquaController Switch SmartDevice Type
 *
 *	Author: Chuck Pearce
 *	Date: 2015-03-17
 *
 ***************************
 *
 *
 */
metadata {
	definition (name: "Aquarium Switch", namespace: "chuck-pearce", author: "Chuck Pearce") {
		capability "Refresh"
		capability "Polling"
		capability "Switch"
        command "auto"
        attribute "modeSwitch", "string"
	}

	simulator {	}

	tiles {
		standardTile("switch", "device.switch", width: 2, height: 2, canChangeIcon: true) {
			state("off", label: 'Off', action: "switch.on", icon: "st.Outdoor.outdoor12-icn", backgroundColor: "#ffffff", nextState: "on")
			state("on", label: 'On', action: "switch.off", icon: "st.Outdoor.outdoor12-icn", backgroundColor: "#79b821", nextState: "off")
			state("offline", label: 'Offline', icon: "st.Outdoor.outdoor12-icn", backgroundColor: "#ff0000")
		}
		standardTile("modeSwitch", "device.modeSwitch", canChangeIcon: true) {
			state("manual", label: 'Manual', icon: "st.switches.switch.off", backgroundColor: "#e6e035", nextState: "auto")
			state("auto", label: 'Auto', action: "auto", icon: "st.switches.switch.on", backgroundColor: "#79b821")
		}
		standardTile("refresh", "device.refresh", inactiveLabel: false, decoration: "flat") {
			state("default", label:'', action:"refresh.refresh", icon:"st.secondary.refresh")
		}
		main "switch"
		details(["switch", "modeSwitch", "refresh"])
	}
}

def parse(String description) { }

def on() {
	updateDeviceStatus(1)
	parent.toggleSwitch(this, "on")
}
def off() {
	updateDeviceStatus(0)
	parent.toggleSwitch(this, "off")
}

def auto() {
	updateDeviceStatus(3)
	parent.toggleSwitch(this, "auto")
}

def refresh() {
	parent.getStatus()
}

def poll() {

}

def updateDeviceStatus(status) {
	if (status == 0) { 
		sendEvent(name: "switch", value: "off", display: true, descriptionText: device.displayName + " is off") 
	}   
	if (status == 1) {
		sendEvent(name: "switch", value: "on", display: true, descriptionText: device.displayName + " is on") 
	} 
	if (status == 2) {
		sendEvent(name: "switch", value: "offline", display: true, descriptionText: device.displayName + " is offline") 
	}
	if (status == 3) {
		sendEvent(name: "modeSwitch", value: "auto", display: true, descriptionText: device.displayName + " is in auto mode") 
	}
	if (status == 4) {
		sendEvent(name: "modeSwitch", value: "manual", display: true, descriptionText: device.displayName + " is manual mode") 
	}
}
