const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const archiver = require('archiver');
const fs = require("fs");
const port = 3005;

const app = express();

// Configure CORS with specific origin (replace with your frontend origin)
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "uploads" directory
app.use("/download", express.static("uploads"));


function getDirectoryContents(directoryPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, { withFileTypes: true }, (err, dirents) => {
      if (err) {
        reject(err);
        return;
      }
      Promise.all(dirents.map((dirent) => {
        const fullPath = path.join(directoryPath, dirent.name);
        if (dirent.isDirectory()) {
          return getDirectoryContents(fullPath).then((items) => ({
            name: dirent.name,
            isDirectory: true,
            items,
          }));
        } else {
          return new Promise((resolve, reject) => {
            fs.stat(fullPath, (err, stats) => {
              if (err) {
                reject(err);
                return;
              }
              resolve({
                name: dirent.name,
                isDirectory: false,
                size: stats.size,
              });
            });
          });
        }
      })).then((items) => {
        items.sort((a, b) => {
          if (a.isDirectory && !b.isDirectory) {
            return -1;
          } else if (!a.isDirectory && b.isDirectory) {
            return 1;
          } else {
            return a.name.localeCompare(b.name);
          }
        });
        resolve(items);
      }).catch(reject);
    });
  });
}
app.get('/elencofile', (req, res) => {
  const directoryPath = path.join(__dirname, 'uploads');
  getDirectoryContents(directoryPath)
    .then((items) => res.json(items))
    .catch((err) => {
      //console.log('Unable to scan directory: ' + err);
      res.status(500).json({ error: 'Unable to scan directory' });
    });
});

app.post('/download', function(req, res){
  const file = req.body.path; // get the requested file's path from the request body
  const filePath = path.join(__dirname, 'uploads', file); // construct the full file path
  res.download(filePath); // send the file
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Set the destination directory for uploads
  },
  filename: function (req, file, cb) {
    cb(
      null,
      path.parse(file.originalname).name +
        "_" +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

app.options("/upload", cors(), (req, res) => {
  // Allow specific methods for the actual request
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type"); // Adjust as needed
  res.status(200).send();
});

app.post("/upload", upload.single("file"), (req, res) => {
  // Use upload.single('file')

  // Access the uploaded file details (if successful)
  const file = req.file;
  const formData = JSON.parse(req.body.fileInfo);

  const cliente = formData.cliente;
  const vim = formData.vimVeicolo;
  const dirPath = `uploads/${cliente}/${vim}`;
  if (file) {
    //console.log("File uploaded successfully:", file.filename);
    // You can further process or store the uploaded file here
    fs.mkdirSync(dirPath, { recursive: true });

    const oldPath = file.path;
    const newPath = path.join(dirPath, file.filename);

    fs.rename(oldPath, newPath, function (err) {
      if (err) {
        //console.error("Failed to move file:", err);
        res.status(500).send({ error: "Failed to move file!" });
      } else {
        //console.log("File moved successfully:", newPath);
        res.send({
          message: "File uploaded and moved!",
          filePath: newPath,
        });
      }
    });
  } else {
    //console.error("Upload failed!");
    res.status(400).send({ error: "Failed to upload file!" });
  }
});

// Main function to search the base directory and find the latest files
const getLatestFile = (files, folderPath) => {
  let latestFile = null;
  let latestNumber = -1;

  files.forEach(file => {
    const parts = file.split('_');
    const numberPart = parts[parts.length - 1].split('.')[0]; // Extract numeric part before the extension
    const number = parseInt(numberPart);

    if (!isNaN(number) && number > latestNumber) {
      latestNumber = number;
      latestFile = path.join(folderPath, file); // Full path to the latest file
    }
  });

  return latestFile;
};

// Recursive function to find a specific folder in a directory tree
const findFolderRecursively = async (dir, folderName) => {
  const items = await fs.promises.readdir(dir, { withFileTypes: true });

  for (const item of items) {
    const itemPath = path.join(dir, item.name);

    // If the item is a directory and matches the folderName, return the path
    if (item.isDirectory() && item.name === folderName) {
      return itemPath;
    }

    // If the item is a directory, search inside it (recursive search)
    if (item.isDirectory()) {
      const found = await findFolderRecursively(itemPath, folderName);
      if (found) {
        return found; // If found, stop searching and return the path
      }
    }
  }

  return null; // Folder not found
};

// Main function to search for the latest files in the required folders
app.post('/backuplast', async function (req, res) {
  const { mach, commessa, cliente } = req.body; // Destructure the request body
  const baseDir = path.join(__dirname, 'uploads', mach, cliente, commessa); // Construct the base directory path

  let lastPLC = '';
  let lastHMI = '';
  let lastSchema = '';

  try {
    // Check if the base directory exists
    if (!fs.existsSync(baseDir)) {
      // return res.status(404).send('Specified directory does not exist' );
      // throw new Error('Specified directory does not exist');
    }

    // Recursively search for '31_Plc', '32_HMI', and '05_Schema' folders within the specified path
    const plcFolder = await findFolderRecursively(baseDir, '31_Plc');
    const hmiFolder = await findFolderRecursively(baseDir, '32_HMI');
    const schemaFolder = await findFolderRecursively(baseDir, '05_Schema');

    if (plcFolder) {
      const plcFiles = await fs.promises.readdir(plcFolder);
      lastPLC = getLatestFile(plcFiles, plcFolder);
    }

    if (hmiFolder) {
      const hmiFiles = await fs.promises.readdir(hmiFolder);
      lastHMI = getLatestFile(hmiFiles, hmiFolder);
    }

    if (schemaFolder) {
      const schemaFiles = await fs.promises.readdir(schemaFolder);
      lastSchema = getLatestFile(schemaFiles, schemaFolder);
    }

    //console.log('Last PLC file:', lastPLC);
    //console.log('Last HMI file:', lastHMI);
    //console.log('Last Schema file:', lastSchema);

    // Prepare the zip file with the latest found files
    const output = fs.createWriteStream(path.join(__dirname, 'backup.zip'));
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Set the compression level
    });

    output.on('close', function () {
      //console.log(archive.pointer() + ' total bytes');
      //console.log('Archiver has been finalized.');

      // Send the zip file for download
      res.download(path.join(__dirname, 'backup.zip'), 'backup.zip', (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error downloading file', error: err.message });
        }
      });
    });

    archive.on('error', function (err) {
      return res.status(500).json({ message: 'Error processing zip file', error: err.message });
    });

    // Pipe archive data to the file
    archive.pipe(output);

    // Append files to the archive
    if (lastPLC) {
      archive.file(lastPLC, { name: path.basename(lastPLC) });
    }
    if (lastHMI) {
      archive.file(lastHMI, { name: path.basename(lastHMI) });
    }
    if (lastSchema) {
      archive.file(lastSchema, { name: path.basename(lastSchema) });
    }

    // Finalize the archive (no more data to append)
    archive.finalize();

  } catch (err) {
    return res.status(500).json({ message: 'Nessun file trovato', error: err.message });
  }
});









