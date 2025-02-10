$(document).ready(function() {
  $(".language-detector-section #checkButton").click(function() {
    var sentence = $("#inputText").val().trim();
    var processingMessage = $(".processing-message");
    var spinner = $(".spinner");

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

    $.ajax({
      type: "POST",
      url: "https://lang-dectector-2s4k4qopcq-as.a.run.app/predict",
      data: JSON.stringify({text: sentence}),
      contentType: "application/json",
      dataType: "json",
      success: function(data) {
        $("#outputText").val(data.predicted_language);

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

  $(".language-detector-section #deleteButton").click(function(){
    $("#inputText").val('');
    $("#outputText").val('');
  });
});
