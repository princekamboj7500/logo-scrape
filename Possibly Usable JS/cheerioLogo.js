const request = require('request');
const cheerio = require('cheerio');

exports.getValue = function (options) {

    // const url = 'https://www.example.com';
    let url = this.parse(options.input)

    request(url, (error, response, html) => {
        if (!error && response.statusCode == 200) {
            const $ = cheerio.load(html);

            // Look for the logo URL in the page's `<head>` section
            const logoUrl = $('head > link[rel="shortcut icon"]').attr('href');
            console.log(logoUrl);
        }
    });
};
