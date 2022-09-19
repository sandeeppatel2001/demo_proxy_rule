(async () => {
  const mockttp = require("mockttp");

  // Create a proxy server with a self-signed HTTPS CA certificate:
  const https = await mockttp.generateCACertificate();
  const server = mockttp.getLocal({ https });

  // Inject 'Hello world' responses for all requests
  server.forAnyRequest().thenReply(200, "Hello world");
  await server.start();

  // Print out the server details:
  const caFingerprint = mockttp.generateSPKIFingerprint(https.cert);
  console.log(`Server running on port ${server.port}`);
  console.log(`CA cert fingerprint ${caFingerprint}`);
  // Proxy all example.com traffic through as normal, untouched:
  server.forAnyRequest().forHostname("example.com").thenPassThrough();

  // Make all GET requests to google.com time out:
  server.forGet("google.com").thenTimeout();

  // Redirect any github requests to wikipedia.org:
  server
    .forAnyRequest()
    .forHostname("github.com")
    .thenForwardTo("https://www.wikipedia.org");

  // Intercept /api?userId=123 on any host, serve the response from a file:
  server
    .forGet("/api")
    .withQuery({ userId: 123 })
    .thenFromFile(200, "/path/to/a/file");

  // Forcibly close any connection if a POST request is sent:
  server.forPost().thenCloseConnection();
})(); // (Run in an async wrapper so we can use top-level await everywhere)
