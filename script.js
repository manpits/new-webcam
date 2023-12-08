// Codes created by nyoman piarsa
// July 17, 2023
//
'use strict';

const videoElement = document.querySelector("video#stream");
const selectSource = document.querySelector("select#videoSource");
const buttonCamera = document.querySelector("button#opencam");
const buttonCapture = document.querySelector("button#capture");
const buttonRecord = document.querySelector("button#record");
const buttonServerFile = document.querySelector("button#serverfile");
const canvasElement = document.querySelector("canvas#image");
const captureElement = document.querySelector("div#captureImage");
const controlsElement = document.querySelector("div#controls");
const streamControl = document.querySelector("div#streamControl");
//
controlsElement.style.textAlign = 'center';
streamControl.style.textAlign = 'center';
videoElement.style.width = '300px';
//
buttonCamera.disabled = true;
buttonCapture.disabled = true;
buttonRecord.disabled = true;
//
let onRecord = false;
let onCamera = false;
//
let videoRecorder;
//
navigator.mediaDevices.getUserMedia({video: true}).then((stream)=>{
    window.stream = stream;
    if(window.stream){
        window.stream.getTracks().forEach(track => {
            track.stop();
        });
    }
    window.stream = null;
    selectSource.hidden = false;
    navigator.mediaDevices.enumerateDevices().then((devices)=>{
        for (let i = 0; i !== devices.length; ++i) {
            const device = devices[i];
            if(device.kind === 'videoinput'){
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label;
                selectSource.appendChild(option);
            }else{
                // console.log(device);
            }
        }
        if(selectSource.length == 0){
            const option = document.createElement('option');
            option.value = 0;
            option.text = "No webcam detected !";
            option.disabled = true;
            selectSource.appendChild(option);
        }else{
            buttonCamera.disabled = false;
        }
    }).catch(handleError);
}).catch(handleError);

function handleError(error){
    console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

buttonCamera.addEventListener("click",()=>{
    if(window.stream){
        if(onRecord){
            buttonRecord.click();
            onRecord = false;
        }
        window.stream.getTracks().forEach(track => {
            track.stop();
        });
    }
    //
    if(buttonCamera.innerHTML === 'Open Camera'){
        const constraints = {
            video: {
                deviceId: {exact : selectSource.value}
            },
            audio: { echoCancellation: true },
        };
        //
        navigator.mediaDevices.getUserMedia(constraints).then((stream)=>{
            window.stream = stream;
            videoElement.srcObject = stream;
            videoElement.muted = true;
            videoElement.hidden = false;
            selectSource.disabled = true;
            buttonCamera.innerHTML = 'Close Camera';
            buttonCapture.disabled = false;
            buttonRecord.disabled = false;
            onCamera = true;
        }).catch(handleError);
    }else{
        buttonCamera.innerHTML = 'Open Camera';
        videoElement.hidden = true;
        selectSource.disabled = false;
        buttonCapture.disabled = true;
        buttonRecord.disabled = true;
        onCamera = false;
    }
});

buttonCapture.addEventListener('click',()=>{
    window.stream.getTracks().forEach(track => {
        if(track.kind == 'video'){
            canvasElement.width = track.getSettings().width;
            canvasElement.height = track.getSettings().height;
            console.log('video track');
        }else{
            console.log('audio track');
        }
    });    
    //
    canvasElement.getContext('2d').drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    //
    var img = new Image();
    img.src		= canvasElement.toDataURL( "image/jpeg" );
    console.log(canvasElement.width);
    img.width = 250;
    // save-to-server
    buttonCapture.disabled = true;
    fetch('uploader.php', {
        method: 'POST',
        mode: "no-cors",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: img.src
    }).then(response => response.text())
        .then(success => {
            console.log(success);
            //show-on-page
            const divImage = document.createElement('div');
            divImage.setAttribute('style','padding: 3px; display: inline-block; ');
            divImage.appendChild(img);
            const divText = document.createElement('div');
            // divText.setAttribute('style','background-color:#000000');
            divText.innerHTML = `<a hreft="javascript:" onclick="window.open('${success}','_blank')">Open</a>`;
            divImage.appendChild(divText);
            captureElement.appendChild(divImage);
            captureElement.setAttribute('style','display:table;');
            captureElement.style.textAlign = 'center';
            onCamera ? buttonCapture.disabled = false : buttonCapture.disabled = true;
        })
        .catch(error => {
            console.log(error)
            onCamera ? buttonCapture.disabled = false : buttonCapture.disabled = true;
        });
});

buttonRecord.addEventListener('click',()=>{
    if(buttonRecord.innerHTML=='Record Video'){
        const blobContainer = [];
        //
        videoRecorder = new MediaRecorder(window.stream);
        videoRecorder.start();
        onRecord = true;
        //
        videoRecorder.ondataavailable = function(e){
            blobContainer.push(e.data);
        }
        //
        videoRecorder.onerror = function(e){
            return console.log(e.error);
        }
        //
        videoRecorder.onstop = function(e){
            onRecord = false;
            var newVideoElement = document.createElement('video');
            let recorderUrl = window.URL.createObjectURL(new Blob(blobContainer));
            newVideoElement.width = 250;
            newVideoElement.autoplay = false;
            newVideoElement.controls = true;
            newVideoElement.innerHTML = `<source src="${recorderUrl}" type="video/mp4">`;
            //save-to-server
            buttonRecord.disabled = true;
            var formdata = new FormData();
            formdata.append('videoFile', new Blob(blobContainer));
            fetch('uploader.php', {
                method: 'POST',
                body: formdata
            }).then(response => response.text())
                .then(success => {
                    console.log(success)
                    const divVideo = document.createElement('div');
                    divVideo.setAttribute('style','padding: 3px; display: inline-block; ');
                    divVideo.appendChild(newVideoElement);
                    const divText = document.createElement('div');
                    divText.innerHTML = `<a hreft="javascript:" onclick="window.open('${success}','_blank')">Play</a>`;
                    divVideo.appendChild(divText);
                    //show-on-page
                    captureElement.appendChild(divVideo);
                    captureElement.setAttribute('style','display:table;');
                    captureElement.style.textAlign = 'center';
                    onCamera ? buttonRecord.disabled = false : buttonRecord.disabled = true;
                })
                .catch(error => {
                    console.log(error)
                    onCamera ? buttonRecord.disabled = false : buttonRecord.disabled = true;
                });
        }
        //
        buttonRecord.innerHTML = 'Stop Record Video';
    }else{
        videoRecorder.stop();
        buttonRecord.innerHTML = 'Record Video';
    }
});

buttonServerFile.addEventListener("click",()=>{
    window.open("showfiles.php");
})