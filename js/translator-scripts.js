$(document).ready(function(){
  $("#translateButton").click(function(){
    var sentence = $("#inputText").val().trim();
    // The select now returns FLM or ENG (matching the API language codes)
    var translationDirection = $("#translationDirection").val();
    // Get the selected translation mode (short or long; long is default)
    var translationMode = $("input[name='translationMode']:checked").val();
    var processingMessage = $(".processing-message");
    var spinner = $(".spinner");

    // Check word count
    var words = sentence.split(' ').filter(function(word) {
      return word.length > 0;
    });

    if (words.length > 100) {
      alert("Please enter words less than 15. Your current word count is " + words.length + ".");
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
      // Updated URL: This Cloud Function proxies to your Cloud Run service
      url: "https://asia-southeast1-chintranslator.cloudfunctions.net/chintranslator-proxy",
      data: JSON.stringify({
        text: sentence,
        lang: translationDirection, // FLM or ENG
        mode: translationMode         // short or long
      }),
      contentType: "application/json",
      dataType: "json",
      success: function(data) {
        if (data.error) {
          $("#errorModalMessage").text(data.error);
          $("#errorModal").modal("show");
          $("#outputText").val("");
        } else {
          $("#outputText").val(data.translated_sentence);
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

  // Delete button click event handler
  $("#deleteButton").click(function() {
    $("#inputText").val('');
    $("#outputText").val('');
  });

  // Copy button click event handler
  $("#copyButton").click(function() {
    var copyText = document.getElementById("outputText");
    copyText.select();
    copyText.setSelectionRange(0, 99999);  // For mobile devices
    document.execCommand("copy");
  });
});