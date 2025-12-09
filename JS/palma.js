async function loadRandomBooks() {
  try {
    const response = await fetch("https://openlibrary.org/subjects/fiction.json?limit=50");
    const data = await response.json();
    const works = data.works;

    // Pick 3 random unique books
    const selectedBooks = [];
    while (selectedBooks.length < 5 && selectedBooks.length < works.length) {
      const randomBook = works[Math.floor(Math.random() * works.length)];
      if (!selectedBooks.includes(randomBook)) selectedBooks.push(randomBook);
    }

    const container = document.getElementById("random-book");
    container.innerHTML = ""; 

    selectedBooks.forEach(book => {
      const title = book.title || "Unknown Title";
      const author = book.authors?.[0]?.name || "Unknown Author";
      const coverId = book.cover_id;
      const cover = coverId
        ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
        : "https://via.placeholder.com/180x260?text=No+Cover";

      container.innerHTML += `
        <div class="book-card">
          <img src="${cover}" alt="${title}" />
          <h3>${title}</h3>
          <p>${author}</p>
        </div>
      `;
    });
  } catch (err) {
    console.error(err);
  }
}

// TOP 5 BOOK PICKS
const topBooks = [
  { title: "Harry Potter and the Prisoner of Azkaban", author: "" },
  { title: "To Kill a Mockingbird" },
  { title: "The Da Vinci Code" },
  { title: "Angels & Demons", author: "Dan Brown" },
  { title: "Sherlock Holmes" }
];

async function loadTopBooks() {
  const container = document.getElementById("top-books");
  container.innerHTML = "";

  for (const bookItem of topBooks) {
    let bookTitle = bookItem.title;
    let bookAuthor = bookItem.author || "";

    if (!bookAuthor) {
      try {
        const response = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(bookTitle)}`);
        const data = await response.json();
        if (data.docs.length > 0) {
          bookAuthor = data.docs[0].author_name?.[0] || "Unknown Author";
        } else {
          bookAuthor = "Unknown Author";
        }
      } catch (err) {
        console.error(err);
        bookAuthor = "Unknown Author";
      }
    }

    let cover = "https://via.placeholder.com/180x260?text=No+Cover";
    try {
      const response = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(bookTitle)}`);
      const data = await response.json();
      if (data.docs.length > 0 && data.docs[0].cover_i) {
        cover = `https://covers.openlibrary.org/b/id/${data.docs[0].cover_i}-L.jpg`;
      }
    } catch (err) {
      console.error(err);
    }

    container.innerHTML += `
      <div class="book-card">
        <img src="${cover}" alt="${bookTitle}" />
        <h3>${bookTitle}</h3>
        <p>${bookAuthor}</p>
      </div>
    `;
  }
}

loadRandomBooks();
loadTopBooks();
