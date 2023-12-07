.env

для локального тестирования изменить PORT = 3000 ADDRESS = 'localhost' BASE*URL = LOCAL_HOST*ТВОЕГО_АПП

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
