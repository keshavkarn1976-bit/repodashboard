require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

const GITHUB_USERNAME = 'keshavkarn1976-bit';
const GITHUB_PAGES_BASE = `https://${GITHUB_USERNAME}.github.io`;

const REPOS = [
  { repo: 'training-github', display_name: 'GitHub Training Portal', topic: 'GitHub' },
  { repo: 'training-docker', display_name: 'Docker Training Portal', topic: 'Docker' },
  { repo: 'training-kubernetes', display_name: 'Kubernetes Training Portal', topic: 'Kubernetes' },
  { repo: 'training-cloud', display_name: 'Cloud Training Portal', topic: 'Cloud' },
  { repo: 'training-devops', display_name: 'DevOps Training Portal', topic: 'DevOps' },
];

async function checkRepoStatus(repoName) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'repo-dashboard',
        },
      }
    );

    if (response.status === 200) return 'Live';
    if (response.status === 404) return 'Offline';
    return 'Offline';
  } catch (err) {
    console.error(`Error checking GitHub status for ${repoName}:`, err.message);
    return 'Offline';
  }
}

async function countCourses(topic) {
  try {
    const url = `${process.env.SUPABASE_URL}/rest/v1/trainingdata?select=tech&tech=eq.${encodeURIComponent(topic)}`;
    const response = await fetch(url, {
      headers: {
        apikey: process.env.SUPABASE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_KEY}`,
      },
    });

    if (!response.ok) {
      console.error(`Supabase error for topic ${topic}: ${response.status}`);
      return 0;
    }

    const data = await response.json();
    return Array.isArray(data) ? data.length : 0;
  } catch (err) {
    console.error(`Error counting courses for ${topic}:`, err.message);
    return 0;
  }
}

async function getRepoInfo(repoConfig) {
  const { repo, display_name, topic } = repoConfig;

  const [status, courses] = await Promise.all([
    checkRepoStatus(repo),
    countCourses(topic),
  ]);

  return {
    repo,
    display_name,
    topic,
    status,
    courses,
    url: `${GITHUB_PAGES_BASE}/${repo}`,
  };
}

app.get('/api/repos', async (req, res) => {
  try {
    const results = await Promise.all(
      REPOS.map((repoConfig) =>
        getRepoInfo(repoConfig).catch((err) => {
          console.error(`Unexpected error processing ${repoConfig.repo}:`, err.message);
          return {
            repo: repoConfig.repo,
            display_name: repoConfig.display_name,
            topic: repoConfig.topic,
            status: 'Offline',
            courses: 0,
            url: `${GITHUB_PAGES_BASE}/${repoConfig.repo}`,
          };
        })
      )
    );

    res.json(results);
  } catch (err) {
    console.error('Error in /api/repos:', err.message);
    res.status(500).json({ error: 'Failed to fetch repo data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
