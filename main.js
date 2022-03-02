const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";
const iplPath = path.join(__dirname,"IPL");
dirCreator(iplPath);
request(url,cb);
function cb(err,response,html){
    if(err) console.log(err);
    else allResultsPage(html);
}
function allResultsPage(html){
    const $ = cheerio.load(html);
    const allResultsLink = $("a[data-hover='View All Results']").attr("href");
    const fullLink = "http://www.espncricinfo.com"+allResultsLink;
    scoreCard(fullLink);
}

function scoreCard(fullLink){
    request(fullLink,function(err,response,fullLink){
        if(err) console.log(err);
        else scoreCardPage(fullLink);
    })
}

function scoreCardPage(fullLink){
     const $ = cheerio.load(fullLink);
     const cardsLinkArr = $("a[data-hover='Scorecard']");
     for(let i=0;i<cardsLinkArr.length;i++){
         let cardsLink ="http://www.espncricinfo.com"+ $(cardsLinkArr[i]).attr("href");
        //  console.log(cardsLink);
        matchDetails(cardsLink);
     }
}

function matchDetails(cardsLink){
    request(cardsLink,function cb1(err,response,cardsLink){
        if(err) console.log(err);
        else matchData(cardsLink);
    })
}

function matchData(cardsLink){
    const $ = cheerio.load(cardsLink);     
    let descElem = $(".header-info .description").text().split(",");
    let venue = descElem[1].trim();
    let date = descElem[2].trim();
    let result = $(".event .status-text").text();
    let scoreTables = $(".card.content-block.match-scorecard-table>.Collapsible");
    for(let i=0;i<scoreTables.length;i++){
        let teamName = $(scoreTables[i]).find("h5").text();
        teamName = teamName.split("INNINGS");
        teamName = teamName[0].trim();
        let opponentIdx;
        if(i==0) opponentIdx=1;
        else opponentIdx = 0;
        let opponentName = $(scoreTables[opponentIdx]).find("h5").text();
        opponentName = opponentName.split("INNINGS");
        opponentName = opponentName[0].trim();
        let cTable = $(scoreTables[i]);
        console.log(`${venue}| ${date} |${teamName}| ${opponentName} |${result}`);
        let allRows = cTable.find(".table.batsman tbody tr");
        for (let j = 0; j < allRows.length; j++) {
            let allCols = $(allRows[j]).find("td");
            let isUseFul = $(allCols[0]).hasClass("batsman-cell");
            if(isUseFul){
                let playerName = $(allCols[0]).text().trim();
                let runs = $(allCols[2]).text().trim();
                let balls = $(allCols[3]).text().trim();
                let fours = $(allCols[5]).text().trim();
                let sixes = $(allCols[6]).text().trim();
                let sr = $(allCols[7]).text().trim(); 
                 console.log(`${playerName} ${runs} ${balls} ${fours} ${sixes} ${sr}`);
                 processPlayer(teamName,playerName,runs,balls,fours,sixes,sr,opponentName,venue,date,result);
            }
        }
    }

}

function dirCreator(filepath){
    if(fs.existsSync(filepath)==false){
        fs.mkdirSync(filepath);
    }
}

function processPlayer(teamName,playerName,runs,balls,fours,sixes,sr,opponentName,venue,date,result){
 let teamPath = path.join(__dirname,"IPL",teamName);
 dirCreator(teamPath);
 let filepath = path.join(teamPath,playerName+".xlsx");
 let content = excelReader(filepath,playerName);
 let playerObj = {
    teamName,playerName,runs,balls,fours,sixes,sr,opponentName,venue,date,result
 }
 content.push(playerObj);
 excelWriter(filepath,content,playerName)
}

//xlsx functions
function excelWriter(filepath,json,sheetName){
    let newWb = xlsx.utils.book_new(); // create new Workbook
    let newWs = xlsx.utils.json_to_sheet(json); // create new workSheet
    xlsx.utils.book_append_sheet(newWb,newWs,sheetName);
    xlsx.writeFile(newWb,filepath);
}
function excelReader(filepath,sheetName){
    if(fs.existsSync(filepath)==false){
        return [];
    }
    let wb = xlsx.readFile(filepath);
    let excelData = wb.Sheets[sheetName];
    let ans = xlsx.utils.sheet_to_json(excelData);
    return ans;
}
