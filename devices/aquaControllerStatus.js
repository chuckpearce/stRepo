/**
 *	AquaController Status SmartDevice Type
 *
 *	Author: Chuck Pearce
 *	Date: 2015-03-15
 *
 ***************************
 */

metadata {
	definition (name: "Aquarium Status", namespace: "chuck-pearce", author: "Chuck Pearce") {
		capability "Refresh"
		capability "Sensor"
		capability "Switch"
		capability "Temperature Measurement"
        attribute "aquariumTime", "string"
        attribute "ph", "string"
        attribute "temperature", "string"
	}

	simulator {	}

	tiles {
	    valueTile("temperature", "device.temperature") {
	        state("default", label:'${currentValue}°',
	            backgroundColors:[
	                [value: 70, color: "#153591"],
	                [value: 74, color: "#1e9cbb"],
	                [value: 76, color: "#90d2a7"],
	                [value: 77, color: "#44b621"],
	                [value: 82, color: "#f1d801"],
	                [value: 85, color: "#d04e00"],
	                [value: 87, color: "#bc2323"]
	            ]
	        )
		}
	    valueTile("ph", "device.ph") {
	        state("default", label:'${currentValue}',
            	backgroundColors:[
	                [value: 7, color: "#153591"],
	                [value: 7.40, color: "#1e9cbb"],
	                [value: 7.80, color: "#90d2a7"],
	                [value: 8.00, color: "#44b621"],
	                [value: 8.30, color: "#f1d801"],
	                [value: 8.50, color: "#d04e00"],
	                [value: 9.00, color: "#bc2323"]
	            ]
            )
		}
		standardTile("feed", "device.feed", canChangeIcon: true) {
			state("off", label:'', action: "on", icon: "st.Food & Dining.dining4-icn", backgroundColor: "#ffffff", nextState: "on")
			state("on", label:'', action: "off", icon: "st.Food & Dining.dining4-icn", backgroundColor: "#79b821", nextState: "off")
			state("offline", label:'', icon: "st.Food & Dining.dining4-icn", backgroundColor: "#ff0000", nextState: "off")
		}
	    valueTile("aquariumTime", "device.aquariumTime", decoration: "flat") {
	        state("default", label:'${currentValue}')
		}
		standardTile("refresh", "device.refresh", inactiveLabel: false, decoration: "flat") {
			state("default", label:'', action:"refresh.refresh", icon:"st.secondary.refresh")
		}
		main (["temperature", "ph", "aquariumTime"])
		details(["temperature", "ph", "feed", "aquariumTime", "refresh"])
	}
}

def parse(String description) { log.debug "description $description" }


def refresh() {
    parent.getStatus()
}

def setTempPh (iTemp, iPh, time, date) {
	sendEvent(name:"temperature",value:iTemp, unit: "F", descriptionText: "Aquarium Temp at $iTemp")
	
    sendEvent(name: "ph", value: iPh, unit: "", descriptionText: "Aquarium pH at $iPh")

    // Handle time
    def formattedValue = date.toString()
	def displayTime = "$formattedValue\n$time"
    sendEvent(name: "aquariumTime", value: displayTime as String, unit: "", descriptionText: "Aquarium time is ${time}", display: false)

}

def poll() {}

def on() {
	// Turn off Defined switches
	sendEvent(name: "feed", value: "on", display: true, descriptionText: "Tank has entered feed mode")
    
    // switches that should turn off when feed cycle is started
    def feedSwitches = [4, 5, 6, 7, 8]
    // duration switches should be off before being automatically turned back on (minutes).
    def feedTime = 45
    
    for (int i = 0; i < feedSwitches.size(); i++) {
        parent.toggleSwitchId( feedSwitches[i],"off")
	}
    
    runIn(60*feedTime, off)
}

def off() {    
	sendEvent(name: "feed", value: "off", display: true, descriptionText: "Tank has ended feed mode") 
    
	unschedule()
    
    def feedSwitches = [4, 5, 6, 7, 8]
    
    for (int i = 0; i < feedSwitches.size(); i++) {
        parent.toggleSwitchId( feedSwitches[i],"auto")
	}
}

def updateDeviceStatus(status) {

}
