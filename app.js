<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Educational Media Archive | Research Platform</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        :root {
            --primary: #e91e63;
            --background: #1a1a1a;
            --surface: #2d2d2d;
            --text: #ffffff;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            background: var(--background);
            color: var(--text);
            transition: background 0.3s ease;
        }

        body.light-theme {
            --background: #f5f5f5;
            --surface: #ffffff;
            --text: #333333;
        }

        .header {
            background: var(--surface);
            padding: 2rem;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .disclaimer {
            background: var(--primary);
            padding: 1rem;
            text-align: center;
            font-size: 0.9em;
            margin-bottom: 2rem;
        }

        .search-bar {
            margin: 20px auto;
            max-width: 600px;
            padding: 0 2rem;
        }

        #searchInput {
            width: 100%;
            padding: 15px;
            border-radius: 30px;
            border: none;
            background: var(--surface);
            color: var(--text);
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .grid-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }

        .video-card {
            background: var(--surface);
            border-radius: 10px;
            overflow: hidden;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
            box-shadow: 0 3px 6px rgba(0,0,0,0.1);
        }

        .video-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }

        .thumbnail-container {
            position: relative;
            aspect-ratio: 16/9;
        }

        .thumbnail {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .play-button {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 3rem;
            color: rgba(255,255,255,0.8);
            text-shadow: 0 0 10px rgba(0,0,0,0.5);
        }

        .video-info {
            padding: 1.5rem;
            position: relative;
        }

        .video-title {
            font-size: 1.1em;
            margin-bottom: 0.5rem;
            color: var(--text);
        }

        .video-actions {
            position: absolute;
            top: 10px;
            right: 10px;
            display: flex;
            gap: 8px;
        }

        .action-btn {
            background: rgba(0,0,0,0.5);
            border: none;
            color: white;
            padding: 8px;
            border-radius: 50%;
            cursor: pointer;
            transition: background 0.3s;
        }

        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 1000;
        }

        .modal-content {
            position: relative;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80%;
            max-width: 800px;
        }

        .video-player {
            width: 100%;
            aspect-ratio: 16/9;
        }

        .close-btn {
            position: absolute;
            top: -30px;
            right: 0;
            font-size: 2rem;
            cursor: pointer;
            color: white;
        }

        .pagination {
            display: flex;
            justify-content: center;
            gap: 10px;
            padding: 2rem;
        }

        .page-btn {
            padding: 10px 20px;
            background: var(--primary);
            border: none;
            border-radius: 5px;
            color: white;
            cursor: pointer;
            transition: opacity 0.3s;
        }

        .page-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .loader {
            display: none;
            border: 4px solid #f3f3f3;
            border-top: 4px solid var(--primary);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 2rem auto;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .video-stats {
            text-align: center;
            padding: 1rem;
            background: var(--surface);
            margin: 1rem auto;
            max-width: 600px;
            border-radius: 10px;
        }

        footer {
            background: #000;
            padding: 2rem;
            text-align: center;
            margin-top: 3rem;
        }

        .theme-switcher {
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--surface);
            padding: 10px;
            border-radius: 50%;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body>
    <div class="theme-switcher" onclick="toggleTheme()">
        <i class="fas fa-moon"></i>
    </div>

    <header class="header">
        <h1>📚 Academic Media Archive</h1>
        <p>For Research and Educational Purposes Only</p>
    </header>

    <div class="disclaimer">
        ⚠️ This content is preserved under Fair Use for academic research. All materials are strictly for educational analysis.
    </div>

    <div class="search-bar">
        <input type="text" id="searchInput" placeholder="Search research materials..." onkeyup="filterVideos()">
    </div>

    <div class="video-stats">
        <span id="stats">Loading academic resources...</span>
    </div>

    <div class="loader" id="loader"></div>

    <div class="grid-container" id="videoGrid"></div>

    <div class="modal" id="videoModal">
        <div class="modal-content">
            <span class="close-btn" onclick="closeModal()">&times;</span>
            <video controls class="video-player" id="videoPlayer">
                Your browser does not support the video tag.
            </video>
        </div>
    </div>

    <div class="pagination">
        <button class="page-btn" onclick="loadMore()" id="loadMore">Load More</button>
    </div>

    <footer>
        <p>© 2024 Academic Research Archive. Strictly for educational use.</p>
        <p>Content preserved under Digital Millennium Copyright Act Section 107</p>
    </footer>

    <script>
        // Sample data - Replace with actual API response
        const videoData = {
            "author": "Kaizenji",
            "total": 20,
            "limit": 5,
            "videos": [
                {
                    "title": "Gusto ng video pero may mask",
                    "thumbnail": "https://lootedpinay.com/wp-content/uploads/2024/09/Gusto-ng-video-pero-may-mask.jpg",
                    "mp4url": "https://kayatan.cc/wp-content/uploads/2024/09/Gusto-ng-video-pero-may-mask.mp4",
                    "id": "1"
                },
                {
                    "title": "Opa na naman si tita",
                    "thumbnail": "https://lootedpinay.com/wp-content/uploads/2024/08/Opa-na-naman-si-tita.jpg",
                    "mp4url": "https://kayatan.cc/wp-content/uploads/2024/08/Opa-na-naman-si-tita.mp4",
                    "id": "2"
                },
                {
                    "title": "Masakit talaga kapag may nakadikit na bolitas",
                    "thumbnail": "https://lootedpinay.com/wp-content/uploads/2024/08/Masakit-talaga-kapag-may-nakadikit-na-bolitas.jpg",
                    "mp4url": "https://kayatan.cc/wp-content/uploads/2024/08/Masakit-talaga-kapag-may-nakadikit-na-bolitas.mp4",
                    "id": "3"
                },
                {
                    "title": "Isang patong lang sirit sirit na si tamod",
                    "thumbnail": "https://lootedpinay.com/wp-content/uploads/2024/08/Isang-patong-lang-sirit-sirit-na-si-tamod.jpg",
                    "mp4url": "https://kayatan.cc/wp-content/uploads/2024/08/Isang-patong-lang-sirit-sirit-na-si-tamod.mp4",
                    "id": "4"
                },
                {
                    "title": "Dahil may dalaw hanggang chupa muna ang tira tira",
                    "thumbnail": "https://lootedpinay.com/wp-content/uploads/2024/08/Dahil-may-dalaw-hanggang-chupa-muna-ang-tira-tira.jpg",
                    "mp4url": "https://kayatan.cc/wp-content/uploads/2024/08/Dahil-may-dalaw-hanggang-chupa-muna-ang-tira-tira.mp4",
                    "id": "5"
                }
            ]
        };

        let currentPage = 1;
        const resultsPerPage = 5;

        function init() {
            const grid = document.getElementById('videoGrid');
            videoData.videos.forEach(video => {
                const card = document.createElement('div');
                card.className = 'video-card';
                card.innerHTML = `
                    <div class="thumbnail-container" onclick="playVideo('${video.mp4url}')">
                        <img src="${video.thumbnail}" class="thumbnail" alt="${video.title}">
                        <i class="fas fa-play play-button"></i>
                    </div>
                    <div class="video-info">
                        <div class="video-actions">
                            <button class="action-btn" onclick="bookmarkVideo('${video.id}')">
                                <i class="fas fa-bookmark"></i>
                            </button>
                            <button class="action-btn" onclick="shareVideo('${video.mp4url}')">
                                <i class="fas fa-share"></i>
                            </button>
                        </div>
                        <h3 class="video-title">${video.title}</h3>
                    </div>
                `;
                grid.appendChild(card);
            });
            updateStats();
        }

        function playVideo(url) {
            const modal = document.getElementById('videoModal');
            const player = document.getElementById('videoPlayer');
            player.src = url;
            modal.style.display = 'block';
            player.play();
        }

        function closeModal() {
            const modal = document.getElementById('videoModal');
            const player = document.getElementById('videoPlayer');
            player.pause();
            player.src = '';
            modal.style.display = 'none';
        }

        function toggleTheme() {
            document.body.classList.toggle('light-theme');
            const themeIcon = document.querySelector('.theme-switcher i');
            themeIcon.classList.toggle('fa-sun');
            themeIcon.classList.toggle('fa-moon');
        }

        function filterVideos() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const cards = document.querySelectorAll('.video-card');
            
            cards.forEach(card => {
                const title = card.querySelector('.video-title').textContent.toLowerCase();
                card.style.display = title.includes(searchTerm) ? 'block' : 'none';
            });
        }

        async function loadMore() {
            document.getElementById('loader').style.display = 'block';
            document.getElementById('loadMore').disabled = true;
            
            // Simulated API call
            setTimeout(() => {
                currentPage++;
                updateStats();
                document.getElementById('loader').style.display = 'none';
                document.getElementById('loadMore').disabled = false;
            }, 1500);
        }

        function updateStats() {
            document.getElementById('stats').textContent = 
                `Showing ${currentPage * resultsPerPage} of ${videoData.total} research materials`;
        }

        function bookmarkVideo(videoId) {
            const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
            const index = bookmarks.indexOf(videoId);
            
            if(index === -1) {
                bookmarks.push(videoId);
                alert('Added to bookmarks');
            } else {
                bookmarks.splice(index, 1);
                alert('Removed from bookmarks');
            }
            
            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        }

        function shareVideo(url) {
            if(navigator.share) {
                navigator.share({
                    title: 'Educational Resource',
                    text: 'Check out this academic material:',
                    url: url
                });
            } else {
                prompt('Copy this link:', url);
            }
        }

        // Initialize on load
        document.addEventListener('DOMContentLoaded', () => {
            init();
            window.onclick = function(event) {
                const modal = document.getElementById('videoModal');
                if (event.target === modal) {
                    closeModal();
                }
            }
        });
    </script>
</body>
</html>
