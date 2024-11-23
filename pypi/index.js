let require_axios = require("axios");
const { PackageStats, PackageRelease } = require("./types");
const packStates = new PackageStats();
let axios = new require_axios.Axios("POST");
let get_axios = new require_axios.Axios("GET");

const getSearchUrl = () => { return "https://pypi.org/search/?q="; };
const getProjectUrl = () => { return "https://pypi.org/project/"; };

class Pypi {
    constructor() {
        this.search_url = "https://pypi.org/search/?q=";
        this.project_url = "https://pypi.org/project/";
    }

    async search(
        {
            module_name = "",
            callback = () => {}
        } = {}
    ){
        const resp = (await axios.get(this.search_url+module_name)).data
        if (callback){
            callback(resp);
        }
    }

    async project(
        {
            module_name = "",
            callback = () => {}
        } = {}
    ){
        const resp = (await axios.get(this.project_url+module_name)).data
        if (callback){
            callback(resp);
        }
    }

    async on(
        {
            module_name = "",
            callback = () => {}
        } = {}
    ){
        this.search(
            {
                module_name: module_name,
                callback: (searched_logs) => {
                    this.project(
                        {
                            module_name: module_name,
                            callback: (projects_logs) => {
                                packStates.getSearchDescriptionFromHTML(
                                    {
                                        value: searched_logs,
                                        callback: (des) => {
                                            packStates.getSearchVersion(
                                                {
                                                    value: searched_logs,
                                                    callback: (ver) => {
                                                        packStates.getProjectDownloadURL(
                                                            {
                                                                value: projects_logs,
                                                                callback: (dlurl) => {
                                                                    if (callback){
                                                                        callback(
                                                                            packStates.release(
                                                                                {
                                                                                    package_name: module_name,
                                                                                    package_version: ver,
                                                                                    search_description: des,
                                                                                    download_url: dlurl
                                                                                }
                                                                            )
                                                                        )
                                                                    }
                                                                }
                                                            }
                                                        )
                                                    }
                                                }
                                            )
                                        }
                                    }
                                )
                            }
                        }
                    )
                }
            }
        )
    }

}


module.exports = {
    Pypi, PackageStats, PackageRelease, axios, get_axios, require_axios
}