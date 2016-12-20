/*global io:true */

function init() {
  var socket = io.connect("http://10.10.10.176:3001");

  socket.on('user:connected', function(data) {
    if(data.error){
      console.log(data);
    } else {
      console.log(data);
      // var request_id = localStorage.getItem("request_id") || data.id;
      // localStorage.setItem("request_id", request_id);
      socket.emit('user:joined', {"id": data.id, "role": "user"});
    }
  });

  socket.on('user:joined', function(data) {
    if(data.error){
      console.log(data);
    } else {
      console.log(data);
    }
  });

  socket.on('app:start', function(data) {
    if(data.error){
      console.log(data);
    } else {
      console.log(data);
    }
  });
}


window.onload = function() {
  init();
};
