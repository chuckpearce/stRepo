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
	    valueTile("ph", "device.ph", decoration: "flat") {
	        state("default", label:'${currentValue}')
		}
	    valueTile("aquariumTime", "device.aquariumTime", decoration: "flat") {
	        state("default", label:'${currentValue}')
		}
		standardTile("refresh", "device.refresh", inactiveLabel: false, decoration: "flat") {
			state("default", label:'', action:"refresh.refresh", icon:"st.secondary.refresh")
		}
		main (["temperature", "ph", "aquariumTime"])
		details(["temperature", "ph", "aquariumTime", "refresh"])
	}
}

def parse(String description) { log.debug "description $description" }

def refresh() {
	parent.getStatus()
}

def setTempPh (iTemp, iPh, time, date) {
	sendEvent(name:"temperature",value:iTemp, unit: "F", descriptionText: "Aquarium Temp at $iTemp")
	
	// Handle pH
	def formattedValue = iPh.toString()
	def dispValue = "${formattedValue}\npH"
    sendEvent(name: "ph", value: dispValue as String, unit: "", descriptionText: "Aquarium pH at ${formattedValue}")

    // Handle time
    formattedValue = date.toString()
	def displayTime = "$formattedValue\n$time"
    sendEvent(name: "aquariumTime", value: displayTime as String, unit: "", descriptionText: "Aquarium time is ${time}", display: false)

}

def poll() {}


def updateDeviceStatus(status) {

}
