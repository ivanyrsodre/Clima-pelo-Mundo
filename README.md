# Clima pelo Mundo

Aplicação web responsiva para consultar as condições atuais e a previsão para os próximos cinco dias em cidades do mundo todo. O projeto usa Python + Flask no backend e HTML, CSS e JavaScript no frontend.

A busca de cidades usa a API de geocodificação do [Open-Meteo](https://open-meteo.com/en/docs/geocoding-api). A previsão vem da [Weather Forecast API](https://open-meteo.com/en/docs). Para uso não comercial, o exemplo não precisa de chave de API. Confira os termos da Open-Meteo antes de usar o serviço comercialmente.

## Funcionalidades

- Busca de cidades por nome, inclusive em diferentes países.
- Seleção entre correspondências com o mesmo nome.
- Temperatura, sensação térmica, umidade, vento e precipitação atuais.
- Previsão diária de cinco dias, com máximas, mínimas e probabilidade de precipitação.
- Unidades em Celsius e km/h; o horário usa o fuso local retornado pela API.
- Interface responsiva e tratamento básico de erros da API.

## Como o projeto funciona

1. O formulário da página envia o nome da cidade para `GET /api/locations`.
2. O Flask consulta o serviço de geocodificação da Open-Meteo e devolve as correspondências.
3. Ao selecionar uma cidade, o navegador envia latitude e longitude para `GET /api/weather`.
4. O Flask consulta a previsão, transforma a resposta para um formato mais simples e a devolve em JSON.
5. O JavaScript atualiza a página sem recarregar o site.

A consulta de previsão usa as coordenadas geográficas, a variável `timezone=auto` e os parâmetros de clima atuais e diários. Os endpoints e os parâmetros podem ser conferidos na documentação oficial da [geocodificação](https://open-meteo.com/en/docs/geocoding-api) e da [previsão](https://open-meteo.com/en/docs).

## Créditos

Dados meteorológicos via [Open-Meteo](https://open-meteo.com/). Dados de localidades baseados no GeoNames, conforme a documentação da API de geocodificação.
