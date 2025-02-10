$(document).ready(function() {

    // Define the function within the document ready scope
    function showVerseInputs(num_verses) {
        var container = $(".lyric-generator-section #verse_inputs");
        container.html("");
        for (var i = 1; i <= num_verses; i++) {
        container.append('<label for="verse' + i + '">Verse ' + i + ':</label><br><input type="text" class="form-control" id="verse' + i + '" name="verse' + i + '"><br>');
        }
    }

    // Ensure this event handler is set up to call the function
    $(".lyric-generator-section #num_verses").change(function() {
        showVerseInputs($(this).val());
    });

    $(".lyric-generator-section #generateButton").click(function() {
      var num_verses = $("#num_verses").val();
      var seeds = [];
      var hasVerse = false;
      for (var i = 1; i <= num_verses; i++) {
        var verse = $("#verse" + i).val().trim();
        seeds.push(verse);
        if (verse.length > 0 && verse.split(" ").length >= 3) {
          hasVerse = true;
        } else if (verse.length > 0) {
          alert("Please input more than 3 words for each verse to get better results.");
          return;
        }
      }
      var chorus = $("#chorus").val().trim();
      seeds.push(chorus);
  
      if (chorus.length === 0 || chorus.split(" ").length < 3) {
        alert("Please input more than 3 words for the chorus to get better results.");
        return;
      }
  
      if (!hasVerse) {
        alert("Please enter a seed text for at least one verse.");
        return;
      }
  
      var num_lines = $("#num_lines").val();
  
      $("#outputText").val("");
  
      var processingMessage = $(".lyric-generator-section .processing-message");
      var spinner = processingMessage.find(".spinner-border");
  
      processingMessage.show();
      spinner.addClass("spin");
  
      $.ajax({
        type: "POST",
        url: "https://composer-2s4k4qopcq-as.a.run.app/generate/",
        data: JSON.stringify({
          seed: seeds,
          num_lines: num_lines,
          max_length: 100
        }),
        contentType: "application/json",
        dataType: "json",
        success: function(data) {
          if (data.error) {
            alert(data.error);
          } else {
            $("#outputText").val(data.lyrics);
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
  
    $(".lyric-generator-section #clearButton").click(function() {
      $(".lyric-generator-section #verse_inputs input").val("");
      $(".lyric-generator-section #chorus").val("");
      $(".lyric-generator-section #outputText").val("");
    });
  
    $(".lyric-generator-section #copyButton").click(function() {
      var copyText = document.getElementById("outputText");
      copyText.select();
      copyText.setSelectionRange(0, 99999); // For mobile devices
      document.execCommand("copy");
      alert("Lyrics copied to clipboard!");
    });
  });
  