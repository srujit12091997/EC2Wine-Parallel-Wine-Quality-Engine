document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const submitBtn = document.getElementById('submitBtn');
    const loadingDiv = document.getElementById('loading');
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error');
    const API_URL = 'http://ec2-3-81-189-24.compute-1.amazonaws.com:5000/predict';

    submitBtn.disabled = true;

    fileInput.addEventListener('change', function(e) {
        const fileName = e.target.files[0]?.name;
        if (fileName) {
            // Create or update file name display
            let fileNameDisplay = document.querySelector('.file-name');
            if (!fileNameDisplay) {
                fileNameDisplay = document.createElement('div');
                fileNameDisplay.className = 'file-name';
                this.parentElement.appendChild(fileNameDisplay);
            }
            fileNameDisplay.textContent = `Selected file: ${fileName}`;
            submitBtn.disabled = false;
        } else {
            submitBtn.disabled = true;
        }
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Hide any previous results or errors
        resultDiv.style.display = 'none';
        errorDiv.style.display = 'none';
        
        const file = fileInput.files[0];
        if (!file) {
            showError('Please select a file first.');
            return;
        }

        if (!file.name.toLowerCase().endsWith('.csv')) {
            showError('Please upload a CSV file.');
            return;
        }

        loadingDiv.style.display = 'block';
        submitBtn.disabled = true;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            showResult(`Predicted F1 Score: ${data.f1_score}`);
        } catch (error) {
            showError('Error processing request. Please check if the server is running and try again.');
            console.error('Error:', error);
        } finally {
            loadingDiv.style.display = 'none';
            submitBtn.disabled = false;
        }
    });

    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    function showResult(message) {
        resultDiv.textContent = message;
        resultDiv.style.display = 'block';
    }
});