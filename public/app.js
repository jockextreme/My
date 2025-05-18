const API_KEY = '625156d0d268e4633b97980c0dc859d0';
let currentUser = null;

async function searchContent() {
    const query = document.getElementById('searchInput').value;
    const filter = document.getElementById('filter').value;
    
    try {
        const response = await fetch(`/api/javhd?action=search&query=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if(data.error) throw new Error(data.error);
        
        const filtered = data.filter(item => {
            if(filter === 'hd') return item.quality === 'HD';
            if(filter === 'recent') return new Date(item.date) > new Date(Date.now() - 30 * 86400000);
            return true;
        });
        
        displayResults(filtered);
    } catch (error) {
        showError(error.message);
    }
}

async function showVideoDetail(url) {
    try {
        const response = await fetch(`/api/javhd?action=detail&url=${encodeURIComponent(url)}`);
        const data = await response.json();
        
        if(data.error) throw new Error(data.error);
        if(!data.videos?.length) throw new Error('No video found');
        
        const videoPlayer = document.getElementById('videoPlayer');
        videoPlayer.innerHTML = `<source src="${data.videos[0].url}" type="video/mp4">`;
        videoPlayer.play();
        
        document.getElementById('videoModal').style.display = 'flex';
        addToHistory(data);
    } catch (error) {
        showError(error.message);
    }
}

// Additional features
async function addToFavorites() {
    if(!currentUser) return showError('Login required');
    // Implement favorite logic
}

async function rateContent(rating) {
    if(!currentUser) return showError('Login required');
    // Implement rating logic
}

function addToHistory(item) {
    if(!currentUser) return;
    // Implement history tracking
}

// User system
async function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if(response.ok) currentUser = username;
    } catch (error) {
        showError(error.message);
    }
}

// Utility functions
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
    }