app.post('/batchOperations', async (req, res) => {
  console.log('batchOperations');
  const mappings = req.body.mappings; // Expecting an array of objects with { machine, commessa, cliente }

  if (!Array.isArray(mappings) || mappings.length === 0) {
    return res.status(400).json({ message: 'Mappings must be a non-empty array' });
  }

  try {
    //console.log(mappings);
    // throw new Error('Errore nella creazione del file ZIP');
    // Set the response headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename=backup_all_mappings.zip');
    res.setHeader('Content-Type', 'application/zip');

    const archive = archiver('zip', {
      zlib: { level: 9 }, // Set the compression level
    });

    // Handle any errors that occur
    archive.on('error', (err) => {
      throw new Error(err.message);
    });

    // Pipe the archive directly to the response
    archive.pipe(res);

    for (let mapping of mappings) {
      const { machine, commessa, cliente } = mapping;
      const baseDir = path.join(__dirname, 'uploads', machine, cliente, commessa);

      let lastPLC = '';
      let lastHMI = '';
      let lastSchema = '';

      // Check if the base directory exists
      if (!fs.existsSync(baseDir)) {
        //console.log(`Directory not found: ${baseDir}`);
        continue;
      }

      // Recursively search for folders and get the latest files
      const plcFolder = await findFolderRecursively(baseDir, '31_Plc');
      const hmiFolder = await findFolderRecursively(baseDir, '32_HMI');
      const schemaFolder = await findFolderRecursively(baseDir, '05_Schema');

      if (plcFolder) {
        const plcFiles = await fs.promises.readdir(plcFolder);
        lastPLC = getLatestFile(plcFiles, plcFolder);
      }

      if (hmiFolder) {
        const hmiFiles = await fs.promises.readdir(hmiFolder);
        lastHMI = getLatestFile(hmiFiles, hmiFolder);
      }

      if (schemaFolder) {
        const schemaFiles = await fs.promises.readdir(schemaFolder);
        lastSchema = getLatestFile(schemaFiles, schemaFolder);
      }

      // console.log('Last PLC file:', lastPLC);
      // console.log('Last HMI file:', lastHMI);
      // console.log('Last Schema file:', lastSchema);

      // Append the latest files to the archive with a path prefix for clarity
      if (lastPLC) {
        archive.file(lastPLC, { name: path.join(`${commessa}_${cliente}_${machine}`, path.basename(lastPLC)) });
      }
      if (lastHMI) {
        archive.file(lastHMI, { name: path.join(`${commessa}_${cliente}_${machine}`, path.basename(lastHMI)) });
      }
      if (lastSchema) {
        archive.file(lastSchema, { name: path.join(`${commessa}_${cliente}_${machine}`, path.basename(lastSchema)) });
      }
    }

    console.log('almost done');

    // Finalize the archive (no more data to append)
    await archive.finalize();
  } catch (err) {
    res.status(500).json({ message: err.message});
  }
});








app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});