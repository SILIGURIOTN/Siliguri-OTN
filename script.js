/* ==========================================
   SILIGURI OTN
   STEP 4A
   Live Time + ThingSpeak Connection
========================================== */

const CHANNEL_ID = "3432369";

const API_URL =
"https://api.thingspeak.com/channels/3432369/feeds.json?results=8000";

//-------------------------------------
// Live Date & Time
//-------------------------------------

function updateDateTime(){

    const now = new Date();

    document.getElementById("liveDate").innerHTML =
    now.toLocaleDateString("en-GB",{
        day:"2-digit",
        month:"short",
        year:"numeric"
    });

    document.getElementById("liveTime").innerHTML =
    now.toLocaleTimeString();

}

setInterval(updateDateTime,1000);

updateDateTime();

//-------------------------------------
// Read ThingSpeak
//-------------------------------------

async function readThingSpeak(){

try{

const response = await fetch(API_URL);

const data = await response.json();
const feeds = data.feeds;

const dg1Hours = calculateRunningHours(feeds,"field6");
const dg2Hours = calculateRunningHours(feeds,"field7");

document.getElementById("dg1Hours").innerHTML = dg1Hours + " hrs";
document.getElementById("dg2Hours").innerHTML = dg2Hours + " hrs";
const latest = feeds[feeds.length - 1];

updateEquipment(latest);

checkOnline(latest.created_at);

}catch(e){

showOffline();

console.log(e);

}

}

setInterval(readThingSpeak,15000);

readThingSpeak();
/* ==========================================
   STEP 4B
   LED STATUS UPDATE
========================================== */

function setLED(ledId, statusId, value){

    const led = document.getElementById(ledId);
    const txt = document.getElementById(statusId);

    if(Number(value) === 1){

        led.classList.remove("ledOff");
        led.classList.add("ledOn");

        txt.innerHTML = "ON";
        txt.style.fill = "#00b050";

    }else{

        led.classList.remove("ledOn");
        led.classList.add("ledOff");

        txt.innerHTML = "OFF";
        txt.style.fill = "#d32f2f";

    }

}
/* ==========================================
   SMPS / UPS STATUS
========================================== */

function updateBackupSystem(data){

    // Power Available = EB অথবা DG1 অথবা DG2
    const powerAvailable =
        Number(data.field8) === 1 ||
        Number(data.field6) === 1 ||
        Number(data.field7) === 1;

    const systems = [
        {led:"ledSMPS1", txt:"smps1Status", line:"lineSMPS1"},
        {led:"ledSMPS2", txt:"smps2Status", line:"lineSMPS2"},
        {led:"ledUPS1",  txt:"ups1Status",  line:"lineUPS1"},
        {led:"ledUPS2",  txt:"ups2Status",  line:"lineUPS2"}
    ];

    systems.forEach(item=>{

        const led = document.getElementById(item.led);
        const txt = document.getElementById(item.txt);

        if(powerAvailable){

            led.classList.remove("ledBattery","batteryBlink","ledOff");
            led.classList.add("ledOn");

            txt.innerHTML="ONLINE";
            txt.classList.remove("statusBattery");
            txt.classList.add("statusOnline");

            powerLine(item.line,1);

        }else{

            led.classList.remove("ledOn","ledOff");
            led.classList.add("ledBattery","batteryBlink");

            txt.innerHTML="ON BATTERY";
            txt.classList.remove("statusOnline");
            txt.classList.add("statusBattery");

            powerLine(item.line,0);

        }

    });


}

/* ==========================================
   UPDATE ALL EQUIPMENT
========================================== */

function updateEquipment(data){

    // PAC
    setLED("ledPAC1","pac1Status",data.field1);
    setLED("ledPAC2","pac2Status",data.field2);
    setLED("ledPAC3","pac3Status",data.field3);
    setLED("ledPAC4","pac4Status",data.field4);
    setLED("ledPAC5","pac5Status",data.field5);

    // DG
    setLED("ledDG1","dg1Status",data.field6);
    setLED("ledDG2","dg2Status",data.field7);

// EB
setLED("ledEB","ebStatus",data.field8);

// Power Flow
updatePowerFlow(data);

// SMPS / UPS
updateBackupSystem(data);
}
/* ==========================================
   STEP 4C
   ONLINE / OFFLINE + POWER FLOW
========================================== */

function checkOnline(lastUpdate){

    const last = new Date(lastUpdate);
    const now = new Date();

    const diff = (now - last) / 1000;

    const status = document.getElementById("status");

    if(diff <= 300){  

        status.innerHTML = "🟢 ONLINE";
        status.style.background = "#00b050";

    }else{

        status.innerHTML = "🔴 OFFLINE";
        status.style.background = "#d32f2f";

    }

}

function showOffline(){

    const status = document.getElementById("status");

    status.innerHTML = "🔴 OFFLINE";
    status.style.background = "#d32f2f";

}

/* ==========================================
   POWER FLOW
========================================== */

function powerLine(lineId, state){

    const line = document.getElementById(lineId);

    if(!line) return;

    if(Number(state) === 1){

        line.classList.add("powerOn");
        line.classList.add("flow");

    }else{

        line.classList.remove("powerOn");
        line.classList.remove("flow");

    }

}

/* ==========================================
   UPDATE POWER FLOW
========================================== */
function updatePowerFlow(data){

    // EB
    powerLine("lineEB", data.field8);

    // DG
    powerLine("lineDG1", data.field6);
    powerLine("lineDG2", data.field7);

    // PAC
    powerLine("linePAC1", data.field1);
    powerLine("linePAC2", data.field2);
    powerLine("linePAC3", data.field3);
    powerLine("linePAC4", data.field4);
    powerLine("linePAC5", data.field5);

    // Power Source
    const source =
        Number(data.field8)==1 ||
        Number(data.field6)==1 ||
        Number(data.field7)==1;

    // SMPS / UPS
    powerLine("lineSMPS1", source);
    powerLine("lineSMPS2", source);
    powerLine("lineUPS1", source);
    powerLine("lineUPS2", source);

}
/* ==========================================
   CALCULATE DG RUNNING HOURS
========================================== */

function calculateRunningHours(feeds, field){

    let hours = 0;

    for(let i = 0; i < feeds.length - 1; i++){

        if(Number(feeds[i][field]) === 1){

            const t1 = new Date(feeds[i].created_at);
            const t2 = new Date(feeds[i + 1].created_at);

            hours += (t2 - t1) / 3600000;

        }

    }

    return hours.toFixed(1);

}
