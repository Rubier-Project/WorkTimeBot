const cheerio = require('cheerio');

class PackageStats{
    async getSearchDescriptionFromHTML(
        {
            value = "",
            callback = () => {}
        } = {}
    ){
        const $ = cheerio.load(value);
        
        if (callback){
            const headings = [];
            $('p').each((index, element) => {
                headings.push($(element).text());
            });

            // Accessing the second item (index 1)
            if (headings.length > 1) {
                callback(headings[1]);
            } else {
                callback(null);
            }
        }
    }

    async getProjectDownloadURL(
        {
            value = "",
            callback = () => {}
        } = {}
    ){
        const $ = cheerio.load(value);
        const downloadLinks = [];
        $('a[href$=".whl"], a[href$=".tar.gz"]').each((i, element) => {
            downloadLinks.push($(element).attr('href'));
        });
        if (callback){
            if (downloadLinks.length > 0){
                callback(downloadLinks[0]);
            } else {
                callback(null);
            }
        }
    }

    async getSearchVersion(
        {
            value = "",
            callback = () => {}
        } = {}
    ){
        const $ = cheerio.load(value);
        const spans = [];
        $('span').each((index, element) => {
            spans.push($(element).text());
        });

        if (callback){
            if (spans.length > 0 && spans.length >= 6){
                callback(spans[5]);
            } else {
                callback(null);
            }
        }
    }

    release(
        {
            package_name = "",
            package_version = "",
            search_description = "",
            download_url = ""
        } = {}
    ){
        return {
            package_name: package_name,
            package_version: package_version,
            search_description: search_description,
            download_url: download_url
        };
    }

}

class PackageRelease{
    constructor(pack_release_info){
        this.package_name = pack_release_info.package_name;
        this.package_version = pack_release_info.package_version;
        this.search_description = pack_release_info.search_description;
        this.download_url = pack_release_info.download_url;
    }
}

module.exports = {
    PackageStats, PackageRelease
}