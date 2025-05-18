// Updated performSearch function
async function performSearch() {
    const query = $('#searchInput').val().trim();
    const category = $('#filterCategory').val();
    
    if (!query) {
        showError('Please enter a search query');
        return;
    }

    showLoading();
    try {
        const response = await $.ajax({
            url: `${API_ENDPOINT}/search`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ 
                query: query,
                category: category 
            })
        });

        if (!response.results || response.results.length === 0) {
            showError('No results found');
            return;
        }

        renderContent(response.results);
    } catch (error) {
        showError(`Search failed: ${error.statusText || 'Server error'}`);
    } finally {
        hideLoading();
    }
}

// Updated video rendering
function showDetails() {
    const contentId = $(this).data('id');
    showLoading();
    
    $.when(
        $.get(`${API_ENDPOINT}/content/${contentId}`),
        $.get(`${API_ENDPOINT}/comments/${contentId}`)
    ).then(([details, comments]) => {
        $('#modalTitle').text(details.title);
        $('#modalContent').html(`
            <div class="video-container">
                <video controls autoplay>
                    <source src="${details.videoUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>
            <div class="content mt-4">
                <p class="subtitle is-6">${details.description}</p>
                <div class="tags">${details.tags.map(t => 
                    `<span class="tag is-primary">${t}</span>`
                ).join('')}</div>
            </div>
        `);
        
        renderComments(comments);
        $('#commentsSection').show();
        $('#detailModal').addClass('is-active');
    }).fail((error) => {
        showError(`Failed to load content: ${error.statusText}`);
    }).always(() => {
        hideLoading();
    });
}

// Enhanced error handling
function showError(message) {
    $('#errorContainer')
        .text(message)
        .removeClass('is-hidden')
        .delay(5000)
        .fadeOut(() => $(this).addClass('is-hidden'));
}

// Loading indicators
function showLoading() {
    $('.loading-overlay').css('display', 'flex');
}

function hideLoading() {
    $('.loading-overlay').hide();
}
