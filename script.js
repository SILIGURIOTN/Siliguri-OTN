/* ==========================================
   OTN SMART MONITORING V4
   SCRIPT.JS PART-1
========================================== */

// =========================
// ThingSpeak Configuration
// =========================

const channelID = "3432369";
const readAPI = "F46NRGKPEP0G0838";

const apiURL =
`https://api.thingspeak.com/channels/${channelID}/feeds/last.json?api_key=${readAPI}`;


// =========================
// Live Clock
// =========================

function updateClock(){

    const now = new Date();

    document.getElementById("clock").innerHTML =
        now.toLocaleDateString() + "<br>" +
        now.toLocaleTimeString();

}

setInterval(updateClock,1000);

updateClock();


// =========================
// Status Update Function
// =========================

function setStatus(id,value){

    const obj=document.getElementById(id);

    if(value=="1"){

        obj.innerHTML="🟢 ON";

        obj.classList.remove("off");

        obj.classList.add("on");

    }

    else{

        obj.innerHTML="🔴 OFF";

        obj.classList.remove("on");

        obj.classList.add("off");

    }

}


// =========================
// Load Latest Data
// =========================

async function loadData(){

try{

const response=await fetch(apiURL);

const data=await response.json();

console.log(data);


// PAC

setStatus("pac1",data.field1);
setStatus("pac2",data.field2);
setStatus("pac3",data.field3);
setStatus("pac4",data.field4);
setStatus("pac5",data.field5);


// DG

setStatus("dg1",data.field6);
setStatus("dg2",data.field7);


// EB

setStatus("eb",data.field8);


// Last Update

document.getElementById("lastUpdate").innerHTML =
"Last Update : " +
new Date(data.created_at).toLocaleString();


// Device Status

document.getElementById("deviceStatus").innerHTML =
"🟢 ONLINE";


// PAC Running Count

let pacRun=0;

if(data.field1=="1") pacRun++;
if(data.field2=="1") pacRun++;
if(data.field3=="1") pacRun++;
if(data.field4=="1") pacRun++;
if(data.field5=="1") pacRun++;

document.getElementById("pacRunning").innerHTML =
pacRun+" / 5";


// DG Running Count

let dgRun=0;

if(data.field6=="1") dgRun++;
if(data.field7=="1") dgRun++;

document.getElementById("dgRunning").innerHTML =
dgRun+" / 2";


// EB Summary

document.getElementById("ebSummary").innerHTML =
data.field8=="1" ? "AVAILABLE" : "FAIL";


document.getElementById("cloudStatus").innerHTML="CONNECTED";
document.getElementById("espStatus").innerHTML="ONLINE";

}

catch(error){

console.log(error);

document.getElementById("deviceStatus").innerHTML="🔴 OFFLINE";

document.getElementById("cloudStatus").innerHTML="OFFLINE";

document.getElementById("espStatus").innerHTML="OFFLINE";

}

}


// First Load

loadData();


// Auto Refresh Every 15 Seconds

setInterval(loadData,15000);
/* ==========================================
   OTN SMART MONITORING V4
   SCRIPT.JS PART-2
========================================== */

// =========================
// Create Chart
// =========================

const ctx = document.getElementById("equipmentChart").getContext("2d");

