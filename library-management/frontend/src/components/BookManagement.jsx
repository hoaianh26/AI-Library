import { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';

function BookManagement() {
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
    <>
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

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <table className="w-full text-left">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="p-6 text-sm font-semibold text-slate-600">Cover</th>
                <th className="p-6 text-sm font-semibold text-slate-600">Title</th>
                <th className="p-6 text-sm font-semibold text-slate-600">Author</th>
                <th className="p-6 text-sm font-semibold text-slate-600">Year</th>
                <th className="p-6 text-sm font-semibold text-slate-600">Date Added</th>
                <th className="p-6 text-sm font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book._id} className="border-b border-slate-200 last:border-0 hover:bg-slate-50/50 transition-colors duration-200">
                  <td className="p-4">
                    <img
                      src={book.imageUrl ? `${API_URL}${book.imageUrl}` : 'https://via.placeholder.com/80x120/6366f1/white?text=No+Cover'}
                      alt={book.title}
                      className="w-12 h-auto object-cover rounded-md shadow-sm"
                    />
                  </td>
                  <td className="p-4 font-semibold text-slate-800">{book.title}</td>
                  <td className="p-4 text-slate-600">{book.author}</td>
                  <td className="p-4 text-slate-600">{book.publishedYear}</td>
                  <td className="p-4 text-slate-500 text-sm">
                    {new Date(book.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      {book.htmlContentPath && (
                        <a
                          href={`${API_URL}${book.htmlContentPath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-3 py-2 rounded-lg hover:from-indigo-200 hover:to-purple-200 transition-all duration-300 font-semibold text-xs shadow-sm"
                        >
                          Read
                        </a>
                      )}
                      <button
                        onClick={() => handleEditBook(book)}
                        className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 px-3 py-2 rounded-lg hover:from-amber-200 hover:to-orange-200 transition-all duration-300 font-semibold text-xs shadow-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book._id)}
                        className="bg-gradient-to-r from-red-100 to-rose-100 text-red-700 px-3 py-2 rounded-lg hover:from-red-200 hover:to-rose-200 transition-all duration-300 font-semibold text-xs shadow-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {books.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2">Your library is empty</h3>
            <p className="text-slate-500">Start by adding your first book!</p>
          </div>
        )}
      </div>
    </>
  );
}

export default BookManagement;
