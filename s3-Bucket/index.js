const AWS = require("aws-sdk");
const express = require("express");
const fileUpload = require("express-fileupload");
const app = express();
const json = express.json();
const port = 4000;

app.use(json);
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);

let s3 = new AWS.S3({
  region: "us-east-1",
});

// Create S3 Bucket if bucket not created

// s3.createBucket(
//   {
//     Bucket: "my-sdk-bucket22",
//   },
//   (error, success) => {
//     if (error) {
//       console.log(error);
//     }
//     console.log(success);
//   }
// );

app.post("/", async ({ files }, res) => {
  const uploadParams = {
    Bucket: "my-sdk-bucket22",
    Key: files.file.name,
    Body: Buffer.from(files.file.data),
    ContentType: files.file.mimetype,
    // ACL: "public-read",
  };

  s3.upload(uploadParams, function (err, data) {
    err && console.log("Error", err);
    data && console.log("Upload success", data.Location);
  });

  res.send("OK");
});

app.get("/", async (req, res) => {
  let r = await s3.listObjectsV2({ Bucket: "my-sdk-bucket22" }).promise();

  let data = r.Contents.map((item) => item.Key);

  res.send(data);
});

app.get("/download/:file", async (req, res) => {
  const file = req.params.file;
  let data = await s3
    .getObject({ Bucket: "my-sdk-bucket22", Key: file })
    .promise();
  res.send(data.Body);
});
// s3.putObject({
//   Bucket: "my-sdk-bucket22",
//   Key: "",
// });

app.delete("delete/:file", async (req, res) => {
  const file = req.params.file;
  await s3.deleteObject({ Bucket: "my-sdk-bucket22", Key: file }).promise();

  res.send("File deleted");
});

app.listen(port, () => {
  console.log("Listening on 4k");
});
