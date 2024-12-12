import { useState, useEffect, useCallback } from 'react';
import './App.css';
import snapNewsLogo from './assets/snapnews-logo.png'; // Add your logo file

const CATEGORIES = [
  { id: 'general', label: 'General' },
  { id: 'business', label: 'Business' },
  { id: 'technology', label: 'Technology' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'sports', label: 'Sports' },
  { id: 'science', label: 'Science' },
  { id: 'health', label: 'Health' }
];


const LoadingScreen = () => (
  <div className="loading">
    <img 
      src={snapNewsLogo} 
      alt="SnapNews Logo" 
      className="loading-logo"
    />
  </div>
);

function App() {
  const [news, setNews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('general');

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching news for category:', category);
      const response = await fetch(`http://localhost:5000/api/news?category=${category}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.articles && Array.isArray(data.articles)) {
        setNews(data.articles);
        setCurrentIndex(0);
      } else {
        console.error('Invalid data format:', data);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleScroll = (e) => {
    if (e.deltaY > 0 && currentIndex < news.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (e.deltaY < 0 && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleCategoryChange = (newCategory) => {
    console.log('Changing category to:', newCategory);
    setCategory(newCategory);
  };

  const handleSourceClick = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener noreferrer');
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="app" onWheel={handleScroll}>
      <div className="categories-container">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`category-button ${category === cat.id ? 'active' : ''}`}
            onClick={() => handleCategoryChange(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>
      {news.length > 0 && (
        <div className="story-container">
          <div className="story-card">
            <h2 className="title">{news[currentIndex].title}</h2>
            <div className="image-container">
              {news[currentIndex].urlToImage ? (
                <img 
                  src={news[currentIndex].urlToImage} 
                  alt={news[currentIndex].title} 
                  className="news-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.parentElement.innerHTML = '<div class="placeholder-image">No image available</div>';
                  }}
                />
              ) : (
                <div className="placeholder-image">No image available</div>
              )}
            </div>
            <p className="explanation">
              {news[currentIndex].summary || news[currentIndex].description || 'No summary available'}
            </p>
            <div className="metadata">
              <p className="source">
                Source:{' '}
                <a 
                  href={news[currentIndex].url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="source-link"
                >
                  {news[currentIndex].source?.name || 'Unknown'}
                </a>
              </p>
              <p className="date">
                Date: {new Date(news[currentIndex].publishedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;