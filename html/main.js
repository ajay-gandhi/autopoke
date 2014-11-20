$(document).ready(function() {
  $('div#result').css({
    opacity: '0',
    padding: '0px 10px',
    height: '1px'
  });

  $('button').click(function (e) {
    // Hide the result box
    $('div#result')
      .animate({
        opacity: '0.0',
        padding: '0px 10px',
        height: '1px'
      }, {
        duration: 500
      });

    // Don't submit the form
    e.preventDefault();

    // AJAX to server
    $.ajax({
      url: 'begin',
      data: {
        email:    $('input#email').val(),
        password: $('input#password').val(),
        pokee:    $('input#pokee').val()
      }
    }).done(function (results) {
      var results = JSON.parse(results);

      // Was login successful?
      if (results.login) {
        $('div#result')
          .css({
            border: '2px solid #5Cb85C',
            color:  '#5Cb85C'
          })
          .text('Login successful. Autopoke started!');

      } else {
        $('div#result')
          .css({
            border: '2px solid #D9534F',
            color:  '#D9534F'
          })
          .text('Login failed.');
      }

      $('div#result')
        .animate({
          opacity: '1.0',
          padding: '10px',
          height: '50px'
        }, {
          duration: 500
        });
    });
  });
});