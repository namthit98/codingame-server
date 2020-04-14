function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function uploadFileToS3(s3, params) {
  return new Promise((resolve, reject) => {
    s3.upload(params, function (err, data) {
      console.log(err);
      if (err) {
        reject(err);
      } else {
        resolve(data.Key);
      }
    });
  });
}

module.exports = {
  makeid,
  uploadFileToS3,
};
