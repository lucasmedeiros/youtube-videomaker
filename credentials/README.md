# Credentials

Aqui você deve criar um arquivo chamado `index.js` para suas credenciais do [Algorithmia](https://algorithmia.com/), do [IBM Watson - Natural Language Understanding](https://www.ibm.com/watson/services/natural-language-understanding/) e da sua [Search Engine customizada do Google Images](https://developers.google.com/custom-search/docs/tutorial/introduction). Este arquivo `index.js` está ocultado pelo `.gitignore` e não será enviado para o repositório remoto ao ser commitado.

O arquivo deverá seguir o seguinte modelo:

```js
const credentials = {
  algorithmiaCredentials: {
    apiKey: 'API KEY DO ALGORITHMIA', // Colocar aqui sua API Key do Algorithmia.
  },

  watsonCredentials: {
    apikey: 'API KEY DO NATURAL LANGUAGE UNDERSTANDING DO WATSON', // Colocar aqui sua API Key do NLU.
  },

  googleSearchCredentials: {
    apiKey: 'API KEY DO GOOGLE', // Colocar aqui sua API Key do Google.
    searchEngineID: 'O ID DA SUA SEARCH ENGINE', // Colocar aqui o ID da sua Search Engine personalizada.
  }
}

module.exports = credentials;
```

Você deve copiar o código acima e inserir em `credentials/index.html` e então tudo estará pronto para iniciar.