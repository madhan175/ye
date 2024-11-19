document.addEventListener("DOMContentLoaded", () => {
    const quotes = [
        "Success is the sum of small efforts, repeated day in and day out.",
        "Believe in yourself and all that you are.",
        "The future belongs to those who believe in the beauty of their dreams."
    ];

    const totalTime = 60 * 30; // 30 minutes in seconds
    let progress = 0;
    let sessionTimer;
    let allVideos = [];
    let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

    // Display a random motivational quote
    function showQuote() {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        document.getElementById('motivationalQuote').textContent = randomQuote;
    }

    // Start the session timer
    function startTimer() {
        let timeLeft = totalTime;
        sessionTimer = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            document.getElementById('timerDisplay').textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
            progress = ((totalTime - timeLeft) / totalTime) * 100;
            document.getElementById('progressBar').style.width = progress + '%';

            if (timeLeft <= 0) {
                clearInterval(sessionTimer);
                alert("Session ended. Take a break!");
            }
        }, 1000);
    }

    // Reset the session
    function resetSession() {
        clearInterval(sessionTimer);
        progress = 0;
        document.getElementById('progressBar').style.width = '0%';
        document.getElementById('timerDisplay').textContent = '0:00';
    }

    // Toggle dark mode
    let isDarkMode = false;
    function toggleDarkMode() {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-mode', isDarkMode);
    }

    // Modal functionality
    function openModal(videoId) {
        const modal = document.getElementById('videoModal');
        const iframe = document.getElementById('videoPlayer');
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        modal.style.display = 'block';
    }

    function closeModal() {
        const modal = document.getElementById('videoModal');
        const iframe = document.getElementById('videoPlayer');
        iframe.src = '';
        modal.style.display = 'none';
    }

    // Display the videos with embedded player
    function displayVideos(videos) {
        const videoListContainer = document.getElementById('videoList');
        videoListContainer.innerHTML = '';

        videos.forEach(video => {
            const videoItem = document.createElement('div');
            videoItem.classList.add('video-item');

            const thumbnail = document.createElement('img');
            thumbnail.src = video.snippet.thumbnails.high.url;
            thumbnail.alt = video.snippet.title;
            videoItem.appendChild(thumbnail);

            const title = document.createElement('h3');
            title.textContent = video.snippet.title;
            videoItem.appendChild(title);

            const channelTitle = document.createElement('p');
            channelTitle.textContent = `Channel: ${video.snippet.channelTitle}`;
            videoItem.appendChild(channelTitle);

            // Add event listener to open modal with embedded player
            videoItem.addEventListener('click', () => openModal(video.id.videoId));

            videoListContainer.appendChild(videoItem);
        });
    }

    // Fetch videos
    function fetchVideos(query, pageToken = "") {
        const apiKey = "AIzaSyAqMN-eoBcNgYzPwxQf_fR_L2c4O18rbFI"; // Replace with your API key
        const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=10&pageToken=${pageToken}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const filteredVideos = data.items.filter(video => video.snippet.channelTitle !== "YouTube" && !video.snippet.title.toLowerCase().includes("shorts"));
                allVideos = allVideos.concat(filteredVideos);
                displayVideos(allVideos);

                // Enable "Load More" if there's a nextPageToken
                const loadMoreButton = document.getElementById('loadMore');
                if (data.nextPageToken) {
                    loadMoreButton.style.display = 'block';
                    loadMoreButton.onclick = () => fetchVideos(query, data.nextPageToken);
                } else {
                    loadMoreButton.style.display = 'none';
                }
            })
            .catch(error => {
                console.error("Error fetching YouTube data:", error);
                alert("Something went wrong with the YouTube search.");
            });
    }

    // Handle search
    function handleSearch() {
        const query = document.getElementById("searchQuery").value.trim();
        if (!query) {
            alert("Please enter a search term.");
            return;
        }

        allVideos = [];
        fetchVideos(query);

        // Save to search history
        if (!searchHistory.includes(query)) {
            searchHistory.push(query);
            localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
        }
    }

    // Display search history
    function displaySearchHistory() {
        const historyContainer = document.getElementById('searchHistory');
        historyContainer.innerHTML = '';

        searchHistory.forEach(query => {
            const historyItem = document.createElement('button');
            historyItem.textContent = query;
            historyItem.addEventListener('click', () => {
                document.getElementById("searchQuery").value = query;
                handleSearch();
            });
            historyContainer.appendChild(historyItem);
        });
    }

    // Initial setup
    showQuote();
    displaySearchHistory();

    document.getElementById('startSession').addEventListener('click', startTimer);
    document.getElementById('resetSession').addEventListener('click', resetSession);
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
    document.getElementById('searchButton').addEventListener('click', handleSearch);
    document.getElementById('closeModal').addEventListener('click', closeModal);
});
