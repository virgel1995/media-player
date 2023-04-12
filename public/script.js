var socket = io();
var songList = document.querySelector(".song-list");
var audioPlayer = document.querySelector(".audio-player");
var currentSongLabel = document.querySelector(".current-song-label");
var uploadFileForm = document.querySelector("#upload-file-form");
var uploadFileButton = document.querySelector("#upload-file-button");
var uploadFileField = document.querySelector("#upload-field");
// var loadingLabel = document.querySelector("#loading-label");
var error_type = document.querySelector("#error_type");
var supported_types = document.querySelector("#supported_types");
var progress = document.getElementById("Progress");

socket.on("connect", function () {
  socket.on("giveLibrary", function renderLibrary(data) {
    songsView = "";
    data.songNames.forEach(function (elem, index, array) {
      songsView +=
        '<li class="song"><span class="song-name">' + elem + "</span></li>";
    });
    songList.innerHTML = songsView;
    var songs = document.querySelector(".song-list").children;
    Object.keys(songs).forEach(function (key) {
      songs[key].addEventListener("click", function (e) {
        mediaFilesDir = "/media/";
        audioPlayer.src = mediaFilesDir + this.textContent;
        currentSongLabel.innerHTML =
          "Currently playing <br>" + this.textContent;
        socket.emit("songClicked", {
          songName: this.textContent,
        }); // emit
      }); // addEventListener
    }); // forEach
  });

  function FileDragHover(e) {
    e.preventDefault();
    e.target.className = e.type === "dragover" ? "hover" : "";
  }
  function UploadProgress(totalSize, fileSize) {
    var bar = document.getElementById("Bar");
    bar.style.width = Math.floor((totalSize / fileSize) * 100) + 1 + "%";
    bar.innerHTML = Math.floor((totalSize / fileSize) * 100) + 1 + "%";
  }

  function upStream(files) {
    Object.keys(files).forEach(function (key) {
      var file = files[key];
      const types = [
        "audio/mp3",
        "audio/mpeg",
        "audio/m4a",
        "audio/flac",
        "audio/wav",
        "audio/wma",
        "audio/aac",
        // "audio/mp4",
      ];

      // totalSize += file.size;
      if (types.includes(file.type)) {
        var stream = ss.createStream();
        ss(socket).emit("uploadSong", stream, {
          name: file.name,
          size: file.size,
        });
        var totalSize = 0;
        var blobStream = ss.createBlobReadStream(file);

        blobStream.on("data", function (chunk) {
          totalSize += chunk.length;
          if (blobStream._readableState.ended) {
            progress.style.display = "none";
            console.log("uploaded");
          } else {
            UploadProgress(totalSize, file.size);
            progress.style.display = "block";
          }
        });
        blobStream.pipe(stream);
      } else {
        error_type.style.display = "block";
        let supported_types_view = "";
        types.map((type) => {
          supported_types_view += `<li class="error_type">${type.slice(
            6
          )}</li>`;
        });
        supported_types.innerHTML = supported_types_view;
        setTimeout(() => {
          error_type.style.display = "none";
        }, 3000);
      }
    });
  }

  uploadFileField.addEventListener("dragover", FileDragHover);
  uploadFileField.addEventListener("dragleave", FileDragHover);
  uploadFileField.addEventListener("drop", FileDragHover);

  uploadFileForm.addEventListener("drop", function (e) {
    e.preventDefault();
    e.stopPropagation();
    upStream(e.dataTransfer.files);
  });

  uploadFileForm.addEventListener("change", function (e) {
    e.preventDefault();
    e.stopPropagation();
    upStream(e.target.files);
  });

  socket.on("disconnect", function () {
    console.log("you are disconnected");
  });
}); // on connect

socket.on("event", function () {});
socket.on("disconnect", function () {});
