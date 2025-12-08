let allArtworks = [];

fetch('../JSON/myartworks.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load artworks data');
        }
        return response.json();
    })
    .then(data => {
        allArtworks = data.artworks;
        displayAllArtworks();
        document.getElementById('artwork-msg').textContent = `${allArtworks.length} artworks displayed`;
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('artwork-msg').textContent = 'Unable to load artworks data';
        document.getElementById('artwork-msg').style.color = '#d9534f';
    });

function displayAllArtworks() {
    const gallery = document.getElementById('artwork-gallery');
    gallery.innerHTML = ''; 

    allArtworks.forEach(artwork => {
        const card = createArtworkCard(artwork);
        gallery.appendChild(card);
    });
}

function createArtworkCard(artwork) {
    const card = document.createElement('div');
    card.className = 'artwork-card';

    const img = document.createElement('img');
    img.src = artwork.image;
    img.alt = artwork.title;
    img.className = 'artwork-img';

    const title = document.createElement('h3');
    title.className = 'artwork-title';
    title.textContent = artwork.title;

    const year = document.createElement('p');
    year.style.fontFamily = "'Garamond'";
    year.style.fontSize = '14px';
    year.style.color = '#D6C0B3';
    year.style.padding = '0 15px';
    year.style.margin = '0';
    year.textContent = `Year: ${artwork.year}`;

    const description = document.createElement('p');
    description.className = 'artwork-desc';
    description.textContent = artwork.description;

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(year);
    card.appendChild(description);

    return card;
}

document.getElementById('random-artwork-btn').addEventListener('click', function() {
    if (allArtworks.length === 0) {
        document.getElementById('artwork-msg').textContent = 'No artworks available';
        return;
    }

    const randomIndex = Math.floor(Math.random() * allArtworks.length);
    const randomArtwork = allArtworks[randomIndex];

    const gallery = document.getElementById('artwork-gallery');
    gallery.innerHTML = '';

    const card = createArtworkCard(randomArtwork);
    gallery.appendChild(card);

    document.getElementById('artwork-msg').textContent = `Random Selection: "${randomArtwork.title}" (${randomArtwork.year})`;
    document.getElementById('artwork-msg').style.color = '#7B4B2A';
});