const equipmentChart = new Chart(ctx, {

    type: "line",

    data: {

        labels: [],

        datasets: [

            {
                label:"PAC1",
                data:[],
                borderColor:"#00ff00",
                tension:.3,
                fill:false
            },

            {
                label:"PAC2",
                data:[],
                borderColor:"#00bfff",
                tension:.3,
                fill:false
            },

            {
                label:"PAC3",
                data:[],
                borderColor:"#ffff00",
                tension:.3,
                fill:false
            },

            {
                label:"PAC4",
                data:[],
                borderColor:"#ff00ff",
                tension:.3,
                fill:false
            },

            {
                label:"PAC5",
                data:[],
                borderColor:"#ff8800",
                tension:.3,
                fill:false
            },

            {
                label:"DG1",
                data:[],
                borderColor:"#ff0000",
                tension:.3,
                fill:false
            },

            {
                label:"DG2",
                data:[],
                borderColor:"#ffffff",
                tension:.3,
                fill:false
            },

            {
                label:"EB",
                data:[],
                borderColor:"#00ffff",
                tension:.3,
                fill:false
            }

        ]

    },

    options:{

        responsive:true,

        maintainAspectRatio:false,

        interaction:{
            mode:"index",
            intersect:false
        },

        plugins:{
            legend:{
                labels:{
                    color:"#ffffff"
                }
            }
        },

        scales:{

            x:{
                ticks:{color:"#ffffff"},
                grid:{color:"#444"}
            },

            y:{
                min:0,
                max:1,
                ticks:{
                    stepSize:1,
                    color:"#ffffff"
                },
                grid:{color:"#444"}
            }

        }

    }

});


// =========================
// Graph Update
// =========================

async function updateGraph(){

    try{

        const response = await fetch(

`https://api.thingspeak.com/channels/${channelID}/feeds.json?api_key=${readAPI}&results=20`

        );

        const json = await response.json();

        equipmentChart.data.labels=[];

        equipmentChart.data.datasets.forEach(ds=>ds.data=[]);

        json.feeds.forEach(feed=>{

            equipmentChart.data.labels.push(

                new Date(feed.created_at).toLocaleTimeString()

            );

            equipmentChart.data.datasets[0].data.push(Number(feed.field1)||0);
            equipmentChart.data.datasets[1].data.push(Number(feed.field2)||0);
            equipmentChart.data.datasets[2].data.push(Number(feed.field3)||0);
            equipmentChart.data.datasets[3].data.push(Number(feed.field4)||0);
            equipmentChart.data.datasets[4].data.push(Number(feed.field5)||0);
            equipmentChart.data.datasets[5].data.push(Number(feed.field6)||0);
            equipmentChart.data.datasets[6].data.push(Number(feed.field7)||0);
            equipmentChart.data.datasets[7].data.push(Number(feed.field8)||0);

        });

        equipmentChart.update();

    }

    catch(err){

        console.log(err);

    }

}

updateGraph();

setInterval(updateGraph,15000);
/* ==========================================
   OTN SMART MONITORING V4
   SCRIPT.JS PART-3
========================================== */

// ===== Graph Animation =====

equipmentChart.options.animation = {

    duration:1200,

    easing:'easeInOutQuart'

};


// ===== Better Tooltips =====

equipmentChart.options.plugins.tooltip = {

    enabled:true,

    backgroundColor:"#111827",

    titleColor:"#00ff88",

    bodyColor:"#ffffff",

    borderColor:"#00ff88",

    borderWidth:1,

    displayColors:true

};


// ===== Better Legend =====

equipmentChart.options.plugins.legend = {

    position:"bottom",

    labels:{

        color:"#ffffff",

        boxWidth:15,

        padding:20

    }

};


// ===== Make Lines Thicker =====

equipmentChart.data.datasets.forEach(ds=>{

    ds.borderWidth=3;

    ds.pointRadius=2;

    ds.pointHoverRadius=6;

    ds.pointBackgroundColor=ds.borderColor;

    ds.pointBorderColor="#ffffff";

});


// ===== Auto Device Health =====

function checkDeviceHealth(){

    const last=document.getElementById("lastUpdate").innerText;

    const online=document.getElementById("deviceStatus");

    if(last.includes("--")){

        online.innerHTML="🔴 OFFLINE";

        online.style.color="#ff4444";

    }

    else{

        online.innerHTML="🟢 ONLINE";

        online.style.color="#00ff88";

    }

}

setInterval(checkDeviceHealth,5000);


// ===== Flash Effect for Running Equipment =====

setInterval(()=>{

    document.querySelectorAll(".status.on").forEach(item=>{

        item.style.boxShadow=

        "0 0 25px #00ff88";

    });

},1000);


// ===== Refresh Chart Style =====

equipmentChart.update();