const stage = document.getElementById('download-stage');
const bar = document.getElementById('progress-bar');
const filename = document.getElementById('filename');
const percent = document.getElementById('percent');

window.electronApi.onDownloadProgress((event, progress) => {
  const value = ((progress.done / progress.total) * 100).toFixed(1);

  stage.textContent = progress.stage;
  bar.style.width = `${value}%`;
  filename.textContent = `File: ${progress.filename}`;
  percent.textContent = `${value}%`;
});
