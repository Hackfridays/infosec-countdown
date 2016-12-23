/*global io:true, $:true */

function init() {
  var socket = io.connect("http://10.10.10.176:3001");
  var request_id = 0;
  var counterTime = 45; // in minutes
  var timeinterval;
  var animationFrameID;
  var deadline = new Date();
  var start = false;

  $('.main-wrapper, div.toggle, #matrix').on('click', function (){ if(start) $('header').toggle(); });
  $('button').on('click', function (){ validatePassword($('#password').val()); });
  $("#wrong, header, #success").hide();

  function validatePassword(password) {
    socket.emit('map:unlock', {"id": request_id, "password": password});
  }

  function startCountdown(time) {
    deadline = new Date(new Date(time).getTime() + counterTime*60*1000);
    console.log(deadline);
    updateClock();
    timeinterval = setInterval(updateClock, 1000);
  }

  function resetCountdown() {
    $("#wrong, header, #success, #matrix").hide();
    if($('#input').css('display') == 'none') $('#input').toggle();
    window.cancelAnimationFrame(animationFrameID);
    clearInterval(timeinterval);
    deadline = new Date(new Date().getTime() + 0*60*1000);
    updateClock();
  }

  function zeroPad(str, max) {
    str = str.toString();
    return str.length < max ? zeroPad("0" + str, max) : str;
  }

  function getTimeRemaining() {
    var t = Date.parse(deadline) - Date.parse(new Date());
    var seconds = Math.floor( (t/1000) % 60 );
    var minutes = Math.floor( (t/1000/60) % 60 );
    var hours = Math.floor( (t/(1000*60*60)) % 24 );
    var days = Math.floor( t/(1000*60*60*24) );
    return {
      'total': t,
      'days': days,
      'hours': hours,
      'minutes': minutes,
      'seconds': seconds
    };
  }

  function updateClock() {
    var t = getTimeRemaining();
    $('#counter').html(zeroPad(t.minutes, 2) + ':' + zeroPad(t.seconds, 2));
    if (t.total <= 0) {
      clearInterval(timeinterval);
    }
  }

  function matrixAnimation() {
    var c = document.getElementById("matrix");
    var ctx = c.getContext("2d");

    //making the canvas full screen
    c.height = window.innerHeight;
    c.width = window.innerWidth;

    //chinese characters - taken from the unicode charset
    var chinese = "田由甲申甴电甶男甸甹町画甼甽甾甿畀畁畂畃畄畅畆畇畈畉畊畋界畍畎畏畐畑";
    //converting the string into an array of single characters
    chinese = chinese.split("");

    var font_size = 10;
    var columns = c.width/font_size; //number of columns for the rain
    //an array of drops - one per column
    var drops = [];
    //x below is the x coordinate
    //1 = y co-ordinate of the drop(same for every drop initially)
    for(var x = 0; x < columns; x++)
      drops[x] = 1;

    //drawing the characters
    function draw() {
      //Black BG for the canvas
      //translucent BG to show trail
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, c.width, c.height);

      ctx.fillStyle = "#0F0"; //green text
      ctx.font = font_size + "px arial";
      //looping over drops
      for(var i = 0; i < drops.length; i++) {
        //a random chinese character to print
        var text = chinese[Math.floor(Math.random()*chinese.length)];
        //x = i*font_size, y = value of drops[i]*font_size
        ctx.fillText(text, i*font_size, drops[i]*font_size);

        //sending the drop back to the top randomly after it has crossed the screen
        //adding a randomness to the reset to make the drops scattered on the Y axis
        if(drops[i]*font_size > c.height && Math.random() > 0.975)
          drops[i] = 0;

        //incrementing Y coordinate
        drops[i]++;
      }
      animationFrameID = window.requestAnimationFrame(draw);
    }
    animationFrameID = window.requestAnimationFrame(draw);
  }

  socket.on('user:connected', function(data) {
    console.log(data);
    request_id = data.id; // localStorage.getItem("request_id") || data.id;
    localStorage.setItem("request_id", request_id);
    socket.emit('user:joined', {"id": request_id, "role": "user"});
  });

  socket.on('app:password', function(data) {
    if(!data.valid){
      console.log(data);
      $("#wrong, label").toggle();
	    $('#password').val("");
      setTimeout(function(){ $("#wrong, label").toggle(); }, 3200);
    } else {
      console.log(data);
      if(!$('header').is(':visible')) $('header').toggle();
      if($('#input').css('display') != 'none') $('#input').toggle();
	    $('#password').val("");
      $("#matrix, #success").show();
      matrixAnimation();
      clearInterval(timeinterval);
    }
  });

  socket.on('app:start', function(data) {
    console.log(data);
    if(data.start) {
      start = true;
      startCountdown(data.timer);
    }
  });

  socket.on('app:reset', function(data) {
    console.log(data);
    start = false;
    resetCountdown();
  });
}


window.onload = function() {
  init();
};
