let request = require("request");
let cheerio = require("cheerio");
let scoreCardObj = require("./scoreCard");
function allmatchPagecb(url){
    request(url,function(error,response,html){
    if(error){
        console.log(error);
    }
    else if(response.statusCode == 404){
        console.log("Page Not Found");
    }
    else{
        // console.log(html);
        getAllScoreCardLink(html);
    }
})
}

function getAllScoreCardLink(html){
   let selectorTool = cheerio.load(html);
   let scoreCards = selectorTool("a[data-hover='Scorecard']");
   for(let i=0;i<scoreCards.length;i++){
       let cardLink = selectorTool(scoreCards[i]).attr("href");
       let completeCardLink = "https://www.espncricinfo.com"+cardLink;
       console.log(completeCardLink);
       scoreCardObj.score(completeCardLink);
   }
}

module.exports={
    allTheMatches:allmatchPagecb,
}