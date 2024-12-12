const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { SummarizerManager } = require('node-summarizer');
require('dotenv').config();

const app = express();
app.use(cors());

// Use environment variable instead of hardcoded API key
const API_KEY = process.env.NEWS_API_KEY;
const PORT = process.env.PORT || 5000;

const summarizer = new SummarizerManager();

// Rest of your code remains the same
const getSummary = async (text, sentences = 2) => {
  if (!text) return '';
  try {
    const result = await summarizer.summarize(text, sentences);
    return result.summary;
  } catch (error) {
    return text.split(' ').slice(0, 50).join(' ') + '...';
  }
};

app.get('/api/news', async (req, res) => {
  const category = req.query.category || 'general';
  console.log('Fetching news for category:', category);
  
  try {
    const response = await axios.get(
      `https://newsapi.org/v2/top-headlines`, {
        params: {
          country: 'us',
          category: category,
          apiKey: API_KEY
        }
      }
    );

    const processedArticles = await Promise.all(
      response.data.articles.map(async (article) => {
        const fullText = article.content || article.description || '';
        const summary = await getSummary(fullText);
        return {
          ...article,
          summary
        };
      })
    );

    res.json({ ...response.data, articles: processedArticles });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// const express = require('express');
// const cors = require('cors');
// const axios = require('axios');
// const { SummarizerManager } = require('node-summarizer');
// require('dotenv').config();

// const app = express();
// app.use(cors());

// const API_KEY = '2ebc5b505303468e85cd26cef759fb02';
// const summarizer = new SummarizerManager();

// const getSummary = async (text, sentences = 2) => {
//   if (!text) return '';
//   try {
//     const result = await summarizer.summarize(text, sentences);
//     return result.summary;
//   } catch (error) {
//     return text.split(' ').slice(0, 50).join(' ') + '...';
//   }
// };

// app.get('/api/news', async (req, res) => {
//   const category = req.query.category || 'general';
//   console.log('Fetching news for category:', category); // Debug log
  
//   try {
//     const response = await axios.get(
//       `https://newsapi.org/v2/top-headlines`, {
//         params: {
//           country: 'us',
//           category: category,
//           apiKey: API_KEY
//         }
//       }
//     );

//     const processedArticles = await Promise.all(
//       response.data.articles.map(async (article) => {
//         const fullText = article.content || article.description || '';
//         const summary = await getSummary(fullText);
//         return {
//           ...article,
//           summary
//         };
//       })
//     );

//     res.json({ ...response.data, articles: processedArticles });
//   } catch (error) {
//     console.error('Error fetching news:', error); // Debug log
//     res.status(500).json({ error: error.message });
//   }
// });

// app.listen(5000, () => {
//   console.log('Server running on port 5000');
// });