import http from "node:http";

const server = http.createServer((request, response) => {
  const upstream = http.request(
    {
      hostname: "::1",
      port: 3000,
      path: request.url,
      method: request.method,
      headers: request.headers,
    },
    (upstreamResponse) => {
      response.writeHead(upstreamResponse.statusCode ?? 502, upstreamResponse.headers);
      upstreamResponse.pipe(response);
    },
  );

  upstream.on("error", () => {
    response.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
    response.end("La vista previa local no está disponible.");
  });

  request.pipe(upstream);
});

server.listen(8080, "0.0.0.0");
