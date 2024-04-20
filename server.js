const express = require('express');
const multer = require('multer');
const aws = require('aws-sdk');
const fs = require('fs');
const cors = require('cors');

const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({ region: 'us-east-1' });

// Create an instance of the AWS SSM client
const ssm = new AWS.SSM();

// Define the parameter names
const parameterNames = [
  'access-key-id',
  'secret-access-key',
  'vr-data-visualization-bucket-name-dev'
];

// Function to fetch parameters from Parameter Store
async function fetchParameters() {
  try {
    const data = await ssm.getParameters({
      Names: parameterNames,
      WithDecryption: true // Decrypt SecureString parameters
    }).promise();

    const parameters = {};
    data.Parameters.forEach(param => {
      parameters[param.Name.split('/').pop()] = param.Value;
    });

    return parameters;
  } catch (err) {
    console.error('Error fetching parameters:', err);
    throw err;
  }
}

// Fetch parameters
fetchParameters()
  .then(parameters => {
    // Create Express app
    const app = express();
    const port = 3000;

    // Configure AWS S3 client
    const s3 = new aws.S3({
      accessKeyId: parameters['access-key-id'],
      secretAccessKey: parameters['secret-access-key'],
    });

    // Set up Multer for file uploads
    const upload = multer({ dest: 'uploads/' });

    // Enable CORS
    app.use(cors());

    // Handle file upload endpoint
    app.post('/upload', upload.single('file'), (req, res) => {
      const fileContent = fs.readFileSync(req.file.path);
      
      const params = {
        Bucket: parameters['vr-data-visualization-bucket-name-dev'],
        Key: req.file.originalname,
        Body: fileContent,
      };
      console.log('s3-bucket-name: ', params);
      // Upload file to S3
      s3.upload(params, (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).send('Upload failed');
        } else {
          console.log('File uploaded successfully', data.Location);
          res.status(200).send('Upload successful');
        }
      });
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('Error:', err);
  });
