const axios = require("axios");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
// const { cfUpload } = require('./Needed JS/cfUpload');
const { google } = require("googleapis");
const credentials = require("./keys.json");
async function main() {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const authClientObject = await auth.getClient();
  const googleSheetsInstance = google.sheets({
    version: "v4",
    auth: authClientObject,
  });

  const spreadsheetId = "17vhTq0ecYmP6w3DNSNBAUk__adJgWIBY3LSQfmcfzcU";

  const readData = await googleSheetsInstance.spreadsheets.values.get({
    auth: authClientObject,
    spreadsheetId,
    range: "Sheet1!A:Z",
  });

  const rawData = readData.data;
  const headers = rawData.values[0]; // Assuming the first row contains headers
  const jsonData = [];

  for (let i = 1; i < rawData.values.length; i++) {
    const row = rawData.values[i];
    const rowData = {};

    for (let j = 0; j < headers.length; j++) {
      const header = headers[j];
      const value = row[j];
      rowData[header] = value;
    }

    jsonData.push(rowData);
  }

  console.log(jsonData);
  const data = jsonData;

  if (data.length) {
    for (let index = 0; index < data.length; index++) {
      if (data[index].mockupUrl === "") {
        try {
          const logoPath = await downloadImage(
            `https://logo.clearbit.com/:` + data[index].Website
          );
          console.log("Path:");
          console.log(logoPath);
          // const resizelogoPath = await resizeImage(
          //   logoPath,
          //   "./assets",
          //   new Date().getTime()
          // );
          // console.log(resizelogoPath);
          const overlayImagePath = await overlayImage(
            logoPath,
            "./pattern/pattern.png",
            "./assets"
          );
          await overlayImageTum(
            "./BlankMockup/Kodiak_Mockup_Blank.png",
            overlayImagePath
          );
          await updateMockupUrl(spreadsheetId, index, "vishal", "./keys.json");
        } catch (error) {
          await updateMockupUrl(spreadsheetId, index, "XXXXXX", "./keys.json");
          continue
        }
      }
    }
  }
}
main();

async function downloadImage(imageUrl) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: "stream",
    });

    if (response.status === 200) {
      const fileExtension = ".png"; //path.extname(imageUrl);
      const localFilePath = `./assets/downloaded-image${fileExtension}`;
      const writer = fs.createWriteStream(localFilePath);

      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
      return localFilePath;
      console.log(`Image downloaded to ${localFilePath}`);
    } else {
      console.error(
        `Failed to download image. HTTP status: ${response.status}`
      );
    }
  } catch (error) {
    console.error("Error downloading image:", error);
  }
}

async function resizeImage(path_input, path_output, file_name) {
  console.log("Started Resize");
  const saveto = path_output + "/resized-" + file_name + ".png";
  const image = await sharp(path_input)
    .trim()
    .resize({
      width: 1000,
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0.0 },
    })
    .trim()
    .median(3)
    .sharpen(100)
    .ensureAlpha(0)
    .toFile(saveto);
  console.log(image);
  return saveto;
}

const overlayImage = async (logoPath, backgroundPath, outputPath) => {
  try {
    const saveTo = outputPath + "/output-" + new Date().getTime() + ".png";

    // Load the logo and background images
    const logo = await sharp(logoPath);
    const background = await sharp(backgroundPath);

    // Get the dimensions of the background image
    const backgroundMetadata = await background.metadata();
    const bgWidth = backgroundMetadata.width;
    const bgHeight = backgroundMetadata.height;

    // Resize the logo to match the dimensions of the background
    const resizedLogo = await logo.resize({
      width: bgWidth,
      height: bgHeight,
      fit: "contain", // You can adjust this to fit or fill as needed
      position: "center", // You can adjust this to position the logo
      background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
    });

    // Composite the resized logo onto the atop
    await background
      .composite([{ input: await resizedLogo.toBuffer(), blend: "atop" }])
      .toFile(saveTo);

    console.log("Saved to:", saveTo);
    return saveTo;
  } catch (error) {
    console.error("Error in overlayImage:", error);
    throw error; // Re-throw the error to handle it elsewhere, if needed
  }
};

async function updateMockupUrl(
  spreadsheetId,
  rowIndex,
  newMockupUrl,
  credentialsPath
) {
  try {
    // Google API credentials
    const credentials = require(credentialsPath);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const authClientObject = await auth.getClient();
    const googleSheetsInstance = google.sheets({
      version: "v4",
      auth: authClientObject,
    });

    // Specify the range where you want to update the mockupUrl (e.g., "Sheet1!G2")
    const range = `Sheet1!F${rowIndex + 2}`; 

    // Update the mockupUrl in the Google Sheet
    const updateResponse =
      await googleSheetsInstance.spreadsheets.values.update({
        auth: authClientObject,
        spreadsheetId,
        range,
        valueInputOption: "RAW",
        resource: {
          values: [[newMockupUrl]],
        },
      });

    console.log("MockupUrl updated successfully:", updateResponse.data);
    return "MockupUrl updated successfully";
  } catch (error) {
    console.error("Error updating MockupUrl:", error);
    throw error;
  }
}

