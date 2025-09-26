
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBook, updateBook } from '../services/bookService';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../constants/categories';

const EditBook = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");
  const [categories, setCategories] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [selectedZipFile, setSelectedZipFile] = useState(null);
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const API_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const data = await getBook(id);
        setTitle(data.title);
        setAuthor(data.author);
        setYear(data.publishedYear);
        setCategories(data.categories || []);
        setImageUrl(data.imageUrl || "");
      } catch (err) {
        console.error(err);
      }
    };
    fetchBook();
  }, [id]);

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

    let uploadedHtmlContentPath = null;

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
      categories: categories,
      imageUrl: uploadedImageUrl,
      htmlContentPath: uploadedHtmlContentPath,
    };

    try {
      await updateBook(id, bookData);
      navigate(`/books/${id}`);
    } catch (err) {
      console.error("Error updating book:", err);
    }
  };

  const handleCategoryChange = (category) => {
    setCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 pt-24 px-6">
      <div className="max-w-lg mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50"
        >
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Edit Book
          </h2>
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
              <label className="block text-sm font-semibold text-slate-700 mb-2">Categories</label>
              <div className="max-h-40 overflow-y-auto p-4 border-2 border-slate-200 rounded-2xl bg-white/80">
                <div className="grid grid-cols-2 gap-4">
                  {CATEGORIES.map(category => (
                    <label key={category} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={categories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-slate-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
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
              Update Book
            </button>
            <button
              type="button"
              onClick={() => navigate(`/books/${id}`)}
              className="px-6 bg-gradient-to-r from-slate-400 to-slate-500 text-white p-4 rounded-2xl hover:from-slate-500 hover:to-slate-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBook;
