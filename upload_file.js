document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
  
    const formData = new FormData(this);
  
    fetch('http://localhost:3000/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (response.ok) {
        window.location.href = 'upload-success.html'; // Redirect to a new page
      } else {
        document.getElementById('status').textContent = "Upload failed!";
      }
    })
    .catch(error => {
      console.error('Error:', error);
      document.getElementById('status').textContent = "Upload failed!";
    });
  });
  