async function overlayImageTum(mockup, engraved_logo) {
  console.log("Started OverlayImage");
  const background = await sharp(mockup);
  let logo;
  try {
    logo = await sharp(engraved_logo)
      .resize({
        width: 200,
        height: null,
        fit: "inside",
        ignoreAspectRatio: true,
      })
      .toBuffer();
  } catch (error) {
    console.error(error);
    return;
  }

  const top0 = 730;
  const left0 = 155;
  const width0 = 200;
  const leftCenter0 = 250;
  const center0 = 773;

  const top1 = 820;
  const left1 = 610;
  const width1 = 175;
  const leftCenter1 = 706;
  const center1 = 855;

  const top2 = 800;
  const left2 = 1035;
  const width2 = 130;
  const leftCenter2 = 1104;
  const center2 = 800;

  const top3 = 755;
  const left3 = 1425;
  const width3 = 170;
  const leftCenter3 = 1515;
  const center3 = 790;

  const top4 = 830;
  const left4 = 1845;
  const width4 = 160;
  const leftCenter4 = 1932;
  const center4 = 884;

  const top5 = 1450;
  const left5 = 345;
  const width5 = 140;
  const leftCenter5 = 415;
  const center5 = 1470;

  const top6 = 1450;
  const left6 = 825;
  const width6 = 130;
  const leftCenter6 = 888;
  const center6 = 1470;

  const top7 = 1500;
  const left7 = 1280;
  const width7 = 115;
  const leftCenter7 = 1335;
  const center7 = 1520;

  const top8 = 1485;
  const left8 = 1705;
  const width8 = 115;
  const leftCenter8 = 1762;
  const center8 = 1495;

  const top9 = 1995;
  const left9 = 128;
  const width9 = 165;
  const leftCenter9 = 215;
  const center9 = 2030;

  const top10 = 1995;
  const left10 = 605;
  const width10 = 145;
  const leftCenter10 = 676;
  const center10 = 2015;

  const top11 = 2050;
  const left11 = 1005;
  const width11 = 165;
  const leftCenter11 = 1086;
  const center11 = 2090;

  const top12 = 2050;
  const left12 = 1400;
  const width12 = 175;
  const leftCenter12 = 1490;
  const center12 = 2080;

  const top13 = 1970;
  const left13 = 1870;
  const width13 = 120;
  const leftCenter13 = 1932;
  const center13 = 1992;

  const tops = [
    top0,
    top1,
    top2,
    top3,
    top4,
    top5,
    top6,
    top7,
    top8,
    top9,
    top10,
    top11,
    top12,
    top13,
  ];
  const lefts = [
    left0,
    left1,
    left2,
    left3,
    left4,
    left5,
    left6,
    left7,
    left8,
    left9,
    left10,
    left11,
    left12,
    left13,
  ];
  const widths = [
    width0,
    width1,
    width2,
    width3,
    width4,
    width5,
    width6,
    width7,
    width8,
    width9,
    width10,
    width11,
    width12,
    width13,
  ];
  const centers = [
    center0,
    center1,
    center2,
    center3,
    center4,
    center5,
    center6,
    center7,
    center8,
    center9,
    center10,
    center11,
    center12,
    center13,
  ];
  const leftCenters = [
    leftCenter0,
    leftCenter1,
    leftCenter2,
    leftCenter3,
    leftCenter4,
    leftCenter5,
    leftCenter6,
    leftCenter7,
    leftCenter8,
    leftCenter9,
    leftCenter10,
    leftCenter11,
    leftCenter12,
    leftCenter13,
  ];

  const composites = [];
  for (let i = 0; i < 14; i++) {
    // Set the width of the logo for this iteration
    const width = widths[i];
    const centerX = centers[i];
    const centerY = leftCenters[i];

    // Resize the logo to the specified width and null height, maintaining aspect ratio
    // const resizedLogo = logo.resize(width, null);

    let sharpLogo;
    sharpLogo = await sharp(logo);
    // Resize the logo to the specified width and null height, maintaining aspect ratio
    console.log("RESIZE LOGO START");

    // Calculate the center point of the logo image for this iteration
    let logoWidth = widths[i];
    let logoHeight = null; // Assuming that logo is a square image

    // Set the top-left coordinates for the logo image for this iteration
    const top = tops[i];
    const left = lefts[i];

    // Resize the logo image for this iteration
    let resizedLogo;
    try {
      resizedLogo = await sharp(logo)
        .resize({
          width: logoWidth,
          height: logoHeight,
          fit: "inside",
          ignoreAspectRatio: true,
        })
        .toBuffer();
    } catch (error) {
      console.error(error);
      return;
    }

    const imageBuffer = await sharp(resizedLogo).metadata();

    // console.log(imageBuffer)

    logoWidth = imageBuffer.width;
    logoHeight = imageBuffer.height;

    const logoCenterX = logoWidth / 2;
    const logoCenterY = logoHeight / 2;

    // Calculate the top-left coordinates for the logo image so that it is centered on the original image
    let xTemp = centerX - logoCenterY;
    let yTemp = centerY - logoCenterX;

    let x = Math.round(xTemp);
    let y = Math.round(yTemp);

    console.log(centerX);
    console.log(centerY);

    console.log(logoCenterX);
    console.log(logoCenterY);

    console.log(x);
    console.log(y);

    let resizedLogo_resolved = await resizedLogo;
    console.log("COMPOSITE PUSH START");

    // ISSUE BELOW WITH THE resizedLogo input.
    composites.push({
      input: resizedLogo_resolved,
      tile: false,
      blend: "over",
      top: x,
      left: y,
    });
    console.log("COMPOSITE PUSH DONE");
    // console.log(composites);
  }

  console.log("FINAL STEP");
  const saveTo = "./assets/Mockup-" + new Date().getTime() + ".png";
  await background.composite(composites).toFile(saveTo);
  console.log("DONE");

  return saveTo;
}
