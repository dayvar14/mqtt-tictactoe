
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
var clientID = generateClientID();
grid =
    [[0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]];


function createRoom() {
    document.getElementById("connect").style.visibility = "hidden";
    isHost = true;
    roomID = generateRoomID();
    myTurn = true;
    MQTTconnect()
}

function joinRoom() {
    document.getElementById("connect").style.visibility = "hidden";
    isHost = false;
    roomID = document.getElementById("hostCode").value;
    myTurn = false;
    MQTTconnect();
}

function generateRoomID() {
    return TEST_ROOM;
    /*return (Math.random() + 1).toString(36).substring(2, 6).toUpperCase();*/
}

function generateClientID() {
    return (Math.random() + 1).toString(36).substring(2, 6).toUpperCase();
}


function MQTTconnect() {
    mqtt = new Paho.MQTT.Client(MQTT_HOST, MQTT_PORT, clientID);
    console.log("connecting to " + MQTT_HOST + ":" + MQTT_PORT + "\nClient ID: " + clientID);

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
    if (!myTurn) {
        var position = JSON.parse(message.payloadString);
        document.getElementById(position.x + "x" + position.y).style.backgroundColor = "black";
        grid[position.y][position.x] = Options.vars.CIRCLE;
        console.log(position, grid);
        if (checkWin(position, Options.vars.CIRCLE))
            console.log("They Won!");
        myTurn = true;
    }
}

function sendTurn(position) {
    if (grid[position.y][position.x] == 0 && myTurn) {
        if (mqtt) {
            document.getElementById(position.x + "x" + position.y).style.backgroundColor = "blue";
            var json = JSON.stringify(position);
            var message = new Paho.MQTT.Message(json);
            message.destinationName = txTopic;
            mqtt.send(message);
            grid[position.y][position.x] = Options.vars.CROSS;
            console.log("Msg: " + json + " To topic: " + txTopic);
            console.log(grid);
            if (checkWin(position, Options.vars.CROSS))
                console.log("You Won!");
            myTurn = false;
        }


    }
    else {
        console.log("Cant Click that space")
    }


}

function checkWin(position, symbol) {
    lDiag = [];
    rDiag = [];
    ver = [];
    hor = [];

    for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid[i].length; j++) {
            if (i == position.y && grid[i][j] == symbol) {
                hor.push(grid[i][j]);
            }
            if (j == position.x && grid[i][j] == symbol) {
                ver.push(grid[i][j]);
            }

            if (i + j == position.y + position.x && grid[i][j] == symbol) {
                rDiag.push(grid[i][j]);
            }

            if (i - j == position.y - position.x && grid[i][j] == symbol) {
                lDiag.push(grid[i][j]);
            }
        }
    }

    return lDiag.length == 3 || rDiag.length == 3 || ver.length == 3 || hor.length == 3;

}

