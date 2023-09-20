const axios = require('axios');
const fs = require('fs')
const FormData = require('form-data');

exports.cfUpload = async function (options) {
    let errorBool = 0;
    console.log("Starting CF Upload");
    console.log(errorBool);
    const srcImgPath = options.path;  //image path on the server
    let path = toSystemPath(this.parseRequired(this.parse(options.path), 'string', 'fs.exists: path is required.'))
    let srcPath = fs.createReadStream(path);
    var data = new FormData();

    let thumb_img = ''; // Added 030522
    let original_img = ''; // Added 030522
    let designer_img = ''; // Added 030522
    let image_id = ''; // Removed 031922
    let unique_img_id = image_id;
    let cf_base_url = 'https://imagedelivery.net/ZFpmFfUMgrq3swZTSeGQxA/';

    const contents = fs.readFileSync(path, { encoding: 'utf-8' });
    data.append('file', fs.createReadStream(path));
    console.log("CF File Read Sync Done");
    console.log("CF Starting Axios Await");

    let response;
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
        try {
            response = await axios({
                method: 'post',
                url: 'https://api.cloudflare.com/client/v4/accounts/45cea078ebef87fccfbc40e7e0d86331/images/v1',
                headers: {
                    'X-Auth-Key': 'f566c4e2cb169ebe13f0041aa0c4439d712eb',
                    'X-Auth-Email': 'robbyd@kodiak-coolers.com',
                    ...data.getHeaders()
                },
                data: data,
                timeout: 5000, // set timeout to 5 seconds
            });

            // exit loop if request is successful
            break;
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                console.log(`Request timed out. Retrying... (attempt ${retries + 1} of ${maxRetries})`);
                retries += 1;
            }
            else if (error.code === "Cannot read properties of undefined (reading 'data')") {
                console.log("ERROR: reading data");
                errorBool = 1;
                // break;
            }
            else {
                console.log("ERROR:");
                errorBool = 1;
                // break;
            }
        }
    }

    if (retries === maxRetries) {
        console.log(`Request timed out after ${maxRetries} retries.`);
        errorBool = 1;
    }
    console.log(errorBool);
    console.log("CF Upload Done");
    // LINE BELOW IS WHERE WE COULD DEFAULT
    if (errorBool == 1) {
        unique_img_id = 'ERRORXXXX';
        original_img = 'ERRORXXXX';
        designer_img = 'ERRORXXXX';
        thumb_img = 'ERRORXXXX';
    } else {
        unique_img_id = response.data.result.id
        original_img = cf_base_url + unique_img_id + '/original'
        designer_img = cf_base_url + unique_img_id + '/designer'
        thumb_img = cf_base_url + unique_img_id + '/thumb'
    }

    // For Testing our errors we're getting
    console.log(response);

    unique_img_id = response.data.result.id
    original_img = cf_base_url + unique_img_id + '/original'
    designer_img = cf_base_url + unique_img_id + '/designer'
    thumb_img = cf_base_url + unique_img_id + '/thumb'

    return {
        original_img: original_img,
        designer_img: designer_img,
        thumb_img: thumb_img,
        image_id: unique_img_id
    }
}
