$(document).on("click",".scrape", function(){
  $.get("/api/scrape", function(res){
    console.log(res);
  })
})