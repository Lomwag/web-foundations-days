# Library Books REST API Design

## Overview

This document describes a REST API for managing books in a library system.

Base URL: `/api/books`

### 1. List all books

- **Method:** GET
- **Endpoint:** `/api/books`
- **Description:** Returns all books.
- **Success response:** `200 OK`

### 2. Get a book by ID

- **Method:** GET
- **Endpoint:** `/api/books/{id}`
- **Description:** Returns details of a specific book.
- **Success response:** `200 OK`
- **Error response:** `404 Not Found` if the book does not exist.

### 3. Create a new book

- **Method:** POST
- **Endpoint:** `/api/books`
- **Description:** Adds a new book to the library.
- **Example request body:**

```json
{
  "title": "Things Fall Apart",
  "author": "Chinua Achebe",
  "publishedYear": 1958
}
```

- **Success response:** `201 Created`
- **Error response:** `400 Bad Request` if required fields are missing or invalid.

### 4. Update a book

- **Method:** PUT
- **Endpoint:** `/api/books/{id}`
- **Description:** Replaces the details of an existing book.
- **Example request body:**

```json
{
  "title": "Things Fall Apart",
  "author": "Chinua Achebe",
  "publishedYear": 1958
}
```

- **Success response:** `200 OK`
- **Error response:** `404 Not Found` if the book does not exist.

### 5. Delete a book

- **Method:** DELETE
- **Endpoint:** `/api/books/{id}`
- **Description:** Deletes a specific book.
- **Success response:** `204 No Content`
- **Error response:** `404 Not Found` if the book does not exist.

### 6. Search books by author

- **Method:** GET
- **Endpoint:** `/api/books?author={authorName}`
- **Description:** Returns books written by the specified author.
- **Example:** `/api/books?author=Chinua%20Achebe`
- **Success response:** `200 OK`

## Error Handling

### 400 Bad Request

Returned when a request contains invalid data, such as a missing title or an invalid publication year.

Example:

```json
{
  "error": "Bad Request",
  "message": "The title field is required."
}
```

### 404 Not Found

Returned when a requested book ID does not exist.

Example:

```json
{
  "error": "Not Found",
  "message": "The requested book was not found."
}