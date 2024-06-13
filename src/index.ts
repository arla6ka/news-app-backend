import express from 'express';
import mongoose from 'mongoose';
import axios from 'axios';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());


mongoose.connect('mongodb+srv://arl:arl@cluster1.unitqkr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1');


const articleSchema = new mongoose.Schema({
  title: String,
  url: String,
  abstract: String,
  published_date: Date,
});

const Article = mongoose.model('Article', articleSchema);


const fetchArticles = async () => {
  try {
    const response = await axios.get('https://api.nytimes.com/svc/topstories/v2/world.json?api-key=ubr6SS3nGeJ2n434ESkg7WGLWn9fpXgE');

    const articles = response.data.results.map((article: any) => ({
      title: article.title,
      url: article.url,
      abstract: article.abstract,
      published_date: new Date(article.published_date),
    }));

    console.log('Fetched Articles:', articles);

    await Article.insertMany(articles);
    console.log('Articles fetched and saved.');
  } catch (error) {
    console.error('Error fetching articles:', error);
  }
};


import cron from 'node-cron';
cron.schedule('*/5 * * * *', fetchArticles);

app.get('/api/articles', async (req, res) => {
  try {
    const articles = await Article.find().sort({ published_date: -1 }).limit(10);
    console.log('Retrieved Articles:', articles);
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
