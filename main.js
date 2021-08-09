let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";
let fs = require("fs");
let path = require("path");


let request = require("request");
let cheerio = require("cheerio");
let allTheMatchesObj = require("./allMatch");
let iplPath = path.join(__dirname,"ipl");
dirCreator(iplPath);
request(url,cb);

function cb(error,response,html){
    if(error){
        console.log(error);
    }
    else if(response.statusCode==404){
        console.log("Page Not Found");
    }
     else{
        dataExtractor(html);
    }
}
function dataExtractor(html){
    let searchTool = cheerio.load(html);
    let anchorrep = searchTool('a[data-hover="View All Results"]');
    let link = anchorrep.attr("href");
    let fullAllmatchPageLink = `https://www.espncricinfo.com${link}`;
    // console.log(fullAllmatchPageLink);
    // request(fullAllmatchPageLink,allmatchPagecb);
    // allmatchPagecb(fullAllmatchPageLink);
    allTheMatchesObj.allTheMatches(fullAllmatchPageLink);
}
function dirCreator(filePath){
    if(fs.existsSync(filePath)==false){
        fs.mkdirSync(filePath); 
    }
}
