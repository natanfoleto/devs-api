const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

const devs = [];

const GITHUB_URL = "https://api.github.com/users";
const VIACEP_URL = "https://viacep.com.br/ws";

async function getUserFromGithub(username) {
  try {
    const { data } = await axios.get(`${GITHUB_URL}/${username}`);

    return data;
  } catch (error) {
    console.log(error.response.data);
  }
}

async function getAddressByCep(cep) {
  try {
    const { data } = await axios.get(`${VIACEP_URL}/${cep}/json`);

    return data;
  } catch (error) {
    console.log(error.response.data);
  }
}

app.post("/devs", async (req, res) => {
  const { username, cep } = req.body;

  const devAlreadyExists = devs.some((dev) => dev.username === username);

  if (devAlreadyExists) {
    return res
      .status(400)
      .json({ message: "Já existe um dev com esse username!" });
  }

  const user = await getUserFromGithub(username);

  if (!user) {
    return res
      .status(400)
      .json({ message: "Usuário não encontrado no Github!" });
  }

  const address = await getAddressByCep(cep);

  if (!address) {
    return res.status(400).json({ message: "Por favor insira um CEP válido!" });
  }

  const dev = {
    id: user.id,
    name: user.name,
    username,
    address: {
      cep: address.cep,
      street: address.logradouro,
      complement: address.complemento,
      neighborhood: address.bairro,
      city: address.cidade,
      state: address.uf,
    },
  };

  devs.push(dev);

  return res.status(201).json({
    message: "Dev criado com sucesso!",
    dev,
  });
});

app.get("/devs", (req, res) => {
  return res.json(devs);
});

app.get("/devs/:username", async (req, res) => {
  const { username } = req.params;

  const dev = devs.find((dev) => dev.username === username);

  if (!dev) {
    return res
      .status(400)
      .json({ message: "Nenhum dev encontrado com esse username!" });
  }

  const user = await getUserFromGithub(username);

  return res.json({
    dev,
    github: {
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
    },
  });
});

app.listen(3333);
