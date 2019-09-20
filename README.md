# youtube-videomaker
Automatização de criação de vídeos para o YouTube **em português** a partir de artigos publicados no *Wikipedia*.

## Instalação

Antes de mais nada, você deve definir algumas credenciais.

### Credentials

Dentro da pasta `/credentials`, crie um arquivo chamado `index.js` para suas credenciais do [Algorithmia](https://algorithmia.com/), do [IBM Watson - Natural Language Understanding](https://www.ibm.com/watson/services/natural-language-understanding/) e da sua [Search Engine customizada do Google Images](https://developers.google.com/custom-search/docs/tutorial/introduction). Este arquivo `credentials/index.js` está ocultado pelo `.gitignore` e não será enviado para o repositório remoto ao ser commitado.

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

Você deve copiar o código acima e inserir em `credentials/index.js` e preencher os campos necessários.

### ImageMagick

Você precisará instalar um programa chamado **[ImageMagick](https://imagemagick.org/script/download.php)** para que o robô das imagens consiga convertê-las de maneira adequada. Para isso, você pode acessar [essa página](https://imagemagick.org/script/download.php) e seguir o manual de instalação para o seu sistema operacional.

Ou então, você pode simplesmente instalar o **[Homebrew](https://brew.sh/)** em sua máquina e simplsmente rodar o comando:

```
brew install imagemagick
```

### Kdenlive

Para poder renderizar os vídeos a partir de um script, você precisará ter o **[Kdenlive](https://kdenlive.org/en/download/)**, uma alternativa *open source* ao **Adobe After Effects**. No Ubuntu e em distribuições derivadas, você pode instalá-lo a partir da execução dos seguintes comandos:

```
add-apt-repository ppa:kdenlive/kdenlive-stable
sudo apt-get update
sudo apt-get install kdenlive
```

Caso você utilizar outra distribuição, existem tutoriais para diferentes sistemas operacionais no site da organização do Kdenlive (que você pode acessar no link mais acima).

### Rodar em sua máquina

Tendo feito todos os passos acima, tudo estará pronto para iniciar e espera-se que funcione normalmente. Para rodar, você deve ter o [node](https://nodejs.org/en/) e o [yarn](https://yarnpkg.com/lang/en/) instalados, e executar o comando:

```
yarn start
```

Então, ao final da execução, você deve ter seu vídeo gerado no canal de sua escolha!
