/**
 *	Rain8Net Sprinkler Zone
 *
 *	Author: Chuck Pearce
 *	Date: 2015-03-19
 *
 */
metadata {
	definition (name: "Rain8Net: Sprinkler Zone", namespace: "chuck-pearce", author: "Chuck Pearce") {
		capability "Refresh"
		capability "Polling"
		capability "Switch"
	}

	simulator {	}

	tiles {
		standardTile("switch", "device.switch", width: 2, height: 2, canChangeIcon: true) {
			state("off", label: 'Off', action: "switch.on", icon: "st.Outdoor.outdoor12-icn", backgroundColor: "#ffffff", nextState: "on")
			state("on", label: 'On', action: "switch.off", icon: "st.Outdoor.outdoor12-icn", backgroundColor: "#79b821", nextState: "off")
			state("offline", label: 'Offline', icon: "st.Outdoor.outdoor12-icn", backgroundColor: "#ff0000")
			state("scheduled", label: 'Scheduled', icon: "st.Outdoor.outdoor12-icn", backgroundColor: "#945d10")
			state("paused", label: 'Paused', icon: "st.Outdoor.outdoor12-icn", backgroundColor: "#ffa600", nextState: "off")
		}
		standardTile("refresh", "device.refresh", inactiveLabel: false, decoration: "flat") {
			state("default", label:'', action:"refresh.refresh", icon:"st.secondary.refresh")
		}
		main "switch"
		details(["switch", "refresh"])
	}
}

def parse(String description) { }

def on() {
	parent.toggleZoneStatus(this, "true")
	updateDeviceStatus(1)
}
def off() {
	parent.toggleZoneStatus(this, "false")
	updateDeviceStatus(0)
	parent.clearPause()
}

def refresh() {
	parent.getZoneStatus()
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
		sendEvent(name: "switch", value: "scheduled", display: false) 
	}
	if (status == 4) {
		sendEvent(name: "switch", value: "paused", display: false) 
	}
}
