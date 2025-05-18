// Add CORS support
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Enhanced search endpoint
app.post('/api/search', (req, res) => {
    const { query, category } = req.body;
    
    // Sample response with video URLs
    res.json({
        results: [{
            id: 1,
            title: 'Sample Video 1',
            duration: '02:00:00',
            rating: 4.5,
            thumbnail: 'https://via.placeholder.com/300x169',
            videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        }]
    });
});

// Enhanced content endpoint
app.get('/api/content/:id', (req, res) => {
    res.json({
        id: 1,
        title: 'Sample Video 1',
        description: 'Sample description text',
        tags: ['tag1', 'tag2'],
        videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    });
});
