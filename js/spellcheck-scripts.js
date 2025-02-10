$(document).ready(function(){
    $(".spelling-check-section #checkButton").click(function(){
      var sentence = $("#inputText").val().trim();
      var processingMessage = $(".processing-message");
      var spinner = $(".spinner");
      var errorMessage = $("#errorMessage");

      // Check word count
      var words = sentence.split(' ').filter(function(word) {
        return word.length > 0;
      });

      if (words.length > 200) {
        alert("Please enter words less than 200. Your current word count is " + words.length + ".");
        return;
      }

      if (words.length < 3) {
        alert("Please enter 3 or more words. Your current word count is " + words.length + ".");
        return;
      }

      if (sentence.length === 0) {
        alert("Please enter some text.");
        return;
      }

      // Show processing message and spinner
      processingMessage.show();
      spinner.addClass("spin");
      errorMessage.text("");

      $.ajax({
        type: "POST",
        url: "https://spellcheck-2s4k4qopcq-as.a.run.app/spellcheck",
        data: JSON.stringify({sentence: sentence}),
        contentType: "application/json",
        dataType: "json",
        success: function(data) {
          if (data.error) {
            $("#errorModalMessage").html(data.error + "<br/>Predicted language: " + data.predicted_language);
            $("#errorModal").modal("show");
            $("#outputText").val("");
            $("#misspelledText").val("");
          } else {
            var misspelledWords = data.corrected_sentence.filter(function(word) {
              return word[0] !== word[1];
            }).map(function(word) {
              return word[0] + " -> " + word[1];
            }).join(" | "); // Use pipe character as the separator
            $("#misspelledText").val(misspelledWords);

            // Display only the corrected sentence in the outputText textarea
            var correctedSentence = data.corrected_sentence.map(function(word) {
              return word[1];
            }).join(" ");
            $("#outputText").val(correctedSentence);
          }

          // Hide processing message and spinner
          processingMessage.hide();
          spinner.removeClass("spin");
        },
        error: function(err) {
          console.log(err);
          alert("There was an error. Try again later.");

          // Hide processing message and spinner
          processingMessage.hide();
          spinner.removeClass("spin");
        }
      });
    });

    
  // This is the  delete button click event handler
  $(".spelling-check-section #deleteButton").click(function() {
    $("#inputText").val('');
    $("#outputText").val('');
  });

  // Copy button click event handler
  $(".spelling-check-section #copyButton").click(function() {
    var copyText = document.getElementById("outputText");
    copyText.select();
    copyText.setSelectionRange(0, 99999);  // For mobile devices
    document.execCommand("copy");
    //alert("Text copied in the clip!");
  });
});