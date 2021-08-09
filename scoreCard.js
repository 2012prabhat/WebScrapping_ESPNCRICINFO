// let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595/mumbai-indians-vs-chennai-super-kings-1st-match-1216492/full-scorecard";

let request = require("request");
let cheerio = require("cheerio");
let fs = require("fs");
let path = require("path");
let xlsx = require("xlsx");


function processScoreCard(url){

    request(url,cb);
}

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
    let selectorTool = cheerio.load(html);
    let dateVenue = selectorTool(".event .description");
    let result = selectorTool(".event .status-text" );
    let arr = dateVenue.text().split(",");
    let venue = arr[1].trim();
    let date = arr[2].trim();
    result = result.text();
    let innings = selectorTool(".card.content-block.match-scorecard-table>.Collapsible");
    for(let i=0;i<innings.length;i++){
        let teamName=selectorTool(innings[i]).find("h5").text();
        let opponentIndex = i==0?1:0;
        let opponentName = selectorTool(innings[opponentIndex]).find("h5").text();
        opponentName = opponentName.split("INNINGS")[0].trim();
        let innings1 = selectorTool(innings[i]);
        console.log(`${venue}| ${date} |${teamName}|${opponentName}|${result}`);
        let rows = innings1.find(".table.batsman tbody tr");
        for(let j=0;j<rows.length;j++){
            let cols = selectorTool(rows[j]).find("td");
            let isWorthy = selectorTool(cols[0]).hasClass("batsman-cell");
            if(isWorthy==true){
                let playerName = selectorTool(cols[0]).text().trim();
                let runs = selectorTool(cols[2]).text().trim();
                let balls = selectorTool(cols[3]).text().trim();
                let fours = selectorTool(cols[5]).text().trim();
                let  sixes= selectorTool(cols[6]).text().trim();
                let  sr= selectorTool(cols[7]).text().trim();
                console.log(playerName,runs,balls,fours,sixes,sr);
                processPlayer(teamName,playerName,runs,balls,fours,sixes,sr,opponentName,venue,date,result);

            }
        }
    }
}
function processPlayer(teamName,playerName,runs,balls,fours,sixes,sr,opponentName,venue,date,result){
    let teamPath = path.join(__dirname,"ipl",teamName);
    dirCreator(teamPath);
    let filePath = path.join(teamPath,playerName + ".xlsx");
    let content = excelReader(filePath,playerName);
    let playerObj={
        teamName,
        playerName,
        runs,
        balls,
        fours,
        sixes,
        sr,
        opponentName,
        venue,
        date,
        result
    }
    content.push(playerObj);
    excelWriter(filePath,content,playerName);
}
function dirCreator(filePath){
    if(fs.existsSync(filePath)==false){
        fs.mkdirSync(filePath); 
    }
}
function excelWriter(filePath,json,sheetName){
    let newWB = xlsx.utils.book_new();
    let newWS = xlsx.utils.json_to_sheet(json);
    xlsx.utils.book_append_sheet(newWB,newWS,sheetName);
    xlsx.writeFile(newWB,filePath);
}

function excelReader(filePath,sheetName){
    if(fs.existsSync(filePath)==false){
        return [];
    }
    let wb=xlsx.readFile(filePath);
    let excelData = wb.sheets[sheetName];
    let ans = xlsx.utils.sheet_to_json(excelData);
    return ans;
}
module.exports={
    score:processScoreCard,
}