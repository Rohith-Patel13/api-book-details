const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
//console.log(app.use(express.json()));
const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      book
    ORDER BY
      book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

//Get Book API
/*The colon : is used before bookId in the path to indicate
 that it is a variable or a parameter, allowing the server to capture
  and use the specific value provided in the URL for that parameter.  
*/
app.get("/books/:bookId/", async (request, response) => {
  //console.log(request);
  //console.log(request.params); //output: { bookId: '1' }
  const { bookId } = request.params;
  const getBookQuery = `
    SELECT
        *
    FROM
        book
    WHERE
        book_id = ${bookId};`;
  const booksArray = await db.get(getBookQuery);
  /*
  nodemon is a tool that helps by automatically restart the server
  whenever we make changes the file.
  install command below:npm install -g nodemon
  */
  console.log("Nodemon is working properly");
  response.send(booksArray);
});

app.post("/books/", async (request, response) => {
  const requestBody = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const addBookQuery = `
    INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`;
  const dbResponse = await db.run(addBookQuery);
  console.log(dbResponse);
  const BookId = dbResponse.lastID;
  response.send({ bookId: bookId });
  //console.log(requestBody);
});
