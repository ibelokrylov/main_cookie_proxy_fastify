.env

для локального тестирования изменить

```env
PORT = 3000
ADDRESS = 'localhost'
BASE_URL = LOCAL_HOST_ТВОЕГО_АПП
```

```shell


docker build -t fast-cloud-run .
```

```shell


docker run -p 3000:3000 -it fast-cloud-run
```

запустит экземпляр в докере на 3000 порту

он ждет на вход любой запрос и переадресовывает на тот же путь но уже на BASE_URL отдает ответ форматом

```json
{
  "data": { "test": "test" },
  "headers": {
    "host": "localhost:3000",
    "content-type": "application/json",
    "user-agent": "insomnia/8.4.5",
    "accept": "*/*",
    "content-length": "19"
  },
  "cookie": { "test": "12312313" }
}
```

ты у себя их обрабатываешь если нужно меняешь или добавляешь или удаляешь

получает он ответ в таком же формате и преобразует это в заголовки и данные

# Установка и запуск для Manjaro

- установка Nodejs

```shell
pacman -S nodejs npm pnpm
```

- проверить

```shell
  node -v
```

> выводится версия, значит все окей

> если нужно добавь nodejs to PATH (инструкция будет после установки nodejs)

- в папке проекта запустить

```shell
pnpm install
```

- после того как закончит изменить .env

```env
BASE_URL = http://localhost:8081
ADDRESS = 'localhost'
```

- запустить проект командой

```shell
pnpm run start
```
