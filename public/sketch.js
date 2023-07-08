
const Button = document.getElementById('myButton');
const Puppeteer = document.getElementById('Puppeteer');
const Reset = document.getElementById('Reset');
const ip = 'http://43.201.202.51';
const port1 = ':3001/';
const port2 = ':3002/';
var start = false;
var LINKS = [];
Button.addEventListener('click', function (event) {
    event.preventDefault();
    // Add your desired button click logic here
    const link = document.getElementById('link');
    console.log(link.value);
    if (!link.value) {
        alert('Please enter a YouTube URL.');
        return;
    }
    triggerDownload(link.value);
});
Puppeteer.addEventListener('click', function (event) {
    // Add your desired button click logic here
    //fetch(ip+port2);
    for(i in LINKS){
        console.log(i);
        window.open(LINKS[i]);
    }
});
Reset.addEventListener('click', function (event) {
    // Add your desired button click logic here
    fetch(ip+port1);
        
});

var imageCount = 0;
var mode = "mouse";
var cnv;
var video;
let Playing = 1;
let speed = 1;
let boxX;
let boxY;
let videoWidth;
let videoHeight;
let Mclicked = false;
function setup() {
    cnv = createCanvas(200, 200);
}

function draw() {
    background(220);

    if (start) {

        //resizeCanvas(video.size().width, video.size().height + 80);
        video.position(cnv.position().x, cnv.position().y);


        image(video, 0, 0, videoWidth, videoHeight);

        if (mode == "capture") {
            if (mouseIsPressed) {
                if(mouseX<videoWidth&&mouseY<videoHeight){
                    if (!Mclicked) {
                        boxX = mouseX;
                        boxY = mouseY;
                    } else {
                        noFill();
                        stroke(0);
                        strokeWeight(2);
                        rect(boxX, boxY, mouseX - boxX, mouseY - boxY);
                        noStroke();
                    }
                }
                
                Mclicked = true;
            } else {
                if (Mclicked&&(mouseX!=boxX||mouseY!=boxY)&&mouseX<videoWidth&&mouseY<videoHeight&&boxY<videoHeight&&boxX<videoWidth) {
                    let graphics = createGraphics(mouseX - boxX, mouseY - boxY);
                    graphics.image(get(boxX, boxY, mouseX - boxX, mouseY - boxY), 0, 0);
                    imageCount++;
                    //saveCanvas(graphics,"test"+imageCount,'png');
                    const canvas = graphics.canvas;

                    canvas.toBlob((blob) => {
                        const formData = new FormData();
                        const headers = new Headers();
                        headers.append('image-count', imageCount);
                        const fileID= floor(random(1000000));
                        headers.append('file-id', fileID);
                        formData.append('image', blob, `test${imageCount}.png`);
                        fetch(ip+port1+'save-image', {
                            method: 'POST',
                            headers: headers,
                            body: formData,
                        })
                            .then(response => {
                                if (response.ok) {
                                    console.log("image downloaded successfully");
                                    const headers2 = new Headers();
                                    headers2.append('file-id',fileID)
                                    fetch(ip + port2,{headers:headers2})
                                        .then(Response => {
                                            if (Response.ok) {
                                            console.log("Image downloaded successfully");
                                            return Response.text(); 
                                            } else {
                                            throw new Error('Image download failed');
                                            }
                                        })
                                        .then(data => {
                                            LINKS.push(data);
                                            console.log(data); // Log the response data
                                            //return fetch(ip + port1 + 'reset/');
                                        })
                                        .catch(error => {
                                            console.error('Error:', error);
                                        });
                                } else {
                                    console.error('Error saving image');
                                }
                            })
                            .catch(error => {
                                console.error('Error saving image', error);
                            });
                    });
                }
                Mclicked = false;
            }
        }
        let tPlay = "PLAYING";
        if (Playing == -1) tPlay = "PAUSED"
        fill(0);
        textSize(15);
        text("재생속도: " + speed, width - 130, height - 25);
        text(toMin(video.time()) + '/' + toMin(video.duration()) + "    " + tPlay, 30, height - 25);
        showBar(height - 65);
        video.speed(speed);
    }



}
function mouseReleased() {
    if (start && mode == "mouse") {
        var vx = 0;
        var vw = videoWidth;
        var vy = 0;
        var vh = videoHeight;

        if (mouseX > vx && mouseX < vx + vw && mouseY > vy && mouseY < vy + vh && start) {


            Playing *= -1;

            if (Playing == 1) {
                video.play();
                console.log("play");
            }

            if (Playing == -1) {
                video.pause();
                console.log("pause");
            }
        }
    }

}

function keyReleased() {
    if (start) {
        if (keyCode == 32) {
            Playing *= -1;

            if (Playing == 1) {
                video.play();
                console.log("play");
            }

            if (Playing == -1) {
                video.pause();
                console.log("pause");
            }
        }
        if (keyCode == UP_ARROW) {
            speed += 0.1;
        }
        if (keyCode == DOWN_ARROW) {
            speed -= 0.1;
        }
        speed = abs(speed);
        speed = round(speed, 2);

        if (keyCode == LEFT_ARROW) {
            video.time(video.time() - 5);
        }
        if (keyCode == RIGHT_ARROW) {
            video.time(video.time() + 5);
        }
        if (keyCode == 77) {
            if (mode == "mouse") mode = "capture";
            else mode = "mouse";

            console.log("mode: " + mode);
        }
    }

}

function startLoad() {
    video = createVideo("video3.mp4", videoLoaded);
    video.hide();
}

function videoLoaded() {
    console.log("video loaded");


    video.position(cnv.position().x, cnv.position().y);
    video.loop();
    video.show();
    videoHeight = video.height;
    videoWidth = video.width;
    let ratio = videoWidth / videoHeight;
    if(ratio>1.2){
        videoWidth = 800;
        videoHeight = 800/ratio;
    }
    else{
        videoHeight = 650;
        videoWidth = 650*ratio;
    }
    resizeCanvas(videoWidth, videoHeight + 80);
    start = true;
    video.hide();
    //video.showControls();
}
function showBar(y) {
    strokeWeight(4);
    stroke(120);
    line(0, y, width, y);
    let Length = video.duration().toFixed(2);
    let Current = video.time().toFixed(2);
    let CurrentX = map(Current, 0, Length, 0, width);
    stroke(255, 0, 0);
    line(0, y, CurrentX, y);
    noStroke();
    fill(255, 0, 0);
    ellipse(CurrentX, y, 8, 8);
    fill(0);


    if (mouseIsPressed && mouseY > video.size().height && mouseY > y - 10 && mouseY < y + 10) {
        CurrentX = mouseX;
        let time = map(CurrentX, 0, width, 0, Length);
        video.time(time);
    }

}

function toMin(sec) {
    let Min = floor(sec / 60);
    let Sec = floor(sec % 60);
    Min = Min.toString().padStart(2, '0');
    Sec = Sec.toString().padStart(2, '0');
    return Min + ':' + Sec;
}
function triggerDownload(link) {
    const encodedURI = encodeURIComponent(link);
    console.log(encodedURI);
    fetch(ip+port1+`download?url=${encodedURI}`)
        .then(response => {
            console.log(response);

            console.log("responseOK");
            startLoad();



        })
        .catch(error => {
            console.error('Error:', error);
        });
}