import { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import UserList from './UserList';

function AdminDashboard() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [selectedZipFile, setSelectedZipFile] = useState(null);
  const [editingBook, setEditingBook] = useState(null);

  const { token } = useAuth();

  const API_URL = "http://localhost:5000";

  // Fetch books from backend
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch(`${API_URL}/api/books`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setBooks(data);
      } catch (err) {
        console.error("Error fetching books:", err);
      }
    };

    if (token) {
      fetchBooks();
    }
  }, [token]);

  const handleImageFileChange = (e) => {
    setSelectedImageFile(e.target.files[0]);
  };

  const handleZipFileChange = (e) => {
    setSelectedZipFile(e.target.files[0]);
  };

  const handleUpload = async (file, fileType) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.fileType === fileType) {
        return data.filePath;
      } else {
        console.error("Uploaded file type mismatch.", data);
        return null;
      }
    } catch (err) {
      console.error(`Error uploading ${fileType} file:`, err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !author || !year) {
      alert("Please fill in all fields");
      return;
    }

    let uploadedImageUrl = imageUrl;
    if (selectedImageFile) {
      const filePath = await handleUpload(selectedImageFile, 'image');
      if (filePath) {
        uploadedImageUrl = filePath;
      }
    }

    let uploadedHtmlContentPath = editingBook ? editingBook.htmlContentPath : null;

    if (selectedZipFile) {
      const filePath = await handleUpload(selectedZipFile, 'zip');
      if (filePath) {
        uploadedHtmlContentPath = filePath;
      }
    }

    const bookData = {
      title,
      author,
      publishedYear: year,
      imageUrl: uploadedImageUrl,
      htmlContentPath: uploadedHtmlContentPath,
    };

    try {
      const res = await fetch(
        editingBook ? `${API_URL}/api/books/${editingBook._id}` : `${API_URL}/api/books`,
        {
          method: editingBook ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bookData),
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const responseData = await res.json();

      if (editingBook) {
        setBooks(books.map((book) =>
          book._id === editingBook._id ? responseData : book
        ));
        setEditingBook(null);
      } else {
        setBooks([...books, responseData]);
      }

    } catch (err) {
      console.error("Error saving book:", err);
    }

    setTitle("");
    setAuthor("");
    setYear("");
    setImageUrl("");
    setSelectedImageFile(null);
    setSelectedZipFile(null);
  };

  const handleDeleteBook = async (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        const res = await fetch(`${API_URL}/api/books/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        setBooks(books.filter((book) => book._id !== id));
      } catch (err) {
        console.error("Error deleting book:", err);
      }
    }
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setYear(book.publishedYear);
    setImageUrl(book.imageUrl || "");
  };

  return (
    <div className="pt-24 px-6 w-full">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-300/20 to-cyan-300/20 rounded-full blur-3xl"></div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto mb-12 relative z-10"
      >
        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-500 hover:bg-white/80">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {editingBook ? "✏️" : "➕"}
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {editingBook ? "Edit Book" : "Add New Book"}
            </h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Book Title</label>
              <input
                type="text"
                placeholder="Enter book title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border-2 border-slate-200 p-4 rounded-2xl bg-white/80 focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Author</label>
              <input
                type="text"
                placeholder="Enter author name..."
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full border-2 border-slate-200 p-4 rounded-2xl bg-white/80 focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Published Year</label>
              <input
                type="number"
                placeholder="2024"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full border-2 border-slate-200 p-4 rounded-2xl bg-white/80 focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Book Cover Image</label>
              <input
                type="file"
                onChange={handleImageFileChange}
                className="w-full border-2 border-slate-200 p-4 rounded-2xl bg-white/80 focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-indigo-500 file:to-purple-600 file:text-white file:font-semibold hover:file:from-indigo-600 hover:file:to-purple-700"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Book Content (HTML Zip)</label>
              <input
                type="file"
                onChange={handleZipFileChange}
                className="w-full border-2 border-slate-200 p-4 rounded-2xl bg-white/80 focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-indigo-500 file:to-purple-600 file:text-white file:font-semibold hover:file:from-indigo-600 hover:file:to-purple-700"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-2xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {editingBook ? "Update Book" : "➕ Add Book"}
            </button>
            {editingBook && (
              <button
                type="button"
                onClick={() => {
                  setEditingBook(null);
                  setTitle("");
                  setAuthor("");
                  setYear("");
                  setImageUrl("");
                  setSelectedImageFile(null);
                  setSelectedZipFile(null);
                }}
                className="px-6 bg-gradient-to-r from-slate-400 to-slate-500 text-white p-4 rounded-2xl hover:from-slate-500 hover:to-slate-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
            📚 Book Management
          </h2>
          <p className="text-slate-600 text-lg">
            Manage your digital library. You have ${books.length} books.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {books.map((book, index) => (
            <div
              key={book._id}
              className="group relative bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/80 flex flex-col w-full"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={book.imageUrl ? `${API_URL}${book.imageUrl}` : 'https://via.placeholder.com/300x400/6366f1/white?text=No+Cover'}
                  alt={book.title}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex-grow">
                  <h3 className="font-bold text-xl text-slate-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300">
                    {book.title}
                  </h3>
                  <p className="text-slate-600 font-medium mb-1">by {book.author}</p>
                  <p className="text-slate-500 text-sm mb-2">Published {book.publishedYear}</p>
                  <p className="text-slate-400 text-xs">
                    Added {new Date(book.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                {book.htmlContentPath && (
                  <a
                    href={`${API_URL}${book.htmlContentPath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 text-indigo-600 hover:text-indigo-700 font-semibold text-sm transition-colors duration-300"
                  >
                    <span>📖 Read Online</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                )}

                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => handleEditBook(book)}
                    className="flex-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-xl hover:from-amber-500 hover:to-orange-600 transition-all duration-300 font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBook(book._id)}
                    className="flex-1 bg-gradient-to-r from-red-400 to-rose-500 text-white px-4 py-2 rounded-xl hover:from-red-500 hover:to-rose-600 transition-all duration-300 font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {books.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2">Your library is empty</h3>
            <p className="text-slate-500">Start by adding your first book!</p>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto relative z-10 mt-12">
        <UserList />
      </div>
    </div>
  );
}

export default AdminDashboard;
