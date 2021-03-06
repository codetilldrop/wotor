// A variable which holds the high score from the database
var databaseScore = 0;

// A simple loop to just update the score in the database every 20 seconds if the score is higher then the one in the database
setInterval(function () {
  // Get the actual database score
  database.child(uid).child("score").once("value", function(snapshot) {
    databaseScore = snapshot.child("score").val();

    if (databaseScore === null) {
      databaseScore = 0;
    }
  });

  if ((databaseScore < score) && (death !== true)) {
    database.child(uid).child("score").update({
      score: score
    });
  }
}, 30000);
