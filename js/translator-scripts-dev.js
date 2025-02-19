$(document).ready(function(){
  // Maximum allowed words
  var maxWords = 50;

  // Ensure a word count display element exists in the input container
  if ($("#wordCount").length === 0) {
    // Append it to the first .textarea-container that holds the input (adjust if necessary)
    $("#inputText").closest(".textarea-container").append(
      '<div id="wordCount" style="position:absolute; bottom:15px; right:20px; font-size:0.8em; color:#999;">0/' + maxWords + '</div>'
    );
  }

  // Function to update the word count display
  function updateWordCount() {
    var text = $("#inputText").val();
    // Use a regex to split by whitespace and filter out empty strings
    var words = text.trim().split(/\s+/).filter(function(word) {
      return word.length > 0;
    });
    var count = words.length;
    $("#wordCount").text(count + "/" + maxWords);

    // If the count exceeds maxWords, trim the text and alert the user
    if(count > maxWords) {
      var trimmedWords = words.slice(0, maxWords);
      $("#inputText").val(trimmedWords.join(" "));
      $("#wordCount").text(maxWords + "/" + maxWords);
      alert("Maximum word limit reached (" + maxWords + " words). Please shorten your text.");
    }
  }

  // Bind the input event to update the count as the user types
  $("#inputText").on("input", function(){
    updateWordCount();
  });

  // Existing translation button click logic with an updated word count check
  $("#translateButton").click(function(){
    // Clear previous output as soon as the button is clicked.
    $("#outputText").val('');

    var sentence = $("#inputText").val().trim();
    // The select now returns FLM or ENG (matching the API language codes)
    // Get translation direction from the toggle group (FLM or ENG)
    var translationDirection = $("input[name='translationToggle']:checked").val();
    // Get the selected translation mode (short or long; long is default)
    var translationMode = $("input[name='translationMode']:checked").val();
    var processingMessage = $(".processing-message");
    var spinner = $(".spinner");

    // Check word count on submit
    var words = sentence.split(/\s+/).filter(function(word) {
      return word.length > 0;
    });

    if (words.length > maxWords) {
      alert("Please shorten your input to " + maxWords + " words. Your current word count is " + words.length + ".");
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
      // Cloud Function endpoint that proxies to Cloud Run
      url: "https://chintranslator-proxy-575463385612.asia-southeast2.run.app",
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
          $("#outputText").val(data.translated_text);
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

  // Delete button: clear the input, output, and reset word count display
  $("#deleteButton").click(function() {
    $("#inputText").val('');
    $("#outputText").val('');
    $("#wordCount").text("0/" + maxWords);
  });

  // Copy button: copy output text and show feedback
  $("#copyButton").click(function() {
    var outputTextEl = $("#outputText");
    var textToCopy = outputTextEl.val();
    
    if(navigator.clipboard && window.isSecureContext) {
      // Use the modern Clipboard API
      navigator.clipboard.writeText(textToCopy)
        .then(function() {
          showCopyFeedback();
        })
        .catch(function() {
          fallbackCopy(textToCopy);
        });
    } else {
      // Fallback method
      fallbackCopy(textToCopy);
    }
  });

  // Fallback function for older browsers
  function fallbackCopy(text) {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed"; // Prevent scrolling to bottom
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    
    try {
      var successful = document.execCommand("copy");
      if(successful) {
        showCopyFeedback();
      } else {
        alert("Unable to copy text.");
      }
    } catch(err) {
      alert("Unable to copy text.");
    }
    document.body.removeChild(textarea);
  }

  // Function to display the "Copied!" feedback
  function showCopyFeedback() {
    var copyButton = $("#copyButton");
    var feedback = $("<span class='copy-feedback'>COPIED!</span>");
    copyButton.after(feedback);
    setTimeout(function() {
      feedback.fadeOut(100, function() {
        $(this).remove();
      });
    }, 1500);
  }
});
