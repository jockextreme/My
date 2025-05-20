class AcademicArchive {
    static config = {
        api: 'scripts/api-response.json',
        storageKey: 'academicArchiveData',
        defaultStorage: {
            videos: {},
            history: [],
            bookmarks: [],
            preferences: {
                layoutMode: 'grid',
                theme: 'dark'
            }
        }
    };

    static init() {
        this.initStorage();
        this.loadPreferences();
        this.loadContent();
        this.initModal();
        this.renderHistory();
    }

    static initStorage() {
        if (!localStorage.getItem(this.config.storageKey)) {
            this.updateStorage(this.config.defaultStorage);
        }
    }

    static getStorage() {
        return JSON.parse(localStorage.getItem(this.config.storageKey)) || this.config.defaultStorage;
    }

    static updateStorage(data) {
        localStorage.setItem(this.config.storageKey, JSON.stringify(data));
    }

    static async loadContent() {
        try {
            const response = await fetch(this.config.api);
            const data = await response.json();
            this.currentVideos = data.videos;
            this.renderVideos(data.videos);
        } catch (error) {
            console.error('Error loading content:', error);
        }
    }

    static renderVideos(videos) {
        const container = document.getElementById('videoContainer');
        const storage = this.getStorage();
        
        container.className = `video-${this.config.preferences.layoutMode}`;
        container.innerHTML = videos.map(video => {
            const videoKey = btoa(video.mp4url);
            const videoData = storage.videos[videoKey] || { 
                likes: 0, 
                comments: [],
                views: 0,
                lastViewed: null,
                bookmarked: false
            };
            
            return `
                <article class="video-card">
                    <div class="thumbnail-container" 
                         role="button"
                         aria-label="View ${video.title}"
                         tabindex="0"
                         data-video="${encodeURIComponent(video.mp4url)}">
                        <img src="${video.thumbnail}" 
                             alt="${video.title}"
                             class="thumbnail"
                             loading="lazy">
                        <div class="play-overlay"><i class="fas fa-play"></i></div>
                    </div>
                    <div class="video-info">
                        <div class="video-header">
                            <h3 class="video-title">${video.title}</h3>
                            <button class="bookmark-btn ${videoData.bookmarked ? 'bookmarked' : ''}" 
                                    onclick="AcademicArchive.toggleBookmark('${videoKey}')">
                                <i class="fas fa-bookmark"></i>
                            </button>
                        </div>
                        <div class="video-meta">
                            <span class="view-count">
                                <i class="fas fa-eye"></i> ${videoData.views} views
                            </span>
                            ${videoData.lastViewed ? `
                            <span class="last-viewed">
                                Last viewed: ${new Date(videoData.lastViewed).toLocaleDateString()}
                            </span>` : ''}
                        </div>
                        <div class="video-actions">
                            <button class="like-btn ${videoData.likes > 0 ? 'liked' : ''}" 
                                    onclick="AcademicArchive.toggleLike('${videoKey}')">
                                <i class="fas fa-heart"></i>
                                <span>${videoData.likes}</span>
                            </button>
                        </div>
                        <div class="comments-section">
                            <form class="comment-form" onsubmit="return AcademicArchive.addComment('${videoKey}', this)">
                                <input type="text" class="comment-input" placeholder="Add academic note..." required>
                                <button type="submit" class="nav-link">Post</button>
                            </form>
                            <ul class="comment-list">
                                ${videoData.comments.map(comment => `
                                    <li class="comment-item">
                                        ${comment.text}
                                        <button onclick="AcademicArchive.deleteComment('${videoKey}', ${comment.id})" 
                                                class="nav-link">
                                            ×
                                        </button>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        this.initVideoHandlers();
    }

    static initVideoHandlers() {
        document.querySelectorAll('.thumbnail-container').forEach(thumb => {
            thumb.addEventListener('click', () => this.playVideo(thumb.dataset.video));
            thumb.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.playVideo(thumb.dataset.video);
            });
        });
    }

    static toggleLike(videoKey) {
        const storage = this.getStorage();
        const videoData = storage.videos[videoKey] || { likes: 0 };
        videoData.likes = videoData.likes ? 0 : 1;
        storage.videos[videoKey] = videoData;
        this.updateStorage(storage);
        this.renderVideos(this.currentVideos);
    }

    static addComment(videoKey, form) {
        const input = form.querySelector('.comment-input');
        const text = input.value.trim();
        if (!text) return false;

        const storage = this.getStorage();
        const videoData = storage.videos[videoKey] || { likes: 0, comments: [] };
        videoData.comments.push({
            id: Date.now(),
            text: text,
            timestamp: new Date().toISOString()
        });
        storage.videos[videoKey] = videoData;
        this.updateStorage(storage);
        input.value = '';
        this.renderVideos(this.currentVideos);
        return false;
    }

    static deleteComment(videoKey, commentId) {
        const storage = this.getStorage();
        const videoData = storage.videos[videoKey];
        if (videoData) {
            videoData.comments = videoData.comments.filter(c => c.id !== commentId);
            storage.videos[videoKey] = videoData;
            this.updateStorage(storage);
            this.renderVideos(this.currentVideos);
        }
    }

    static playVideo(url) {
        const videoKey = btoa(decodeURIComponent(url));
        this.trackView(videoKey);
        const modal = document.getElementById('videoModal');
        const player = document.getElementById('videoPlayer');
        player.src = decodeURIComponent(url);
        modal.style.display = 'block';
        player.play();
        document.body.style.overflow = 'hidden';
    }

    static trackView(videoKey) {
        const storage = this.getStorage();
        const videoData = storage.videos[videoKey] || { views: 0 };
        videoData.views = (videoData.views || 0) + 1;
        videoData.lastViewed = new Date().toISOString();
        
        storage.videos[videoKey] = videoData;
        storage.history = storage.history
            .filter(h => h.videoKey !== videoKey)
            .slice(0, 5);
        storage.history.unshift({
            videoKey,
            title: this.currentVideos.find(v => btoa(v.mp4url) === videoKey).title,
            timestamp: new Date().toISOString()
        });
        
        this.updateStorage(storage);
    }

    static closeModal() {
        const modal = document.getElementById('videoModal');
        const player = document.getElementById('videoPlayer');
        player.pause();
        player.src = '';
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    static initModal() {
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('video-modal')) {
                this.closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    }

    static toggleLayout() {
        this.config.preferences.layoutMode = 
            this.config.preferences.layoutMode === 'grid' ? 'list' : 'grid';
        this.renderVideos(this.currentVideos);
    }

    static showError(message) {
        const error = document.createElement('div');
        error.className = 'error-banner';
        error.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            ${message}
        `;
        document.body.prepend(error);
        setTimeout(() => error.remove(), 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => AcademicArchive.init());
