window.addEventListener("DOMContentLoaded", () => {
  var stubstream_codec = "video/webm;codecs=vp8,opus";

  if (MediaRecorder.isTypeSupported("video/mp4;codecs=h264") === true) {
    stubstream_codec = "video/mp4;codecs=h264";
  }
  if (MediaRecorder.isTypeSupported("video/mp4;codecs=avc1") === true) {
    stubstream_codec = "video/mp4;codecs=avc1";
  }
  if (MediaRecorder.isTypeSupported("video/webm;codecs=av1,opus") === true) {
    stubstream_codec = "video/webm;codecs=av1,opus";
  }
  if (MediaRecorder.isTypeSupported("video/webm;codecs=avc1,opus") === true) {
    stubstream_codec = "video/webm;codecs=avc1,opus";
  }
  if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus") === true) {
    stubstream_codec = "video/webm;codecs=vp9,opus";
  }

  console.log("Codec used: " + stubstream_codec);

  const preview = document.getElementById("preview");
  const recording = document.getElementById("recording");
  const startButton = document.getElementById("startRecordButton");
  const stopButton = document.getElementById("stopRecordButton");
  const errorStatus = document.getElementById("errorStatus");

  let recordingChunks = [];
  let recorder = null;
  let file = null;

  function showError(message) {
    errorStatus.style.display = "";
    errorStatus.innerHTML = message;
  }

  if (!("MediaRecorder" in window)) {
    showError(
      "Il semblerait que votre navigateur ne soit pas supporté. Merci d'essayer sur un ordinateur avec un navigateur récent."
    );
    recording.style.display = "none";
    preview.style.display = "none";
    stopButton.style.display = "none";

    return;
  }

  function stopRecording() {
    const recordingBlob = new Blob(recordingChunks, { type: stubstream_codec });
    const recordingUrl = URL.createObjectURL(recordingBlob);

    console.log({ recordingBlob });
    console.log({ recordingChunks });
    console.log({ recordingUrl });

    recording.srcObject = undefined;
    recording.src = recordingUrl;
    recording.muted = false;

    file = new File([recordingBlob], "RecordedVideo.webm", {
      type: stubstream_codec,
    });
    
  }

  startButton.addEventListener("click", function () {
    recordingChunks = [];
    recording.style.display = "none";
    preview.style.display = "";

    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then(
        (stream) => {
          recorder = new MediaRecorder(stream, {
            mimeType: stubstream_codec,
            bitsPerSecond: 2000000,
          });
          recorder.addEventListener("stop", (e) => {
            console.log(e);
            stopRecording();
          });
          recorder.addEventListener("error", (e) => {
            console.log(e);
          });
          recorder.addEventListener("dataavailable", (e) => {
            console.log(e);
            recordingChunks.push(e.data);
          });
          recorder.start(1000);
          stopButton.style.display = "";
          startButton.style.display = "none";
          preview.srcObject = stream;
          preview.muted = true;
        },
        () => {
          showError(
            "Echec de l'enregistrement. Assure-toi d'avoir autorisé l'accès à la caméra et au microphone."
          );
          recording.style.display = "none";
          preview.style.display = "none";
          stopButton.style.display = "none";
        }
      )
      .catch((error) => {
        console.error("Unable to start recording", error);
        showError(
          "Une erreur est survenue durant l'enregistrement de votre interview. Merci de réessayer et/ou de changer de navigateur"
        );
      });
  });

  stopButton.addEventListener("click", function () {
    preview.style.display = "none";
    recording.style.display = "";
    startButton.style.display = "";
    stopButton.style.display = "none";

    recorder.stop();
  });
});
