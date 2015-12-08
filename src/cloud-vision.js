var key = process.env.CLOUD_VISION_KEY
var visApiURL = `https://vision.googleapis.com/v1alpha1/images:annotate?key=${key}`

module.exports = {
  buildRequest: (imageContent) => {
    return {
      requests: [{
        image: {
          content: imageContent
        },
        features: [
          {"type": "FACE_DETECTION", maxResults: 10},
          {"type": "LABEL_DETECTION", maxResults: 20},
        ]
      }]
    }
  },

  postRequest: (request) => {
    return fetch(visApiURL, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })
  },
}
