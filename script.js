document.getElementById("uploadForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("file", file);

    fetch("http://ec2-3-81-189-24.compute-1.amazonaws.com:5000/predict", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        const resultElement = document.getElementById("result");
        resultElement.innerHTML = "Predicted F1 Score: " + data.f1_score;
        resultElement.style.display = "block";
    })
    .catch(error => console.error("Error:", error));
});