const fs = require("fs");
const sharp = require("sharp");
const { toSystemPath } = require('../../../lib/core/path');

exports.getValue = async function (options) {
    let path_input = toSystemPath(this.parseRequired(this.parse(options.path_input), 'string', 'fs.exists: path is required.'))
    let background_path = toSystemPath(this.parseRequired(this.parse(options.background), 'string', 'fs.exists: path is required.'))

    let file_name = this.parse(options.file_name)

    console.log("Before OverlayImage")

    // const backimageBuffer = await sharp(background_path).metadata();
    // console.log(backimageBuffer);

    const overlayImage = async () => {
        console.log("Started OverlayImage")
        const background = await sharp(background_path);
        let logo;
        try {
            logo = await sharp(path_input)
                .resize({
                    width: 200,
                    height: null,
                    fit: 'inside',
                    ignoreAspectRatio: true
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

        const tops = [top0, top1, top2, top3, top4, top5, top6, top7, top8, top9, top10, top11, top12, top13];
        const lefts = [left0, left1, left2, left3, left4, left5, left6, left7, left8, left9, left10, left11, left12, left13];
        const widths = [width0, width1, width2, width3, width4, width5, width6, width7, width8, width9, width10, width11, width12, width13];
        const centers = [center0, center1, center2, center3, center4, center5, center6, center7, center8, center9, center10, center11, center12, center13];
        const leftCenters = [leftCenter0, leftCenter1, leftCenter2, leftCenter3, leftCenter4, leftCenter5, leftCenter6, leftCenter7, leftCenter8, leftCenter9, leftCenter10, leftCenter11, leftCenter12, leftCenter13];


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
            console.log("RESIZE LOGO START")

            // Calculate the center point of the logo image for this iteration
            let logoWidth = widths[i];
            let logoHeight = null;  // Assuming that logo is a square image


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
                        fit: 'inside',
                        ignoreAspectRatio: true
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
        await background
            .composite(composites)
            .toFile("public/user_design_images/" + file_name);
        console.log("DONE")

        return overlayImage;

    };

    return await overlayImage();
};