const express = require('express')
const axios = require('axios')

const app = express()

app.use(express.json())

const devs = []

const GITHUB_URL = "https://api.github.com/users"

async function getUserFromGithub(username) {
  const { data } = await axios.get(`${GITHUB_URL}/${username}`)

  return data;
}

app.post('/devs', async (req, res) => {
  try {
    const { username } = req.body

    const devAlreadyExists = devs.some(dev => dev.username === username);

    if (devAlreadyExists) {
      return res.status(400).json({ message: "Já existe um dev com esse usuário!" })
    }

    const user = await getUserFromGithub(username)

    devs.push({
      id: user.id,
      name: user.name,
      username
    })

    return res.status(201).json({ 
      message: "Dev criado com sucesso!" 
    })
  } catch (error) {
    return res.status(400).json({ 
      message: error.response.data.message 
    })
  }
})

app.get('/devs', (req, res) => {
  return res.json(devs)
})

app.get('/devs/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const user = await getUserFromGithub(username)

    return res.json({
      id: user.id,
      name: user.name,
      username: user.login,
      type: user.type,
      name: user.name,
      company: user.company,
      blog: user.blog,
      location: user.location,
      email: user.email,
      bio: user.bio,
      twitterUsername: user.twitter_username,
      publicRepos: user.public_repos,
      followers: user.followers,
      following: user.following,
      createdAt: user.created_at,
    })
  } catch (error) {
    return res.status(400).json({ 
      message: error.response.data.message 
    })
  }
})

app.listen(3333)