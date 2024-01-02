import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import 'dotenv/config';
import fetch from 'node-fetch';

const {
  PORT = 3000,
  ADDRESS = 'localhost',
  COOKIE_SECRET = 'my-secret',
  BASE_URL = 'http://212.113.117.104',
} = process.env;

const fastify = Fastify({
  logger: true

});

fastify.register(cookie, {
  secret: COOKIE_SECRET,
  parseOptions: {
    path: '/',
    signed: true,
    sameSite: 'none',
    secure: true,
    httpOnly: true,
  },
});

const serializeAllRequest = async (request) => {
  try {
    const data = request.body;
    const headers = request.headers;
    const cookie = () => {
      let _cookie = {};
      Object.keys(request.cookies).map((item) => {
        const {valid, value} = request.unsignCookie(request.cookies[item]);
        if (valid) {
          _cookie[item] = value;
        }
      });
      return _cookie;
    };
    const {cookie: _, ..._headers} = headers;
    const result = {
      data,
      headers: _headers,
      cookie: cookie(),
      method: request.method,
      url: request.url,
      fastify
    };
    fastify.log.info(`Входящие данные от пользователя: ${JSON.stringify(result)}`);
    return result;
  } catch (err) {
    fastify.log.error(err);
  }
};

const create_response = (reply, body) => {
  try {
    const {headers, cookie, data} = body;
    if (cookie) {
      Object.keys(cookie).map((item) => {
        reply.setCookie(item, cookie[item]);
      });
    }
    reply.headers(headers);
    fastify.log.info(`Заголовки отправленные пользователю: ${JSON.stringify(headers)}`);
    fastify.log.info(`Данные отправленные пользователю:  ${JSON.stringify(data)}`);
    return data;
  } catch (error) {
    fastify.log.error(error);
  }
};

const fetch_to_server_app = async (body) => {
  const {method, url, ..._body} = body;
  fastify.log.info(`URL пришедшего запроса: ${JSON.stringify(url)}`);
  const _url = BASE_URL + url;
  fastify.log.info(`URL запроса от прокси сервиса: ${JSON.stringify(_url)}`);
  const response_data =
    method === 'GET'
      ? await fetch(_url, {
        method,
      })
      : await fetch(_url, {
        method,
        body: _body,
      });
  fastify.log.info(`Данные пришедшие с сервера: ${JSON.stringify(response_data)}`);
  return response_data;
};

fastify.all('*', async function handler(request, reply) {
  const data = await serializeAllRequest(request);
  const response_data = await fetch_to_server_app(data);
  return create_response(reply, response_data);
});

try {
  await fastify.listen(PORT, ADDRESS);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
