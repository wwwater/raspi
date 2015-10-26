
// set default values

document.getElementById("input-repeat").value = "1";
document.getElementById("time-until-zzz").value = "84 min";
document.getElementById("time-wakeup").value = "7:07";
document.getElementById("ruler-volume-left").width = "180px";
var timeToGetSong = 0;
var pageIsHidden = false;
setInterval(clock, 1000);
getPlaylists();

function sleep() {
    var time = document.getElementById("time-until-zzz").value;
    var minutes = time.split(" ")[0];
    var remains = parseInt(minutes) || 77;
    var wakeup = document.getElementById("time-wakeup").value || "7:03";
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

function changeVolume(e) {
    var offsetLeft = e.layerX;
    var volume = Math.round(offsetLeft / 360 * 100); // in per cent
    console.log("New volume is " + volume + "%");
    httpRequest("post", "playback/volume/" + volume, handleSuccessPlayback);
    setVolume(volume);
}

function getCurrentSong() {
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
    console.log("server response: ", responseText);
    var json = JSON.parse(responseText);
    var current = json["song"].split(" - ");
    var volume = json["volume"];
    document.getElementById("current-artist").value = current[0]; 
    document.getElementById("current-song").value = current[1]; 
    setVolume(volume);
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

function setVolume(value) {
    var width = Math.round(value / 100 * 360);
    document.getElementById("ruler-volume-left").width = width + "px";
}

function getPlaylists() {
    httpRequest("get", "playlists", populatePlaylists);
}

function populatePlaylists(response) {
    var element_playlists = document.getElementById("playlists-dropdown");
    var playlists = JSON.parse(response);
    // console.log("playlists", playists);
    for (var i in playlists) {
        var playlist = playlists[i];
        //console.log("playlist", playlist);
        var element = document.createElement("li");
        element.textContent = playlist;
        element.className = "li-playlist";
        element.value = i;
        element_playlists.appendChild(element);
    }

}
function selectPlaylist(e) {
    var playlist = e.target.textContent;
    console.log("selected playlist", playlist);
    httpRequest("post", "playlist/" + playlist, handleSuccessPlayback);
}
