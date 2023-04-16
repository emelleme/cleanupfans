const MACROMETA_API_URL = "https://api-play.paas.macrometa.io/";
const MACROMETA_API_KEY = "YOUR_MACROMETA_API_KEY";
const COLLECTION_NAME = "users";
const macrometaHost = "https://api-play.paas.macrometa.io/"
const authEndpoint = macrometaHost + "/_open/auth"
const queryEndpoint = macrometaHost + "/_fabric/_system/_api/cursor"
const type = "application/json;charset=UTF-8"
let jwtToken = ''

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  "Access-Control-Max-Age": "86400",
}

const getOptions = (requestBody, token) => ({
  method:'POST',
  body:JSON.stringify(requestBody),
  headers: { Authorization: token,
          "content-type": type
          },
  });


async function onRequestGet(context) {
    // Contents of context object
    const {
      request, // same as existing Worker API
      env, // same as existing Worker API
      params, // if filename includes [id] or [[path]]
      waitUntil, // same as ctx.waitUntil in existing Worker API
      next, // used for middleware or to fetch assets
      data, // arbitrary space for passing data between middlewares
    } = context;
    const body = JSON.stringify({body:"Hello World"})
    const headers = { 'Content-type': 'application/json' }
    return new Response(body, { headers })
    // return new Response();
  }

export async function onRequestPost(context) {
  // Contents of context object
  const {
    request, // same as existing Worker API
    env, // same as existing Worker API
    params, // if filename includes [id] or [[path]]
    waitUntil, // same as ctx.waitUntil in existing Worker API
    next, // used for middleware or to fetch assets
    data, // arbitrary space for passing data between middlewares
  } = context;
  const { email, username } = await request.json();

  if (!email || !username) {
    return new Response(JSON.stringify({ success: false, message: "Invalid input" }), { status: 400 });
  }
  const authInfo = {
    "email": "cleanupwrangler@emelle.me",
    "password": "Cleanup123##",
    "tenant": "TL_aBaLffSqKpz6jMu0V6Rw",
    "username": "UbbbC9QLBQbSbRBABboQkvg"
  }
  //{
  //   "email": env.MMEmail,
  //   "password": env.MMPass,
  //   "tenant": env.MMTenant,
  //   "username": env.MMUsername
  // }


  const authToken = env.MMToken;
  const jwtRequest = await fetch(authEndpoint,getOptions(authInfo, authToken))
  const jwtResponse = await jwtRequest.json();
  jwtToken=`bearer ${jwtResponse.jwt}`
console.log(jwtToken)
  
  const existingUser = await checkUsernameUniqueness(username);

  if (existingUser) {
    return new Response(JSON.stringify({ success: false, message: "Username already exists" }), { status: 409 });
  }

  const newUser = {
    email,
    username
  };

  await saveUser(newUser);

  return new Response(JSON.stringify({ success: true }), { status: 201 });
}

async function checkUsernameUniqueness(username) {
  const query = `FOR user IN ${COLLECTION_NAME} FILTER user.username == @username RETURN user`;
  const bindVars = { username };

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `${jwtToken}`
    },
    body: JSON.stringify({ query, bindVars })
  };

  const response = await fetch(`${MACROMETA_API_URL}/_fabric/_system/_api/cursor`, requestOptions);
  const data = await response.json();

  if (data.error) {
    throw new Error(`Error while querying Macrometa: ${data.errorMessage}`);
  }

  return data.result && data.result.length > 0 ? data.result[0] : null;
}


async function saveUser(user) {
  const query = `INSERT @user INTO ${COLLECTION_NAME} RETURN NEW`;
  const bindVars = { user };

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `${jwtToken}`
    },
    body: JSON.stringify({ query, bindVars })
  };

  await fetch(`${MACROMETA_API_URL}/_fabric/_system/_api/cursor`, requestOptions);
}

// export default {
//   onRequestPost, onRequestGet
// };
