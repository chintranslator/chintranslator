$(document).ready(function(){
  // Maximum allowed words
  var maxWords = 50;

  // Ensure a word count display element exists in the input container
  if ($("#wordCount").length === 0) {
    $("#inputText").closest(".textarea-container").append(
      '<div id="wordCount" style="position:absolute; bottom:15px; right:20px; font-size:0.8em; color:#999;">0/' + maxWords + '</div>'
    );
  }

  // Function to update the word count display
  function updateWordCount() {
    var text = $("#inputText").val();
    var words = text.trim().split(/\s+/).filter(function(word) {
      return word.length > 0;
    });
    var count = words.length;
    $("#wordCount").text(count + "/" + maxWords);
    if(count > maxWords) {
      var trimmedWords = words.slice(0, maxWords);
      $("#inputText").val(trimmedWords.join(" "));
      $("#wordCount").text(maxWords + "/" + maxWords);
      alert("Maximum word limit reached (" + maxWords + " words). Please shorten your text.");
    }
  }
  
  $("#inputText").on("input", function(){
    updateWordCount();
  });
  
  // Toggle for Generate Audio using iOS-style toggle
  $("#audioToggle").change(function(){
    console.log("Audio toggle changed. Checked?", $(this).is(":checked")); // Debug log
    if ($(this).is(":checked")) {
      $("#voiceSelectionContainer").slideDown();
      populateVoiceOptions();
    } else {
      $("#voiceSelectionContainer").slideUp();
    }
  });
  
  // Function to populate voice options based on translation direction
  function populateVoiceOptions(){
    var translationDirection = $("input[name='translationToggle']:checked").val();
    console.log("Populating voice options for translation direction:", translationDirection); // Debug log
    var voiceOptionsContainer = $("#voiceOptions");
    voiceOptionsContainer.empty();
    if (translationDirection === "FLM") {
      // For FLM input (output is English), display options in the order: US[F] (default), ENG[M], ENG[F]
      voiceOptionsContainer.append(
        '<div class="voice-toggle-group">' +
          '<input type="radio" name="voiceOption" id="voice_US_F" value="audio_american_female" checked>' +
          '<label for="voice_US_F">US[F]</label>' +
          '<input type="radio" name="voiceOption" id="voice_ENG_M" value="audio_eng_male">' +
          '<label for="voice_ENG_M">ENG[M]</label>' +
          '<input type="radio" name="voiceOption" id="voice_ENG_F" value="audio_eng_female">' +
          '<label for="voice_ENG_F">ENG[F]</label>' +
        '</div>'
      );
    } else {
      // For ENG input (output is Falam), options remain unchanged
      voiceOptionsContainer.append(
        '<div class="voice-toggle-group">' +
          '<input type="radio" name="voiceOption" id="voice_FLM_F" value="audio_flm_female" checked>' +
          '<label for="voice_FLM_F">FLM[F]</label>' +
          '<input type="radio" name="voiceOption" id="voice_FLM_M" value="audio_flm_male">' +
          '<label for="voice_FLM_M">FLM[M]</label>' +
        '</div>'
      );
    }
  }
  
  
  // Update voice options when translation direction changes
  $("input[name='translationToggle']").change(function(){
    if ($("#audioToggle").is(":checked")) {
      populateVoiceOptions();
    }
  });
  
  // Clear audio state function (hide audio button)
  function clearAudioState(){
    $("#audioButton").hide().removeClass("blinking audio-ready").off("click");
  }
  
  // Translation button click logic
  $("#translateButton").click(function(){
    $("#outputText").val('');
    clearAudioState();
    
    var sentence = $("#inputText").val().trim();
    var translationDirection = $("input[name='translationToggle']:checked").val();
    var translationMode = $("input[name='translationMode']:checked").val();
    var processingMessage = $(".processing-message");
    var spinner = $(".spinner");
    
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
    
    // Determine if audio is requested and get voice option if so
    var audioRequested = $("#audioToggle").is(":checked");
    
    // Build the payload object
    var payload = {
      text: sentence,
      lang: translationDirection,
      mode: translationMode,
      audio: audioRequested
    };
    
    // Only include audio_option if audio is requested
    if (audioRequested) {
      payload.audio_option = $("input[name='voiceOption']:checked").val();
    }
    
    $.ajax({
      type: "POST",
      url: "https://chintranslator-router-575463385612.asia-southeast1.run.app/translate",
      data: JSON.stringify(payload),
      contentType: "application/json",
      dataType: "json",
      success: function(data) {
        if (data.error) {
          $("#errorModalMessage").text(data.error);
          $("#errorModal").modal("show");
          $("#outputText").val("");
        } else {
          $("#outputText").val(data.translated_text);
          if (data.request_id) {
            setupAudioButton(data.request_id);
            pollForAudio(data.request_id);
          }
        }
        processingMessage.hide();
        spinner.removeClass("spin");
      },
      error: function(err) {
        console.log(err);
        alert("There was an error. Try again later.");
        processingMessage.hide();
        spinner.removeClass("spin");
      }
    });
  });
  
  // Delete button: clear input, output, word count, and audio state
  $("#deleteButton").click(function() {
    $("#inputText").val('');
    $("#outputText").val('');
    $("#wordCount").text("0/" + maxWords);
    clearAudioState();
  });
  
  // Copy button: copy output text and show feedback
  $("#copyButton").click(function() {
    var outputTextEl = $("#outputText");
    var textToCopy = outputTextEl.val();
    if(navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(textToCopy)
        .then(function() {
          showCopyFeedback();
        })
        .catch(function() {
          fallbackCopy(textToCopy);
        });
    } else {
      fallbackCopy(textToCopy);
    }
  });
  
  function fallbackCopy(text) {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
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
  
  // Audio button setup: show button in blinking state (disabled)
  function setupAudioButton(requestId) {
    var audioButton = $("#audioButton");
    audioButton.show();
    audioButton.addClass("blinking");
    audioButton.prop("disabled", true);
  }
  
  // Poll for audio status using the request_id
  function pollForAudio(requestId) {
    var pollInterval = 3000; // 3000 ms (3 seconds)
    var pollAudioStatus = function() {
      $.ajax({
        type: "GET",
        url: "https://chintranslator-router-575463385612.asia-southeast1.run.app/audio_status",
        data: { request_id: requestId },
        dataType: "json",
        success: function(statusData) {
          if (statusData.status === "completed") {
            var audioButton = $("#audioButton");
            audioButton.removeClass("blinking").addClass("audio-ready");
            audioButton.prop("disabled", false);
            audioButton.off("click").on("click", function(){
              var audioElement = document.getElementById("audioPlayer");
              audioElement.src = statusData.audio_url;
              audioElement.load(); // Ensure the new source is loaded
              audioElement.play().catch(function(error) {
                console.error("Playback error:", error);
              });
            });            
            clearInterval(pollTimer);
          } else if (statusData.status === "failed") {
            console.error("Audio generation failed.");
            $("#audioButton").hide();
            clearInterval(pollTimer);
          }
        },
        error: function(err) {
          console.log("Error polling audio status:", err);
        }
      });
    };
    var pollTimer = setInterval(pollAudioStatus, pollInterval);
  }
});



