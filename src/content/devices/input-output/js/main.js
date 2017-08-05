/*
*  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
*
*  Use of this source code is governed by a BSD-style license
*  that can be found in the LICENSE file in the root of the source
*  tree.
*/

// 'use strict';
var localVideo = document.getElementById("video");
var localCanvas = document.getElementById("canvas");
var fullscreen = document.getElementById("fullscreen");

fullscreen.addEventListener('click', function () {
    document.documentElement.webkitRequestFullScreen();
    fullscreen.style.visibility="hidden";
    document.getElementById("videoSelect").style.visibility="hidden";
}, false);


var videoElement = document.querySelector('video');
var videoSelect = document.querySelector('select#videoSource');
var selectors = [videoSelect];
function gotDevices(deviceInfos) {
  // Handles being called several times to update labels. Preserve values.
  var values = selectors.map(function(select) {
    return select.value;
  });
  selectors.forEach(function(select) {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });
  for (var i = 0; i !== deviceInfos.length; ++i) {
    var deviceInfo = deviceInfos[i];
    var option = document.createElement('option');
    option.value = deviceInfo.deviceId;
      if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
      videoSelect.appendChild(option);
    } else {
      // console.log('Some other kind of source/device: ', deviceInfo);
    }
  }
  selectors.forEach(function(select, selectorIndex) {
    if (Array.prototype.slice.call(select.childNodes).some(function(n) {
      return n.value === values[selectorIndex];
    })) {
      select.value = values[selectorIndex];
    }
  });
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

function gotStream(stream) {
  window.stream = stream; // make stream available to console
  videoElement.srcObject = stream;
  localVideo.style.opacity = 1;
    //trace("User has granted access to local media. url = " + url);
    setTimeout(poll, 2000);
  // Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices();
}

function start() {
  if (window.stream) {
    window.stream.getTracks().forEach(function(track) {
      track.stop();
    });
  }
  var videoSource = videoSelect.value;
  var constraints = {
    video: {deviceId: videoSource ? {exact: videoSource} : undefined}
  };
  navigator.mediaDevices.getUserMedia(constraints).
      then(gotStream).then(gotDevices).catch(handleError);
}

videoSelect.onchange = start;

   initialize = function() {
      try {
        // navigator.getUserMedia({video:true}, onGotStream, onFailedStream);
       start();
       console.log("I success");
    //trace("Requested access to local media");
  } catch (e) {
    alert("getUserMedia error " + e);
    console.log("I fail");
    //trace_e(e, "getUserMedia error");
  }
  }

    poll = function() {
      console.log("i'm in poll");
    var w = localVideo.videoWidth;
    var h = localVideo.videoHeight;
    var canvas = document.createElement('canvas');
    canvas.width  = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(localVideo, 0, 0, w, h);
    var comp = ccv.detect_objects({ "canvas" : ccv.grayscale(canvas),
                                  "cascade" : cascade,
                                  "interval" : 5,
                                  "min_neighbors" : 1 });
    /* draw detected area */
    localCanvas.width = localVideo.clientWidth;
    localCanvas.height = localVideo.clientHeight;

    var ctx2 = localCanvas.getContext('2d');
    ctx2.lineWidth = 2;
    ctx2.lineJoin = "round";
    ctx2.clearRect (0, 0, localCanvas.width,localCanvas.height);

    var x_offset = 0, y_offset = 0, x_scale = 1, y_scale = 1;
    if (localVideo.clientWidth * localVideo.videoHeight > localVideo.videoWidth * localVideo.clientHeight) {
      x_offset = (localVideo.clientWidth - localVideo.clientHeight *
                  localVideo.videoWidth / localVideo.videoHeight) / 2;
    } else {
      y_offset = (localVideo.clientHeight - localVideo.clientWidth *
                  localVideo.videoHeight / localVideo.videoWidth) / 2;
    }
    x_scale = (localVideo.clientWidth - x_offset * 2) / localVideo.videoWidth;
    y_scale = (localVideo.clientHeight - y_offset * 2) / localVideo.videoHeight;

    for (var i = 0; i < comp.length; i++) {
      comp[i].x = comp[i].x * x_scale + x_offset;
      comp[i].y = comp[i].y * y_scale + y_offset;
      comp[i].width = comp[i].width * x_scale;
      comp[i].height = comp[i].height * y_scale;

      var opacity = 0.1;
      if (comp[i].confidence > 0) {
        opacity += comp[i].confidence / 10;
        if (opacity > 1.0) opacity = 1.0;
      }

      //ctx2.strokeStyle = "rgba(255,0,0," + opacity * 255 + ")";
      ctx2.lineWidth = opacity * 10;
      ctx2.strokeStyle = "rgb(255,0,0)";
      var img = new Image();
      img.src="melon.png";
      ctx2.drawImage(img,comp[i].x-(comp[i].width*0.2), comp[i].y-(comp[i].height*0.2), comp[i].width*1.5, comp[i].height*1.5);
      // ctx2.strokeRect(comp[i].x, comp[i].y, comp[i].width, comp[i].height);
    }
    setTimeout(poll, 1000);
  }


  setTimeout(initialize, 1);

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}