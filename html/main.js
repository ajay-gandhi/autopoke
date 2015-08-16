
$(document).ready(function() {

  // Submit form when enter pressed
  $('.input').keypress(function (e) {
    if (e.which == 13) {
      $('button').trigger('click');
      return false;
    }
  });

  $('div#result')
    .css({
      opacity: '0',
      height: '1px'
    })
    .click(function () {
      // Hide the result box onclick
      $('div#result')
        .animate({
          opacity: '0.0',
          height: '1px'
        }, {
          duration: 500
        });
    });

  $('button').click(function (e) {
    // Disable button
    $(this).prop('disabled', true);

    // Hide the result box
    $('div#result')
      .animate({
        opacity: '0.0',
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
        pokee:    $('input#pokee').val(),
        captcha:  grecaptcha.getResponse()
      }
    }).done(function (results) {
      // Re enable button and new captcha
      $('button').prop('disabled', false);
      grecaptcha.reset();

      // Was login successful?
      if (!results.captcha) {
        $('div#result')
          .css({
            border: '2px solid #D9534F',
            color:  '#D9534F'
          })
          .text('Captcha failed.');

      } else if (results.login) {
        $('div#result')
          .css({
            border: '2px solid #5Cb85C',
            color:  '#5Cb85C'
          })
          .text('Login successful. Poked: ' + results.poked);

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
          height: '50px'
        }, {
          duration: 500
        });
    });
  });
});
