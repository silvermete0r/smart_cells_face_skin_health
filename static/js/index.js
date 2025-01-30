// Main application logic
let video = document.getElementById('video');
let canvas = document.getElementById('previewCanvas');
let ctx = canvas.getContext('2d');
let streaming = false;
let currentMode = null;
let blazefaceModel = null;

// Initialize camera handling
async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.play();
        streaming = true;
        document.getElementById('cameraGuide').classList.remove('hidden');
    } catch (err) {
        console.error("Camera error:", err);
        alert("Unable to access camera");
    }
}

// Initialize mode buttons
document.getElementById('selfieMode').addEventListener('click', () => {
    currentMode = 'selfie';
    resetUI();
    document.getElementById('fileInput').classList.remove('hidden');
    document.getElementById('capture').classList.remove('hidden');
});

document.getElementById('liveMode').addEventListener('click', () => {
    currentMode = 'live';
    resetUI();
    video.classList.remove('hidden');
    document.getElementById('capture').classList.remove('hidden');
    initCamera();
});

// Reset UI elements
function resetUI() {
    video.classList.add('hidden');
    canvas.classList.add('hidden');
    document.getElementById('fileInput').classList.add('hidden');
    document.getElementById('capture').classList.add('hidden');
    document.getElementById('results').classList.add('hidden');
    document.getElementById('cameraGuide').classList.add('hidden');
    if (streaming) {
        video.srcObject.getTracks().forEach(track => track.stop());
        streaming = false;
    }
}

// Handle image capture and analysis
document.getElementById('capture').addEventListener('click', async () => {
    try {
        document.getElementById('capture').disabled = true;
        document.getElementById('capture').textContent = 'Analyzing...';
        
        let imageData;
        
        if (currentMode === 'live' && streaming) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            imageData = canvas.toDataURL('image/jpeg');
        } else if (currentMode === 'selfie') {
            if (!canvas.width || !canvas.height) {
                throw new Error('Please select an image first');
            }
            imageData = canvas.toDataURL('image/jpeg');
        } else {
            throw new Error('Please select a mode and capture an image');
        }

        // Check image quality
        await checkImageQuality(canvas);
        
        const formData = new FormData();
        formData.append('image', dataURLtoFile(imageData, 'analysis.jpg'));

        const response = await fetch('/analyze', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Analysis failed');
        }

        const results = await response.json();
        if (results.error) {
            throw new Error(results.error);
        }

        displayResults(results);
    } catch (err) {
        handleError(err);
    } finally {
        document.getElementById('capture').disabled = false;
        document.getElementById('capture').textContent = 'Capture & Analyze';
    }
});

