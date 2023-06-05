const MODE_PATH = './weights'
const video = document.getElementById('video');

async function getCamera() {
    try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = mediaStream;
    } catch (e) {
        console.error(e)
    }
}

async function loadModels() {
    await faceapi.loadTinyFaceDetectorModel(MODE_PATH);
    await faceapi.loadFaceLandmarkTinyModel(MODE_PATH);
    await faceapi.loadFaceExpressionModel(MODE_PATH);
    await faceapi.loadAgeGenderModel(MODE_PATH);
    getCamera();
}

function detectFace() {
    const canvas = faceapi.createCanvasFromMedia(video);
    const ctx = canvas.getContext('2d');
    const { videoWidth: width, videoHeight: height } = video;

    const videoContainer = document.querySelector('.video-container');
    videoContainer.appendChild(canvas)

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video,
            new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks(true)
            .withFaceExpressions()
            .withAgeAndGender();
        const resizedDetections = faceapi.resizeResults(detections, { width, height });
        ctx.clearRect(0, 0, width, height);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        // faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

        resizedDetections.forEach(result => {
            const { age, gender, genderProbability } = result;
            new faceapi.draw.DrawTextField([
                `预估${~~age} 岁`,
                `${gender} {${genderProbability.toFixed(1)}}`
            ], result.detection.box.bottomLeft)
            .draw(canvas);
        });        
    }, 300)
}

video.addEventListener('play', detectFace);

loadModels();