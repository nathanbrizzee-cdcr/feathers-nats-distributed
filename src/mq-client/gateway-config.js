export default schema = {
  version: 1,
  // All require clients to provide a known client-side X.509 authentication
  // certificate. We rely on the system’s CA to validate certificates.
  tls: {
    public_key: "/path/to/cert.pem",
    private_key: "/path/to/key.pem",
    enable_mtls: true,
    ca_certs: ["./rootCA.pem"],
  },
  endpoints: [
    {
      // virtual endpoint that merges the return of the following
      // real end points
      endpoint: "/v1/foo-bar/{id}",
      extra_config: {
        "qos/ratelimit/router": {
          max_rate: 5000,
        },
        "auth/validator": {
          alg: "RS256",
          jwk_url:
            "http://KEYCLOAK:8080/auth/realms/master/protocol/openid-connect/certs",
          disable_jwk_security: true,
        },
        "auth/validator": {
          alg: "SIGNING_ALGORITHM",
          audience: ["AUDIENCE"],
          jwk_url: "https://DOMAIN/.well-known/jwks.json",
        },
        "auth/validator": {
          alg: "RS256",
          audience: ["http://api.example.com"],
          roles_key: "http://api.example.com/custom/roles",
          roles: ["user", "admin"],
          jwk_url: "https://albert-test.auth0.com/.well-known/jwks.json",
          cache: true,
        },
      },
      backend: [
        {
          url_pattern: "/foo/{id}",
          method: "GET", // GET, POST, DELETE, PUT, PATCH
          host: ["https://my.foo-api.com"],
        },
        {
          url_pattern: "/foo/{id}",
          method: "POST",
          host: ["https://my.foo-api.com"],
        },
        {
          url_pattern: "/bar",
          host: ["https://my.bar-api.com"],
          extra_config: {
            "qos/ratelimit/proxy": {
              max_rate: 100,
              capacity: 1,
            },
            "qos/http-cache": {
              shared: true,
            },
          },
        },
      ],
    },
  ],
  extra_config: {
    "telemetry/logging": {
      level: "WARNING",
      prefix: "[KRAKEND]",
      stdout: true,
    },
  },
}
