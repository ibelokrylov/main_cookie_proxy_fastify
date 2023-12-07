import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import 'dotenv/config';
import fetch from 'node-fetch';

const { PORT = 3000, ADDRESS = 'localhost', COOKIE_SECRET = 'my-secret', BASE_URL = 'http://212.113.117.104' } = process.env;

const fastify = Fastify({
  logger: true,
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
        const { valid, value } = request.unsignCookie(request.cookies[item]);
        if (valid) {
          _cookie[item] = value;
        }
      });
      return _cookie;
    };
    const { cookie: _, ..._headers } = headers;
    return { data, headers: _headers, cookie: cookie(), method: request.method, url: request.url };
  } catch (err) {
    fastify.log.error(err);
  }
};

const create_response = (reply, body) => {
  try {
    const { headers, cookie, data } = body;
    if (cookie) {
      Object.keys(cookie).map((item) => {
        reply.setCookie(item, cookie[item]);
      });
    }
    reply.headers(headers);
    return data;
  } catch (error) {
    fastify.log.error(error);
  }
};

const fetch_to_server_app = async (body) => {
  const { method, url, ..._body } = body;
  const response_data =
    method === 'GET'
      ? await fetch(BASE_URL + url, {
          method,
        })
      : await fetch(BASE_URL + url, {
          method,
          body: _body,
        });
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
