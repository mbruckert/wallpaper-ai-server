const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const functions = require("@google-cloud/functions-framework");

function getPredictionStatus(getUrl) {
  return fetch(getUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Token " + process.env.REPLICATE_API_KEY,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
}

functions.http("getPrediction", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    // Send response to OPTIONS requests
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
  } else {
    var fullPrediction =
      req.query.prompt + " in the style of " + req.query.style;

    fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token " + process.env.REPLICATE_API_KEY,
      },
      body: JSON.stringify({
        version:
          "a9758cbfbd5f3c2094457d996681af52552901775aa2d6dd0b17fd15df959bef",
        input: {
          width: 512,
          height: "1024",
          num_outputs: "1",
          guidance_scale: 7.5,
          prompt_strength: 0.8,
          num_inference_steps: 50,
          prompt: fullPrediction,
        },
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setTimeout(() => {
          getPredictionStatus(data.urls.get).then((data) => {
            res.send(data.output[0]);
          });
        }, 10000);
      });
  }
});
