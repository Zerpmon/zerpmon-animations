const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs").promises;
const fsO = require("fs");

async function renderBlenderAnimation(
  blenderFilePath,
  pythonScriptPath,
  imageFilePath,
  animationName,
  imageName
) {
  return new Promise((resolve, reject) => {
    const renderAnimation = spawn("blender", [
      "-noaudio",
      "-b",
      blenderFilePath,
      "-E",
      "CYCLES",
      "-P",
      pythonScriptPath,
      imageFilePath,
      animationName,
      imageName,
    ]);

    renderAnimation.stdout.on("data", (data) => {
      console.log(`${data}`);
    });

    renderAnimation.stderr.on("data", (data) => {
      console.error(`Python script ERROR: ${data}`);
    });

    renderAnimation.on("close", (code) => {
      if (code !== 1) {
        reject(`Error executing Python script. Exit code: ${code}`);
      } else {
        resolve();
      }
    });
  });
}

async function generateSpritesheet(nodeScriptPath, textureName) {
  return new Promise((resolve, reject) => {
    const renderSpritesheet = spawn("node", [nodeScriptPath, textureName]);

    renderSpritesheet.stdout.on("data", (nodeData) => {
      console.log(`${nodeData}`);
    });

    renderSpritesheet.stderr.on("data", (nodeErrorData) => {
      console.error(`Node.js script ERROR: ${nodeErrorData}`);
    });

    renderSpritesheet.on("close", (nodeCode) => {
      if (nodeCode !== 0) {
        reject(`Error executing Node.js script. Exit code: ${nodeCode}`);
      } else {
        resolve();
      }
    });
  });
}

async function uploadToCloudFlareImages(nodeScriptPath, zerpmon_id) {
  return new Promise((resolve, reject) => {
    const renderSpritesheet = spawn("node", [nodeScriptPath, zerpmon_id]);

    renderSpritesheet.stdout.on("data", (nodeData) => {
      console.log(`${nodeData}`);
    });

    renderSpritesheet.stderr.on("data", (nodeErrorData) => {
      console.error(
        `uploadToCloudFlareImages.js script ERROR: ${nodeErrorData}`
      );
    });

    renderSpritesheet.on("close", (nodeCode) => {
      if (nodeCode !== 0) {
        reject(
          `Error executing uploadToCloudFlareImages.js script. Exit code: ${nodeCode}`
        );
      } else {
        resolve();
      }
    });
  });
}

async function uploadToCloudFlareR2(nodeScriptPath, zerpmon_id) {
  return new Promise((resolve, reject) => {
    const renderSpritesheet = spawn("node", [nodeScriptPath, zerpmon_id]);

    renderSpritesheet.stdout.on("data", (nodeData) => {
      console.log(`${nodeData}`);
    });

    renderSpritesheet.stderr.on("data", (nodeErrorData) => {
      console.error(`uploadToCloudFlareR2.js script ERROR: ${nodeErrorData}`);
    });

    renderSpritesheet.on("close", (nodeCode) => {
      if (nodeCode !== 0) {
        reject(
          `Error executing uploadToCloudFlareR2.js script. Exit code: ${nodeCode}`
        );
      } else {
        resolve();
      }
    });
  });
}

async function main() {
  errorLogFilePath = path.resolve(__dirname, "./logs/all/error.log");
  successLogFilePath = path.resolve(__dirname, "./logs/all/success.log");

  LogFilePathForRenderAnimation = path.resolve(__dirname, "./logs/all");

  spritesheetsFilePath = path.resolve(__dirname, "./Spritesheets");
  pngSequencesFilePath = path.resolve(__dirname, "./pngSequences");

  // create log directories if they don't exist
  if (!fsO.existsSync(LogFilePathForRenderAnimation)) {
    await fs.mkdir(LogFilePathForRenderAnimation, { recursive: true });
  }

  // create directories if they don't exist
  if (!fsO.existsSync(spritesheetsFilePath)) {
    await fs.mkdir(spritesheetsFilePath);
  }

  if (!fsO.existsSync(pngSequencesFilePath)) {
    await fs.mkdir(pngSequencesFilePath);
  }

  await fs.open(errorLogFilePath, "w");
  await fs.open(successLogFilePath, "w");

  const blenderAnimationFiles = [
    "ZerpmonCardAppearanceL",
    "ZerpmonCardAppearanceR",
    "ZerpmonCardDestructionL",
    "ZerpmonCardDestructionR",
    "ZerpmonJiggleL",
    "ZerpmonJiggleR",
    "ZerpmonDamageL",
    "ZerpmonDamageR",
  ];
  const [animationName, imageFilePath] = process.argv.slice(2);
  const pythonScriptPath = "generateImageSequence.py";
  const directoryPath = `blenderAnimations/`;

  // use absolute path for ZerpmonImages/ directory
  const zerpmonImagesPath = path.resolve(__dirname, "./ZerpmonImages/");

  try {
    const files = await fs.readdir(zerpmonImagesPath);

    for (const file of files) {
      try {
        const promises = blenderAnimationFiles.map(async (animationFile) => {
          const filePath = `${directoryPath}${animationFile}.blend`;
          return renderBlenderAnimation(
            filePath,
            pythonScriptPath,
            `${zerpmonImagesPath}${file}`,
            file.slice(0, -4),
            animationFile
          );
        });

        await Promise.all(promises);

        await generateSpritesheet("generateSpritesheet.js", file.slice(0, -4));

        await uploadToCloudFlareImages(
          "uploadToCloudflareImages.js",
          file.slice(0, -4)
        );

        await uploadToCloudFlareR2(
          "uploadToCloudflareR2.js",
          file.slice(0, -4)
        );
        await fs.appendFile(successLogFilePath, `${file.slice(0, -4)}\n`);
      } catch (error) {
        await fs.appendFile(errorLogFilePath, `${file.slice(0, -4)}\n`);
      }
    }

    console.log("All scripts completed successfully");
  } catch (error) {
    console.error(error);
  }
}

main();
