const users = {
  "admin": "password",
  "user1": "password1",
  "user2": "password2",
  // Add more users as needed
};

const CREDENTIALS_REGEXP = /^ *(?:[Bb][Aa][Ss][Ii][Cc]) +([A-Za-z0-9._~+/-]+=*) *$/;
const USER_PASS_REGEXP = /^([^:]*):(.*)$/;

const parseAuthHeader = (string) => {
  if (typeof string !== 'string') {
    return undefined;
  }

  const match = CREDENTIALS_REGEXP.exec(string);
  if (!match) return undefined;

  const userPass = USER_PASS_REGEXP.exec(atob(match[1]));
  if (!userPass) return undefined;

  return { name: userPass[1], pass: userPass[2] };
};

const unauthorizedResponse = (body) => new Response(
  body, {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="User Visible Realm"'
    }
  }
);

async function handle(request) {
  const credentials = parseAuthHeader(request.headers.get("Authorization"));

  if (!credentials || users[credentials.name] !== credentials.pass) {
    return unauthorizedResponse("Unauthorized");
  }

  return fetch(request);
}

addEventListener('fetch', event => {
  event.respondWith(handle(event.request));
});
