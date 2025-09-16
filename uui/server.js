const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(express.static('public'));


app.get("/books", async function(request, response) {
    try {
        const books = await fetch(`http://localhost:3000/books`)
        .then(response => {
                if (!response.ok) {
                    throw new Error('Server error')
                }
                return response.json();
            });
        response.send(books)
        console.log(books)
        // response.json(books);
    } catch(error) {
        response.status(500).send("Internal error");
    }
});


app.get("/book/count", async function(request, response) {
    try {
        const status = request.query.status;
         const apiResponse = await fetch(`http://localhost:3000/books?status=${status}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Server error')
            }
            return response.json();
        });
        const filteredBooks = apiResponse.filter(book => book.status === status);
        response.json({
            count: filteredBooks.length,
            books: filteredBooks
        });
    } catch(error) {
        response.status(500).send("Internal error");
    }
});


app.get("/books/total", async function(request, response) {
    try {
        const apiResponse = await fetch(`http://localhost:3000/books`);
        if (!apiResponse.ok) {
            throw new Error('JSON Server error');
        }
        const books = await apiResponse.json();

        const totalCopies = books.reduce((sum, book) => sum + book.copies, 0);
        response.json({
            totalBooks: books.length,
            totalCopies: totalCopies
        });
    } catch(error) {
        response.status(500).send("Internal error");
    }
});


app.post("/book", async function(request, response) {
    try {
        let book = request.body;
        const apiResponse = await fetch(`http://localhost:3000/books`, {
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify(book)})
        // response.send("ok")

        const createdBook = await apiResponse.json();
        // book.id = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
        // books.push(book);
        response.json({ message: "Книга добавлена успешно", book: createdBook });
    } catch(error) {
        response.status(500).send("Internal error");
    }
});


app.patch("/book/:id", async function(request, response) {
    try {
        const id = request.params.id;
        // const index = books.findIndex(book => book.id === id);
        const bookData = request.body;

        const apiResponse = await fetch(`http://localhost:3000/books/${id}`, {
                    method: 'PATCH',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify(bookData)})
        
        let updatedBook = await apiResponse.json();
            response.json({ message: "Книга обновлена", book: updatedBook });
    } catch(error) {
        response.status(500).send("Internal error");
    }
});


app.delete("/book/:id", async function(request, response) {
    try {
        const id = request.params.id;
        
        const apiResponse = await fetch(`http://localhost:3000/books/${id}`, {
            method: 'DELETE'
        });

        response.json({ message: "Книга удалена" });
    } catch(error) {
        response.status(500).send("Internal error");
    }
});

app.get("/books/filter", async function(request, response) {
    try {
        const { author, genre, status, search } = request.query;

        const apiResponse = await fetch(`http://localhost:3000/books`);
        if (!apiResponse.ok) {
            throw new Error('JSON Server error');
        }


        let filteredBooks = await apiResponse.json();

        if (author) filteredBooks = filteredBooks.filter(book => 
            book.author.toLowerCase().includes(author.toLowerCase()));
        if (genre) filteredBooks = filteredBooks.filter(book => 
            book.genre.toLowerCase().includes(genre.toLowerCase()));
        if (status) filteredBooks = filteredBooks.filter(book => 
            book.status === status);
        if (search) filteredBooks = filteredBooks.filter(book => 
            book.name.toLowerCase().includes(search.toLowerCase()) ||
            book.author.toLowerCase().includes(search.toLowerCase()));

        response.json(filteredBooks);
    } catch(error) {
        response.status(500).send("Internal error");
    }
});

app.listen(4001, () => {
    console.log("Server running on port 4001");
});