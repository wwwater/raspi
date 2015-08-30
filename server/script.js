
// set default values

document.getElementById("input-repeat").value = "1";
document.getElementById("time-until-zzz").value = "80 min";
document.getElementById("time-wakeup").value = "6:37";
var timeToGetSong = 0;
var pageIsHidden = false;
setInterval(clock, 1000);

function sleep() {
    var time = document.getElementById("time-until-zzz").value;
    var minutes = time.split(" ")[0];
    var remains = parseInt(minutes) || 77;
    var wakeup = document.getElementById("time-wakeup").value || "6:27";
    httpRequest("post", "sleep/" + remains + "/" + wakeup);

}

function pause() {
    httpRequest("post", "playback/pause", handleSuccessPlayback);
}

function next() {
    httpRequest("post", "playback/next", handleSuccessPlayback)
}

function repeat() {
    var value = parseInt(document.getElementById("input-repeat").value) || 1;
}

function getCurrentSong() {
    //if (!document["hidden"]) {
    httpRequest("get", "/current", handleSuccessPlayback);
}

function clock() {
    if (pageIsHidden && !document["hidden"]){
        timeToGetSong = 0;
    }

    if (timeToGetSong <= 0) {
        timeToGetSong = 600;
        getCurrentSong();
    }
    timeToGetSong -= 1;
    pageIsHidden = document["hidden"];
}

function handleSuccessPlayback(responseText) {
    // console.log("server response: ", responseText);
    var json = JSON.parse(responseText);
    var current = json["song"].split(" - ");
    document.getElementById("current-artist").value = current[0]; 
    document.getElementById("current-song").value = current[1]; 
    var secondsRemain = json["secondsRemain"];
    timeToGetSong = secondsRemain + 2;
}

function httpRequest(type, url, onSuccess) {
    var request = new XMLHttpRequest();
    request.open(type, url, true);
    request.send();
    if (onSuccess) {
        request.onload = function() {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    onSuccess(request.responseText);
                }
            }
        }
    }
}