// Convert Data URL to File object
function dataURLtoFile(dataurl, filename) {
    let arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while(n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}

// Display analysis results
function displayResults(results) {
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('predictedAge').textContent = results.predicted_age || 'N/A';
    document.getElementById('faceType').textContent = results.face_type || 'N/A';

    // Create score circles
    const scoreCirclesContainer = document.getElementById('scoreCircles');
    scoreCirclesContainer.innerHTML = '';
    
    // Filter out non-metric properties
    const metrics = Object.entries(results).filter(([key]) => 
        !['predicted_age', 'face_type', 'error'].includes(key)
    );

    metrics.forEach(([metric, score]) => {
        const div = document.createElement('div');
        div.className = 'score-circle';
        
        const canvas = document.createElement('canvas');
        canvas.width = 120;  // Set fixed dimensions
        canvas.height = 120;
        const ctx = canvas.getContext('2d');
        
        drawScoreCircle(ctx, score);
        
        const textDiv = document.createElement('div');
        textDiv.className = 'score-text';
        textDiv.innerHTML = `${metric.replace(/_/g, ' ')}<br>${score}`;
        
        div.appendChild(canvas);
        div.appendChild(textDiv);
        scoreCirclesContainer.appendChild(div);
    });

    // Create radar chart with the same metrics
    createRadarChart(metrics);
}

// Draw circular score indicator
function drawScoreCircle(ctx, score) {
    const centerX = 60;
    const centerY = 60;
    const radius = 50;

    // Background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 10;
    ctx.stroke();

    // Score arc
    const startAngle = -0.5 * Math.PI;
    const endAngle = startAngle + (2 * Math.PI * score / 100);
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = getScoreColor(score);
    ctx.lineWidth = 10;
    ctx.stroke();
}

// Get color based on score
function getScoreColor(score) {
    if (score >= 80) return '#22c55e';  // green
    if (score >= 60) return '#eab308';  // yellow
    return '#ef4444';  // red
}

// Create radar chart
function createRadarChart(metrics) {
    const ctx = document.getElementById('radarChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.skinRadarChart) {
        window.skinRadarChart.destroy();
    }

    window.skinRadarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: metrics.map(([label]) => label.replace(/_/g, ' ').toUpperCase()),
            datasets: [{
                label: 'Skin Analysis',
                data: metrics.map(([_, value]) => value),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    angleLines: {
                        display: true,
                        color: 'rgba(0,0,0,0.1)'
                    },
                    suggestedMin: 50,
                    suggestedMax: 100,
                    ticks: {
                        stepSize: 10,
                        backdropColor: 'transparent'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Score: ${context.raw}`;
                        }
                    }
                }
            }
        }
    });
}

// Handle file input
document.getElementById('fileInput').addEventListener('change', function(e) {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.classList.remove('hidden');
                ctx.drawImage(img, 0, 0);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
    }
});

// Error handling function
function handleError(error) {
    console.error('Error:', error);
    const errorMessage = error.response?.data?.error || error.message || 'An unexpected error occurred';
    alert(errorMessage);
}

// Cleanup function for camera
function cleanup() {
    if (streaming) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
        streaming = false;
    }
}

// Handle page unload
window.addEventListener('beforeunload', cleanup);

// Initialize the UI
document.addEventListener('DOMContentLoaded', async () => {
    resetUI();
    
    // Set canvas size
    const aspectRatio = window.innerWidth < 768 ? 4/3 : 16/9;
    canvas.width = Math.min(window.innerWidth - 40, 800);
    canvas.height = canvas.width / aspectRatio;
    
    // Set video size
    video.width = canvas.width;
    video.height = canvas.height;

    await loadFaceDetectionModel();
});

// Handle window resize
window.addEventListener('resize', () => {
    if (currentMode === 'live' && streaming) {
        const aspectRatio = window.innerWidth < 768 ? 4/3 : 16/9;
        canvas.width = Math.min(window.innerWidth - 40, 800);
        canvas.height = canvas.width / aspectRatio;
        video.width = canvas.width;
        video.height = canvas.height;
    }
});

// Add touch support for mobile devices
if ('ontouchstart' in window) {
    document.getElementById('capture').addEventListener('touchstart', function(e) {
        e.preventDefault();
        this.click();
    });
}

// Load face detection model
async function loadFaceDetectionModel() {
    try {
        blazefaceModel = await blazeface.load();
    } catch (err) {
        console.error('Error loading face detection model:', err);
    }
}

// Check face position and brightness
async function checkImageQuality(imageElement) {
    if (!blazefaceModel) {
        await loadFaceDetectionModel();
    }

    // Check face position
    const predictions = await blazefaceModel.estimateFaces(imageElement, false);
    
    if (predictions.length === 0) {
        throw new Error('No face detected');
    }
    if (predictions.length > 1) {
        throw new Error('Multiple faces detected');
    }

    const face = predictions[0];
    const imageCenter = imageElement.width / 2;
    const faceCenter = face.topLeft[0] + (face.bottomRight[0] - face.topLeft[0]) / 2;
    
    if (Math.abs(imageCenter - faceCenter) > imageElement.width * 0.2) {
        throw new Error('Please center your face');
    }

    // Check brightness
    const brightness = await calculateBrightness(imageElement);
    if (brightness < 0.3) {
        throw new Error('Image is too dark');
    }
    if (brightness > 0.8) {
        throw new Error('Image is too bright');
    }

    return true;
}

// Calculate image brightness
function calculateBrightness(imageElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    ctx.drawImage(imageElement, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let sum = 0;
    
    for (let i = 0; i < data.length; i += 4) {
        sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    
    return sum / (data.length / 4) / 255;
}