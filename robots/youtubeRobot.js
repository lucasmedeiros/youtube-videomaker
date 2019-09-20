const fs = require('fs');
const express = require('express');
const google = require('googleapis').google;
const stateRobot = require('./stateRobot');
const { googleCredentials } = require('../credentials/index');

const OAuth2 = google.auth.OAuth2;
const youtube = google.youtube({
  version: 'v3',
})

const start = async (dirName) => {

  const authenticateWithOauth = async () => {
    const startWebServer = async () => {
      return new Promise((resolve, _reject) => {
        const port = 5000;
        const app = express();
        const server = app.listen(port, () => {
          console.log(`> Servidor rodando em: http://localhost:${port}`);
          resolve({
            app,
            server,
          });
        })
      });
    }

    const createOauthClient = async () => {
      const oAuthClient = new OAuth2(
        googleCredentials.oauthClientID,
        googleCredentials.oauthSecretKey,
        googleCredentials.callbackUris[0],
      );

      return oAuthClient;
    }

    const requestUserConsent = async (oAuthClient) => {
      const consentUrl = oAuthClient.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/youtube']
      });

      console.log(`> [autenticação com o Google] Por favor, nos autorize a publicar seu vídeo acessando essa URL: ${consentUrl}`);
    }

    const waitForGoogleCallback = async (webServer) => {
      return new Promise((resolve, _reject) => {
        console.log('> [autenticação com o Google] Esperando pela sua autorização...');
        
        webServer.app.get('/oauth2callback', (req, res) => {
          const authCode = req.query.code;
          console.log(`> [autenticação com o Google] Autorizado! ${authCode}`);

          res.send('<h1>Obrigado! :D</h1><p>Tudo já foi feito, pode fechar essa aba.</p>');
          resolve(authCode);
        });
      });
    }

    const requestGoogleAccessToken = async (oAuthClient, authorizationToken) => {
      return new Promise((resolve, reject) => {
        oAuthClient.getToken(authorizationToken, (err, tokens) => {
          if (err) reject(`Não foi possível realizar a autenticação... ${err.message}`);

          console.log('> [autenticação com o Google] Tokens de acesso recebidos.');

          oAuthClient.setCredentials(tokens);
          resolve();
        });
      });
    }

    const setGlobalGoogleAuthentication = async (oAuthClient) => {
      google.options({
        auth: oAuthClient,
      });
    }

    const stopWebServer = async (webServer) => {
      return new Promise((resolve, _reject) => {
        webServer.server.close(() => {
          resolve();
        });
      });
    }

    const webServer = await startWebServer();
    const oAuthClient = await createOauthClient();
    await requestUserConsent(oAuthClient);
    const authorizationToken = await waitForGoogleCallback(webServer);
    await requestGoogleAccessToken(oAuthClient, authorizationToken);
    await setGlobalGoogleAuthentication(oAuthClient);
    await stopWebServer(webServer);
  }

  const uploadVideoToYoutube = async (contentObject) => {
    console.log('> [upload de vídeo] Iniciando o upload...');
    const fileName = `${contentObject.prefix} ${contentObject.searchTerm}`.split(" ").join("_");
    const videoFilePath = `${dirName}/templates/default/${fileName}.mp4`;
    const videoFileSize = fs.statSync(videoFilePath).size;
    const videoTitle = `${contentObject.prefix} ${contentObject.searchTerm}`;
    const videoTags = [contentObject.searchTerm, ...contentObject.sentences[0].keywords];
    const videoDescription = contentObject.sentences.map(sentence => {
      return sentence.text;
    }).join('\n\n');

    const onUploadProgress = (event) => {
      const progress = Math.round((event.bytesRead / videoFileSize) * 100);
      console.log(`> [upload de vídeo] Progresso: ${progress}%`);
    }

    const requestParameters = {
      part: 'snippet, status',
      requestBody: {
        snippet: {
          title: videoTitle,
          description: videoDescription,
          tags: videoTags,
        },
        status: {
          privacyStatus: 'unlisted',
        }
      },
      media: {
        body: fs.createReadStream(videoFilePath),
      }
    }

    const youtubeResponse = await youtube.videos.insert(requestParameters, {
      onUploadProgress: onUploadProgress,
    });

    console.log('> [upload de vídeo] Fim de upload.');
    console.log(`> [upload de vídeo] Vídeo disponível em: https://youtu.be/${youtubeResponse.data.id}`);
    return youtubeResponse.data;
  }

  const uploadThumbnail = async (videoInfo) => {
    console.log(`> [upload de vídeo] Iniciando upload de thumbnail...`);
    const videoId = videoInfo.id;
    const thumbnailFilePath = `${dirName}/resources/youtube-thumbnail.jpg`;

    const requestParameters = {
      videoId,
      media: {
        mimeType: 'image/jpeg',
        body: fs.createReadStream(thumbnailFilePath),
      }
    }

    await youtube.thumbnails.set(requestParameters);
    console.log(`> [upload de vídeo] Upload de thumbnail concluído!`);
  }

  const contentObject = stateRobot.load();
  await authenticateWithOauth();
  const videoInfo = await uploadVideoToYoutube(contentObject);
  await uploadThumbnail(videoInfo);
}

module.exports = start;
