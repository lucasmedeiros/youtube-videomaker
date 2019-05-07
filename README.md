# youtube-videomaker
Automatização de criação de vídeos para o YouTube

# Credentials

Crie uma pasta `/credentials`, e, dentro dela, crie um arquivo chamado `index.js` para suas credenciais do [Algorithmia](https://algorithmia.com/), do [IBM Watson - Natural Language Understanding](https://www.ibm.com/watson/services/natural-language-understanding/) e da sua [Search Engine customizada do Google Images](https://developers.google.com/custom-search/docs/tutorial/introduction).

Esta arquivo deverá seguir o seguinte modelo:

```js
const credentials = {
  algorithmiaCredentials: {
    apiKey: 'API KEY DO ALGORITHMIA',
  },

  watsonCredentials: {
    apikey: 'API KEY DO NATURAL LANGUAGE UNDERSTANDING DO WATSON',
  },

  googleSearchCredentials: {
    apiKey: 'API KEY DO GOOGLE',
    searchEngineID: 'O ID DA SUA SEARCH ENGINE',
  }
}

module.exports = credentials;
```