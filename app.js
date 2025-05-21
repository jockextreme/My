class AcademicArchive {
    static config = {
        api: 'https://kaiz-apis.gleeze.com/api/lootedpinay?limit=5&apikey=0acad241-6a34-4516-bcc6-310a137e6357',
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
        this.loadContent();
        this.initModal();
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
            if (!response.ok) throw new Error('Failed to load content');
            const data = await response.json();
            this.currentVideos = data.videos;
            this.renderVideos(data.videos);
        } catch (error) {
            this.showError(error.message);
        }
    }

    static getVideoData(videoKey) {
        const storage = this.getStorage();
        return storage.videos[videoKey] || {
            likes: 0,
            comments: [],
            views: 0,
            lastViewed: null,
            bookmarked: false
        };
    }

    static updateVideoData(videoKey, updateFn) {
        const storage = this.getStorage();
        storage.videos[videoKey] = updateFn(this.getVideoData(videoKey));
        this.updateStorage(storage);
    }

    static renderVideos(videos) {
        const container = document.getElementById('videoContainer');
        const storage = this.getStorage();
        
        container.innerHTML = videos.map(video => {
            const videoKey = btoa(video.mp4url);
            const videoData = this.getVideoData(videoKey);
            
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
                        <h3 class="video-title">${video.title}</h3>
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
        this.updateVideoData(videoKey, data => ({
            ...data,
            likes: data.likes ? 0 : 1
        }));
        this.renderVideos(this.currentVideos);
    }

    static addComment(videoKey, form) {
        const input = form.querySelector('.comment-input');
        const text = input.value.trim();
        if (!text) return false;

        this.updateVideoData(videoKey, data => ({
            ...data,
            comments: [
                ...data.comments,
                {
                    id: Date.now(),
                    text: text,
                    timestamp: new Date().toISOString()
                }
            ]
        }));
        input.value = '';
        this.renderVideos(this.currentVideos);
        return false;
    }

    static deleteComment(videoKey, commentId) {
        this.updateVideoData(videoKey, data => ({
            ...data,
            comments: data.comments.filter(c => c.id !== commentId)
        }));
        this.renderVideos(this.currentVideos);
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
        const videoData = this.getVideoData(videoKey);
        
        this.updateVideoData(videoKey, data => ({
            ...data,
            views: data.views + 1,
            lastViewed: new Date().toISOString()
        }));

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
