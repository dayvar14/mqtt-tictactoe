
var mqtt;
const RECONNECT_TIMEOUT = 2000;
const MQTT_HOST = "test.mosquitto.org";
const MQTT_PORT = 8081;
const MQTT_HOST_TOPIC = "/HOST";
const MQTT_GUEST_TOPIC = "/GUEST";
var TEST_ROOM = "TEST"

var isHost = false;
var roomID = "";
var myTurn = false;
var txTopic = "";
var rxTopic = "";

function createRoom() {
    document.getElementById("connect").style.visibility = "hidden";
    isHost = true;
    roomID = generateRoomID();
    MQTTconnect()
}

function joinRoom() {
    document.getElementById("connect").style.visibility = "hidden";
    isHost = false;
    roomID = document.getElementById("hostCode").value;
    MQTTconnect();
}

function generateRoomID() {
    return TEST_ROOM;
    /*return (Math.random() + 1).toString(36).substring(2, 6).toUpperCase();*/
}


function MQTTconnect() {
    mqtt = new Paho.MQTT.Client(MQTT_HOST, MQTT_PORT, "clientId");
    console.log("connecting to " + MQTT_HOST + ":" + MQTT_PORT);

    var options = {
        timeout: 3,
        onSuccess: onConnect,
        onFailure: onFailure
    };

    mqtt.onConnectionLost = onConnectionLost;
    mqtt.onMessageArrived = onMessageArrived;
    mqtt.connect(options);
}

// called when the client connects
function onConnect() {
    console.log("Connected");
    txTopic = roomID;
    rxTopic = roomID;

    //Sets the txTopic and rxTopic
    isHost ? txTopic += MQTT_GUEST_TOPIC : txTopic += MQTT_HOST_TOPIC;
    isHost ? rxTopic += MQTT_HOST_TOPIC : rxTopic += MQTT_GUEST_TOPIC;

    console.log("tx topic: " + txTopic);
    console.log("rx topic: " + rxTopic);

    mqtt.subscribe(rxTopic);
}
function onConnectionLost() {
    //Reset Game
}
// Client Fails to Connect
function onFailure() {
    console.log("Failed to connect");
}

function onMessageArrived(message) {
    var obj = JSON.parse(message.payloadString)
    console.log(obj)
}

function sendTurn(position) {
    if (mqtt) {
        var json = JSON.stringify(position);
        var message = new Paho.MQTT.Message(json);
        message.destinationName = txTopic;
        mqtt.send(message);
        console.log("Msg: " + json + " To topic: " + txTopic);
    }


}

