<!DOCTYPE html>
<html>
<head>
  <script src="/socket.io/socket.io.js"></script>
  <script src="http://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js" type="text/javascript"></script>
  <link rel="stylesheet" type="text/css" href="style.css">
</head>

<body>
<div id="mensagens"></div><input type="button" id="EndGame" value="EndGame"/>
  <div class="control" id="controlo">
      <a class="bt bt_top"><</a>
      <a class="bt bt_right">></a>
      <a class="bt bt_bottom">></a>
      <a class="bt bt_left"><</a>
      <a class="bt bt_bomba"></a>
      <a class="background"></a>
  </div>

  <div id="NovoJogador">
    <form  method="get">
    <input placeholder="Nome" class="Nnome" id="Nome" />
    <input type="button" class="Nenviar" value="Enviar" id="b_enviar" />
    </form>
</div>

<div id="texto">Por favor, Espere...</div>

<script>
    var socket = io.connect();
    var show = 0;

socket.on('Dead',function(msg){
      document.getElementById('controlo').style.display='none';
      document.getElementById('texto').style.display='block';
});

socket.on('Inicio',function(msg){
      document.getElementById('texto').style.display='none'; 
      switch(msg) { 
      /*  case J1:
          code block
        break;
        case J2:
          code block
        break;
        case J3:
          code block
        break;
        case J4:
          code block
        break;*/
        default:
          document.getElementById('controlo').style.display='block';
        break;
}
});

$(document).ready(function(button){
    msgnome = <?php echo $_GET['nome']?>;
    envianome();
  });
  		$("#EndGame").hide();
    	var divmsg = document.getElementById('mensagens');
    	var socket = io.connect();  //Liga ao node.js por websocket | do outro lado chega uma mensagem chamada connection
		var JogadoresID= new Array();;
		var JogadoresNome= new Array();;
		var CentralSocket;
		 socket.emit('Pronto', "Pronto");
  socket.on("Njogadores", function (msg) {
      //divmsg.innerHTML = msg;
	  
  });
   
  socket.on("ID", function (msg) {
	  console.log(msg);
      divmsg.innerHTML = msg.id;
	  
  });
   socket.on("Resfresh", function (msg) {
	  location.reload();
  }); 
  socket.on("Inicio", function (msg) {
	  console.log("Go");
      divmsg.innerHTML = msg;
	  CentralSocket = socket;
	  $("#EndGame").show();
	  
  });

  $("#EndGame").click(function(){
	socket.emit("EndGame","EndGame");
 });
});
socket.on("Win", function (msg) {	
	alert("Ganhou !");
});

$("#b_enviar").click(function(e){
	e.preventDefault();
    document.getElementById('NovoJogador').style.display='none';
    document.getElementById('controlo').style.display='block';
    show = 1;
});

if(show == 0 )
{
  document.getElementById('controlo').style.display='none';
  document.getElementById('texto').style.display='none';
}


function envianome()
{
  // document.getElementById('NovoJogador').style.display='none';
  socket.emit("Nome",msgnome);
}
    $(document).ready(function(button){

      $('.bt_left').click(function(){ 
        msgmovimento = "Esquerda";
        envia();
    	});

      $('.bt_right').click(function(){
        msgmovimento = "Direita";
        envia();
    	});

      $('.bt_top').click(function(){
        msgmovimento = "Cima";
        envia();
    	});

      $('.bt_bottom').click(function(){
        msgmovimento = "Baixo";
          envia();
      });

      $('.bt_bomba').click(function(){
        msgmovimento = "BOMBA!!";
        envia();
      });
    });

    function envia()
    {
      socket.emit("Movimento",msgmovimento);
    }

  </script>

</body>
</html>
