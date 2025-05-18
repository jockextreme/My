// app.js
$(document).ready(function() {
    const API_ENDPOINT = 'http://localhost:3000/api';
    let currentUser = null;

    // Authentication
    $('#loginBtn').click(() => showAuthModal('login'));
    $('#signupBtn').click(() => showAuthModal('signup'));

    // Search functionality
    $('#searchBtn').click(performSearch);
    $('#searchInput').keypress(e => e.key === 'Enter' && performSearch());

    // Modal handling
    $('.modal .delete, .modal-background').click(closeModal);

    // Comment system
    $('#submitComment').click(submitComment);
});

async function performSearch() {
    const query = $('#searchInput').val();
    const category = $('#filterCategory').val();
    
    showLoading();
    try {
        const response = await $.ajax({
            url: `${API_ENDPOINT}/search`,
            method: 'POST',
            data: { query, category }
        });
        renderContent(response.results);
    } catch (error) {
        showError('Search failed');
    } finally {
        hideLoading();
    }
}

function renderContent(items) {
    const feed = $('#contentFeed').empty();
    items.forEach(item => {
        const card = `
            <div class="column is-3">
                <div class="card content-card" data-id="${item.id}">
                    <div class="card-image">
                        <figure class="image is-16by9">
                            <img src="${item.thumbnail}">
                        </figure>
                    </div>
                    <div class="card-content">
                        <p class="title is-6">${item.title}</p>
                        <p class="subtitle is-7">${item.duration}</p>
                        <div class="stars">${renderStars(item.rating)}</div>
                    </div>
                </div>
            </div>
        `;
        feed.append(card);
    });
    $('.content-card').click(showDetails);
}

async function showDetails() {
    const contentId = $(this).data('id');
    showLoading();
    try {
        const [details, comments] = await Promise.all([
            $.get(`${API_ENDPOINT}/content/${contentId}`),
            $.get(`${API_ENDPOINT}/comments/${contentId}`)
        ]);
        
        $('#modalTitle').text(details.title);
        $('#modalContent').html(`
            <div class="video-player">
                <video controls src="${details.videoUrl}"></video>
            </div>
            <div class="content mt-3">
                <p>${details.description}</p>
                <div class="tags">${details.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
            </div>
        `);
        
        renderComments(comments);
        $('#commentsSection').show();
        $('#detailModal').addClass('is-active');
    } catch (error) {
        showError('Failed to load details');
    } finally {
        hideLoading();
    }
}

function renderComments(comments) {
    const list = $('#commentsList').empty();
    comments.forEach(comment => {
        list.append(`
            <div class="comment">
                <strong>${comment.user}</strong>
                <p>${comment.text}</p>
                <small>${new Date(comment.timestamp).toLocaleString()}</small>
            </div>
        `);
    });
}

// Utility functions
function showLoading() { $('.loading-overlay').show(); }
function hideLoading() { $('.loading-overlay').hide(); }
function showError(msg) { /* Error display logic */ }
function renderStars(rating) { /* Star rating display */ }
