/*global io:true, $:true */

function init() {
  var socket = io.connect("http://192.168.1.101:3001");
  var request_id = 0;
  var counterTime;
  var waitTime = 2000; // time to wait before showing screen again
  var timeinterval;
  var animationFrameID;
  var deadline = new Date();
  var timeDiff = 0;
  var start = false;

  $('.main-wrapper, div.toggle, #matrix').on('click', function (){ if(start) $('header').toggle(); });
  $('button').on('click', function (){ validatePassword($('#password').val()); });
  $(".wrongBG, header, #success, .block").hide();

  function validatePassword(password) {
    socket.emit('map:unlock', {"id": request_id, "password": password});
    $(".block").fadeIn();
  }

  function startCountdown(time) {
    resetCountdown();
    deadline = new Date(new Date(time).getTime() + counterTime - timeDiff);
    console.log(deadline);
    updateClock();
    timeinterval = setInterval(updateClock, 1000);
  }

  function resetCountdown() {
    $(".wrongBG, header, #success, #matrix").hide();
    if($('#input').css('display') == 'none') $('#input').toggle();
    if(animationFrameID) window.cancelAnimationFrame(animationFrameID);
    if(timeinterval) clearInterval(timeinterval);
    deadline = new Date();
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
      if(timeinterval) clearInterval(timeinterval);
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
      window.onresize = function() {
        c.height = window.innerHeight;
        c.width = window.innerWidth;
        font_size = 10;
        columns = c.width/font_size;
        drops = [];
        for(var x = 0; x < columns; x++)
          drops[x] = 1;
      }
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
    console.log('user:connected', data);
    request_id = localStorage.getItem("request_id") || data.id;
    localStorage.setItem("request_id", request_id);
    socket.emit('user:joined', {"id": request_id, "role": "user", "date": new Date().getTime(), "newid": data.id});
  });

  socket.on('user:timediff', function(data) {
    console.log('user:timediff', data);
    timeDiff = data.timediff;
  });

  socket.on('user:updateId', function(data) {
    console.log('user:updateId', data);
    request_id = data.id;
    localStorage.setItem("request_id", request_id);
  });

  socket.on('app:password', function(data) {
    $(".block").fadeOut();
    if(!data.valid){
      console.log(data);
      $(".wrongBG, #input").toggle();
	    $('#password').val("");
      setTimeout(function(){ $('.wrongBG').trigger('stopRumble'); $(".wrongBG, #input").toggle(); }, waitTime);
      $('.wrongBG').jrumble({
      	x: 10,
      	y: 10,
      	rotation: 4
      });
      $('.wrongBG').trigger('startRumble');
    } else {
      console.log(data);
      if(!$('header').is(':visible')) $('header').toggle();
      if($('#input').css('display') != 'none') $('#input').toggle();
	    $('#password').val("");
      $("#matrix, #success").show();
      matrixAnimation();
      if(timeinterval) clearInterval(timeinterval);
    }
  });

  socket.on('app:start', function(data) {
    console.log(data);
    if(data.start && !data.paused) {
      start = true;
      counterTime = data.timer;
      startCountdown(data.startTime);
    }
  });

  socket.on('app:reset', function(data) {
    console.log(data);
    start = false;
    resetCountdown();
  });

  socket.on('app:pause', function(data) {
    console.log(data);
    if(data.state) {
      // start = false;
      if(timeinterval) clearInterval(timeinterval);
    } else {
      // start = true;
      counterTime = data.timer;
      startCountdown(data.startTime);
    }
  });
}


window.onload = function() {
  init();
};
