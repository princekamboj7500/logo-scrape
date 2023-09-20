const fs = require("fs");
const sharp = require("sharp");
const { toSystemPath } = require('../../../lib/core/path');

exports.getValue = async function (options) {
    let path_input = toSystemPath(this.parseRequired(this.parse(options.path_input), 'string', 'fs.exists: path is required.'))
    let path_output = toSystemPath(this.parseRequired(this.parse(options.path_output), 'string', 'fs.exists: path is required.'))
    let pattern_path = toSystemPath(this.parseRequired(this.parse(options.pattern), 'string', 'fs.exists: path is required.'))

    let file_name = this.parse(options.file_name)
    // const destinationImagePath = `uploads/temp_usr_upload/${srcImgName}.png`;    //where new image will be saved

    const imageBuffer = await sharp(path_input).metadata();
    imgWidth = imageBuffer.width;
    imgHeight = imageBuffer.height;

    console.log(imgHeight);
    console.log(imgWidth);
    console.log("Before OverlayImage")


    const overlayImage = async () => {
        console.log("Started OverlayImage")
        const logo = await sharp(path_input);
        let pattern = await sharp(pattern_path)
        if (imgWidth < 300 || imgHeight < 300) {
            console.log("LESS THAN 300")
            pattern = await sharp(pattern_path)
                .resize({
                    height: imgHeight,
                    weidth: imgWidth,
                })
                .toBuffer();
        }
        else {
            console.log("DEFAULT TO 300")
            pattern = await sharp(pattern_path)
                .resize({
                    height: 300,
                    weidth: 300,
                })
                .toBuffer();
        }
        await logo
            .composite([{ input: pattern, tile: true, blend: "atop" }])
            .toFile(path_output + "/engraved-" + file_name);
        return overlayImage;

    };

    // const overlayImage = async () => {
    //     console.log("Started OverlayImage")
    //     const logo = await sharp(path_input);
    //     const pattern = await sharp(pattern_path)
    //         .resize({
    //             height: imgHeight,
    //             weidth: imgWidth,
    //         })
    //         .toBuffer();

    //     await logo
    //         .composite([{ input: pattern, tile: true, blend: "atop" }])
    //         .toFile(path_output + "/engraved-" + file_name);
    //     return overlayImage;

    // };
    return await overlayImage();


};