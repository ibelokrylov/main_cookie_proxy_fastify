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

const consoleLog = ({level = 'info', ...body}) => {
  console?.[level]?.(new Date(), '-', body);
};

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
    consoleLog({
      'data From user': result.data
    });
    consoleLog({'cookie From user: ': result.cookie});
    consoleLog({'url From user: ': result.url});
    return result;
  } catch (err) {
    fastify.log.error(err);
  }
};

const create_response = (reply, body) => {
  try {
    const {headers, cookie, status} = body;
    if (cookie) {
      Object.keys(cookie).map((item) => {
        reply.setCookie(item, cookie[item]);
      });
    }
    reply.headers(headers);
    reply.status(status);
    return body.json();
  } catch (error) {
    console.error(error);
    throw new Error();
  }
};

const fetch_to_server_app = async (body) => {
  const {method, url, ..._body} = body;
  const _url = BASE_URL + url;
  consoleLog({url_to_server: _url});
  consoleLog({
    method: method
  });
  consoleLog({
    send_body: {
      data: _body.data ?? undefined,
      cookie: _body.cookie ?? undefined,
      headers: _body.headers ?? undefined
    }
  });
  try {
    return method === 'GET'
      ? await fetch(_url, {
        method,
      })
      : await fetch(_url, {
        method,
        body: JSON.stringify({
          data: _body.data ?? undefined,
          cookie: _body.cookie ?? undefined,
          headers: _body.headers ?? undefined
        }),
      });
  } catch (e) {
    console.error(e);
    throw new Error();
  }
};

fastify.all('*', async function handler(request, reply) {
  const data = await serializeAllRequest(request);
  const response_data = await fetch_to_server_app(data);
  return create_response(reply, response_data);
});

try {
  await fastify.listen(PORT, ADDRESS);
} catch (err) {
  console.error(err);
  process.exit(1);
}
