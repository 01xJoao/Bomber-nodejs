// usar a framework express para web apps
var express = require('express');
// criar uma app/router com base no express
var app = express();

// usar um servidor http
var http = require('http');
// criar um servidor http para a app/router
var server = http.createServer(app);

// usar o módulo path (utilidades de caminhos)
var path = require('path');

// usar o servidor de conteudos estaticos do express
app.use(express.static(path.resolve(__dirname, 'Content')));

//integrar sockets
var socketio = require("socket.io");
var io = socketio.listen(server);

/*app.get("/teste", function (res,res){
  res.send("funca");
});*/

var contador = 0;
var Ingamecontador = 0;
var tempcontador=0;
var Totaltempo=10000;
var TotaltempoI=10000;
var temporizador;
var temporizador2; 
var EstadoJogo= false;
var JogadoresID= new Array();
var JogadoresIDsock= new Array();
var JogadoresNome= new Array();
var EcranSocket;
var Terreno;
var Jogador1;
var Jogador2;
var Jogador3;
var Jogador4;
var ready=false;
var BombaTimer=3500;
var Bombas = new Array();
var TickBombas;
var Nbomba=0;
var JTemp;

        

io.on('connection', function(socket){
if(socket.handshake.address!="127.0.0.1"){ 
	contador++; 
	//console.log("IP: "+ socket.handshake.address);
	//socket.id = Math.floor(Math.random() * 1000);
	socket.join(socket.id);
	JogadoresID.push(socket.id);
	JogadoresIDsock.push(socket);
	io.sockets.emit('NomeJ', socket.id);
	JogadoresNome.push("Jogador"+contador);
	socket.on('data', function(data) {
		socket.write(socket.id);	
	  }); 
	  var i = JogadoresID.indexOf(socket.id);
	  console.log('Novo cliente ligado numero: ' + contador + " com ID:"+ socket.id + " e nome: " + JogadoresNome[i]);
	  if(contador>=2 && EstadoJogo==false && contador<=4){
			ResetTempo();
		}
  }else{
	console.log("Ligou-se o Ecran principal");  
	EcranSocket=socket;
	ready=true;
	}
    
//  io.sockets.emit('updatecontador', contador);

  socket.on("disconnect", function () { 
  if(socket.handshake.address!="127.0.0.1"){
		contador--;
		var i = JogadoresID.indexOf(socket.id);
		if(Jogador1!=null){ 
			if(Jogador1.socket.id==socket.id){ 
				KillJogador(0);
				Ingamecontador--;				
			} 
		} 
		if(Jogador2!=null){ 
			if(Jogador2.socket.id==socket.id){ 
				KillJogador(1);
				Ingamecontador--;	
			} 
		}
		if(Jogador3!=null){
			if(Jogador3.socket.id==socket.id){
				KillJogador(2);
				Ingamecontador--;					
			}
		}
		if(Jogador4!=null){ 
			if(Jogador4.socket.id==socket.id){ 
				KillJogador(3);
				Ingamecontador--;	
			}
		}
		console.log("Saiu o " + JogadoresNome[i] + " com o ID: " + socket.id + " estao agora " + contador + " ligados"); 
		JogadoresID.splice(i,1); 
		JogadoresNome.splice(i,1);
		JogadoresIDsock.splice(i,1);
		if(contador>=3 && EstadoJogo==false && i<=4){
			ResetTempo();
		}
	}
//    io.sockets.emit('updatecontador', contador);
  });
 socket.on("Movimento", function (msg) {
 if(EstadoJogo==true){
    var i = JogadoresID.indexOf(socket.id);
	console.log("Movimento de " + JogadoresNome[i]); 
	Movimentos(i, msg);
	}
  }) 

  socket.on("Pronto", function (msg) {
   io.to(socket.id).emit('ID', {m:msg,id:socket.id});
	var i = JogadoresID.indexOf(socket.id);
	console.log("Jogador ID: " + socket.id + "com nome: " + JogadoresNome[i]); 
  })
  socket.on("Nome", function (msg) {
	var i = JogadoresID.indexOf(socket.id);
	JogadoresNome[i]=msg;
	console.log("O Jogador com o ID: "+ socket.id + " Ficou com o nome: " + JogadoresNome[i]);
  })
	if(contador>=3){
			if(EstadoJogo==false){
				//ResetTempo();
			}
			if(EstadoJogo==true){ 
				GeraFila();
			}
	}
	socket.on("EndGame", function (msg) {
	var i = JogadoresID.indexOf(socket.id);
	console.log("Morreu o : " + JogadoresNome[i]);
	KillJogador(i); 
  }) 	
});

 
  
// colocar servidor à escuta no porto 3000 (ou o definido pelo sistema)
server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address(); 
  console.log("a escutar no endereco", addr.address + ":" + addr.port);
  JTemp = setInterval(ForceRefresh, 5000);
});
function ForceRefresh(){
	//io.sockets.emit("Force","Force");
	clearInterval(JTemp);
}
 function setTime()
        { 
		console.log("Time");
		if(ready==true && contador>=2){
			clearInterval(temporizador);
			startgame();
		}else{
			ResetTempo();
		}
        } 
function startgame(){ 
if(contador>=2){
	EcranSocket.emit("Info", "Começou o Jogo");
	Ingamecontador=2;	
	EstadoJogo=true;
	console.log("Contador: " + contador);
	console.log("Jogadores: ");
	console.log(JogadoresNome);
	console.log("Jogo Lançado com os jogadores:"); 
	EcranSocket.emit("Begin", contador);
	Jogador1=null;
	Jogador2=null;
	Jogador3=null;
	Jogador4=null;  
	for(var i = 0; i< (contador) && i<4; i++){
		console.log((i+1)+" - "+ JogadoresNome[i] + ", ID: "+JogadoresID[i]);
		} 
		CriaTerreno(); 
		Jogador1 = new USER(JogadoresID[0], JogadoresNome[0], 1,1, true,JogadoresIDsock[0] ); 
		JogadoresIDsock[0].emit('Inicio', 'J1');
		//io.to(JogadoresID[0]).emit('Inicio', 'Go');
		Jogador2 = new USER(JogadoresID[1], JogadoresNome[1], 9,9,true, JogadoresIDsock[1]);
		JogadoresIDsock[1].emit('Inicio', 'J2');
		//io.to(JogadoresID[1]).emit('Inicio', 'Go');
		if(contador>=3){
			Ingamecontador=3;	
			Jogador3 = new USER(JogadoresID[2], JogadoresNome[2], 1,9,true, JogadoresIDsock[2]);
			JogadoresIDsock[2].emit('Inicio' , 'J3');
			//io.to(JogadoresID[2]).emit('Inicio', 'Go');
		}
		if(contador>=4){
			Ingamecontador=4;	
			Jogador4 = new USER(JogadoresID[3], JogadoresNome[3], 9,1, true, JogadoresIDsock[3]); 
			JogadoresIDsock[3].emit('Inicio', 'J4');			
			//io.to(JogadoresID[3]).emit('Inicio', 'Go');
		}
			//TickBombas = setInterval(VeriBombas, 1000);
			}
}

function Movimentos(i,msg){ 
	var x;
	var y;
	var x2;
	var y2;
	if(EstadoJogo==true){
		if(i==0){ 
			x=Jogador1.x;
			y=Jogador1.y;  
			x2=x;
			y2=y;
			if( msg == "Cima"){
				x2=x-1;
			}
	 
			if( msg == "Baixo"){
				x2=x+1;	 
			}

			if( msg == "Esquerda"){ 
				 y2=y-1;
			}

			if( msg == "Direita"){ 
				y2=y+1;
			}
			if( msg == "BOMBA!!"){ 
				if(Terreno[x][y]!="B"){
					Terreno[x][y]="B";
					console.log("Bomba Largada");
					Bombas.push(new BOMBA(Math.floor(Math.random() * 1000),JogadoresNome[0],x,y, BombaTimer));
					EcranSocket.emit("SetBomba", (x+"_"+y));
					//var BTemp= setInterval(Explode(x, y, Bombas[Nbomba].ID), Tempo);
					Nbomba++;
				}
			}
			console.log("Movimento X = " + x + " Y = " + y + " para X = " + x2 + " Y = " + y2); 
			if(Terreno[x2][y2]==0 || Terreno[x2][y2]=="B"){
				if(Terreno[x2][y2]=="0"){
					Jogador1.x=x2;
					Jogador1.y=y2;
				}
				if(Terreno[x][y]!="B"){
					Terreno[x][y]="0";
					Terreno[x2][y2]="J1";
					}
				if(EcranSocket!=null){
					EcranSocket.emit("mensagem", {Jogador: "J1", Move:msg});
				}
				
			}else{
				console.log("Movimento 1 Invalido");   
			}
		}
		if(i==1){
			x=Jogador2.x;
			y=Jogador2.y;
			x2=x;
			y2=y;
			if( msg == "Cima"){
				x2=x-1;
			}
	 
			if( msg == "Baixo"){
				x2=x+1;	
			} 

			if( msg == "Esquerda"){
				 y2=y-1;
			}

			if( msg == "Direita"){  
				y2=y+1;
			}
			if( msg == "BOMBA!!"){
				if(Terreno[x][y]!="B"){
					Terreno[x][y]="B";
					console.log("Bomba Largada");
					Bombas.push(new BOMBA(Math.floor(Math.random() * 1000),JogadoresNome[1],x,y, BombaTimer));
					EcranSocket.emit("SetBomba", (x+"_"+y));
					//var BTemp= setInterval(Explode(x, y, Bombas[Nbomba].ID), Tempo);
					Nbomba++;
				}
			}
			console.log("Movimento X = " + x + " Y = " + y + " para X = " + x2 + " Y = " + y2); 
			if(Terreno[x2][y2]==0 || Terreno[x2][y2]=="B"){
				if(Terreno[x2][y2]=="0"){
					Jogador2.x=x2;
					Jogador2.y=y2;
				}
				if(Terreno[x][y]!="B"){
					Terreno[x][y]="0";
					Terreno[x2][y2]="J2";
					}
				if(EcranSocket!=null){
					EcranSocket.emit("mensagem", {Jogador: "J2", Move:msg});
				}
				
			}else{
				console.log("Movimento 2 Invalido");
			}
		}
		if(i==2){
			x=Jogador3.x;
			y=Jogador3.y;
			x2=x;
			y2=y;
			if( msg == "Cima"){
				x2=x-1;
			}
	 
			if( msg == "Baixo"){
				x2=x+1;	
			}

			if( msg == "Esquerda"){
				 y2=y-1;
			}

			if( msg == "Direita"){ 
				y2=y+1;
			}
			if( msg == "BOMBA!!"){ 
				if(Terreno[x][y]!="B"){
					Terreno[x][y]="B";
					console.log("Bomba Largada");
					Bombas.push(new BOMBA(Math.floor(Math.random() * 1000),JogadoresNome[2],x,y, BombaTimer));
					EcranSocket.emit("SetBomba", (x+"_"+y));
					//var BTemp= setInterval(Explode(x, y, Bombas[Nbomba].ID), Tempo);
					Nbomba++;
				}
			}
			console.log("Movimento X = " + x + " Y = " + y + " para X = " + x2 + " Y = " + y2); 
			if(Terreno[x2][y2]==0 || Terreno[x2][y2]=="B"){
				if(Terreno[x2][y2]=="0"){
					Jogador3.x=x2;
					Jogador3.y=y2;
				}
				if(Terreno[x][y]!="B"){
					Terreno[x][y]="0";
					Terreno[x2][y2]="J3";
					}		
				if(EcranSocket!=null){
					EcranSocket.emit("mensagem", {Jogador: "J3", Move:msg});
				}
				
			}else{
				console.log("Movimento 3 Invalido");
			}
		}
		if(i==3){
			x=Jogador4.x;
			y=Jogador4.y;
			x2=x;
			y2=y;
			if( msg == "Cima"){
				x2=x-1;
			}
	 
			if( msg == "Baixo"){
				x2=x+1;	
			}

			if( msg == "Esquerda"){
				 y2=y-1;
			} 
	 
			if( msg == "Direita"){ 
				y2=y+1;
			}
			if( msg == "BOMBA!!"){ 
				if(Terreno[x][y]!="B"){
					Terreno[x][y]="B";
					console.log("Bomba Largada");
					Bombas.push(new BOMBA(Math.floor(Math.random() * 1000),JogadoresNome[3],x,y, BombaTimer));
					EcranSocket.emit("SetBomba", (x+"_"+y));
					//var BTemp= setInterval(Explode(x, y, Bombas[Nbomba].ID), Tempo);
					Nbomba++; 
				}
			}
			console.log("Movimento X = " + x + " Y = " + y + " para X = " + x2 + " Y = " + y2); 
			if(Terreno[x2][y2]=="0" || Terreno[x2][y2]=="B"){
				if(Terreno[x2][y2]=="0"){
					Jogador4.x=x2;
					Jogador4.y=y2;
				}
				if(Terreno[x][y]!="B"){
					Terreno[x][y]="0";
					Terreno[x2][y2]="J4";
					} 
				if(EcranSocket!=null){
					EcranSocket.emit("mensagem", {Jogador: "J4", Move:msg});
				}
				
			}else{ 
				console.log("Movimento 4 Invalido");
			}
		}
		
		console.log(Terreno);
	}
}

function ResetTempo(){
	EcranSocket.emit("Info", "Tempo Reiniciado, o jogo vai começar daqui 10 sec");
	console.log("Tempo Reiniciado");  
	if(EstadoJogo==false){
	clearInterval(temporizador); 
	if(contador>=4){
		console.log("Divide");
		Totaltempo=parseInt(TotaltempoI/2);  
		}
	console.log("Tempo: " +Totaltempo);
	temporizador=setInterval(setTime, Totaltempo);
	}
	else{
	console.log("Jogo a Decorrer");
	}
	}
	
	
function GeraFila(){
	console.log("Partida ja iniciado, foi posto em fila"); 
}


function CriaTerreno(){
	Terreno = new Array(11);
	for (var i = 0; i < 11; i++) {
		Terreno[i] = new Array(11);
	}
	for (var i = 0; i < 11; i++) {
		for (var k = 0; k < 11; k++) {
			if(i==0 || i == 10 || k == 0 || k == 10){ 
				Terreno[i][k] = 1;
				}else{
					if(i%2==0 && k%2==0){
						Terreno[i][k] = 1;
					}
					else{
						Terreno[i][k] = 0;
					} 
				}
		} 
	}
	Terreno[1][1]="J1";
	Terreno[9][9]="J2";
	if(Ingamecontador>=3){
		Terreno[1][9]="J3";
	}
	if(Ingamecontador>=4){
		Terreno[9][1]="J4";
	}
	console.log("Terreno Criado"); 
	console.log(Terreno);
}


function InserirUtilizor(){

}


function EndGame(){
	console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
	console.log("Acabou Jogo");
	EstadoJogo=false;
	RemoveBombasAll(); 
	Jogador1.socket.emit("Resfresh", "Refresh");
	JogadoresIDsock.splice(0,1);
	Jogador2.socket.emit("Resfresh", "Refresh");
	JogadoresIDsock.splice(0,1);	  
	if(Ingamecontador>=3){
			Jogador3.socket.emit("Resfresh", "Refresh");
			JogadoresIDsock.splice(0,1);
	}
	if(Ingamecontador>=4){
		Jogador4.socket.emit("Resfresh", "Refresh");
		JogadoresIDsock.splice(0,1);
	}
	Totaltempo=TotaltempoI;
	
	//ResetTempo();  
}
 

function KillJogador(i){
	i=i+1; 
	var k=0;
	var veri=false;
	if(i==1 && Jogador1.Vivo==true){
		Jogador1.Vivo=false;
		if(JogadoresIDsock[(i-1)] == Jogador1.socket){
			JogadoresIDsock[(i-1)].emit("Dead", "Dead");
			EcranSocket.emit("Dead", "J1");
		}
		Terreno[Jogador1.x][Jogador1.y]=0;
	}
	if(i==2 && Jogador2.Vivo==true){
		Jogador2.Vivo=false;
		if(JogadoresIDsock[(i-1)] == Jogador2.socket){
			JogadoresIDsock[(i-1)].emit("Dead", "Dead"); 
			EcranSocket.emit("Dead", "J2");
		}
		Terreno[Jogador2.x][Jogador2.y]=0; 
	} 
	if(i==3 && Jogador3.Vivo==true){
		Jogador3.Vivo=false; 
		if(JogadoresIDsock[(i-1)] == Jogador3.socket){
			JogadoresIDsock[(i-1)].emit("Dead", "Dead");
			EcranSocket.emit("Dead", "J3");
		}
		Terreno[Jogador3.x][Jogador3.y]=0;  
	}
	if(i==4 && Jogador4.Vivo==true){ 
		Jogador4.Vivo=false;
		if(JogadoresIDsock[(i-1)] == Jogador4.socket){
			JogadoresIDsock[(i-1)].emit("Dead", "Dead");
			EcranSocket.emit("Dead", "J4");
		}
		Terreno[Jogador4.x][Jogador4.y]=0;
	}
	if(Jogador1.Vivo==true){
		veri=true; 
		k++;
	} 
	if(Jogador2.Vivo==true){
		veri=true; 
		k++;
	}  
	if(Ingamecontador>=3){ 
		if(Jogador3.Vivo==true){
			veri=true;
			k++;
		}	
	}
	if(Ingamecontador>=4){
		if(Jogador4.Vivo==true){
			veri=true;
			k++;
		}	
	}  
	if(k==1){
		if(Jogador1.Vivo==true){
			Jogador1.socket.emit("Win","Win");
			EcranSocket.emit("Win","J1");
			EcranSocket.emit("Info", ("Ganhou o "+ JogadoresNome[0]));
		}
		if(Jogador2.Vivo==true){
			Jogador2.socket.emit("Win","Win");
			EcranSocket.emit("Win","J2");
			EcranSocket.emit("Info", ("Ganhou o "+ JogadoresNome[1]));
		}
		if(Ingamecontador>=3){
			if(Jogador3.Vivo==true){
				Jogador3.socket.emit("Win","Win");
				EcranSocket.emit("Win","J3");
				EcranSocket.emit("Info", ("Ganhou o "+ JogadoresNome[2]));
			} 
		}
		if(Ingamecontador>=4){
			if(Jogador4.Vivo==true){
				Jogador4.socket.socket.id.emit("Win","Win");
				EcranSocket.emit("Win","J4"); 
				EcranSocket.emit("Info", ("Ganhou o "+ JogadoresNome[3]));
			}
		}
		EndGame();
	}
	console.log("Jogador 1 : " + Jogador1.Vivo);
	console.log("Jogador 2 : " + Jogador2.Vivo);
	if(Ingamecontador>=3){
		console.log("Jogador 3 : " + Jogador3.Vivo);
	}
	if(Ingamecontador>=4){
		console.log("Jogador 4 : " + Jogador4.Vivo);	
	}
}


// UTILIZADORES 
function USER(ID, Nome, x, y, estado, socket) {
	this.ID=ID;
	this.Nome=Nome;
    this.x= x; 
    this.y= y;
	this.Vivo = estado;
	this.socket = socket; 
}

function BOMBA(ID,IDUti, x, y, Tempo){
	this.ID= ID;
	this.IDUti=IDUti;
	this.x=x;
	this.y=y;
	this.Tempo=Tempo;
	this.Btemp = setInterval(function() { Explode(x, y, ID);}, Tempo);
	console.log("Bomba: " + ID + " Util: " + IDUti + "X: " + x + " Y: " + y + "Tempo: " + Tempo);
	
}
function RemoveBomba(ID){
	var i=0; 
	if(Nbomba>0){
		while(Bombas[i].ID!=ID){
			i++
		}
		console.log("I : " + i + " Nbombas: " + Nbomba);
		EcranSocket.emit("RBomba", Bombas[i].x+"_"+Bombas[i].y);
		clearInterval(Bombas[i].Btemp);
		Bombas.splice(i,1); 
		Nbomba--;
	}
}
function Explode(x,y, ID){
		var BombaPos= new Array();
		console.log("Explodiu uma bomba em X: " + x + " Y: " + y);
		var i = x;
		var k = y;
		var o=0;
		Terreno[x][y]="0"; 
		while(Terreno[i][k]!="1"){
			BombaPos.push(i+"_"+k); 
			if(Jogador1.x == i && Jogador1.y == k){
				console.log("Entrou")
				o=0;
				if(Nbomba>0){
				while(Bombas[o].ID!=ID ){
					o++
				}
				if(Bombas[o].IDUti!=JogadoresNome[0]){
					EcranSocket.emit("Info", (" O "+Bombas[o].IDUti + " matou o "+ JogadoresNome[0]));
				}else{
					EcranSocket.emit("Info", (" O "+ JogadoresNome[0]+ "  suicidou-se"));
				}
				}
				KillJogador(0);

			}
			if(Jogador2.x == i && Jogador2.y == k ){
				
				console.log("Entrou")
				o=0;
				if(Nbomba>0){
				while(Bombas[o].ID!=ID){
					o++
				}
				if(Bombas[o].IDUti!=JogadoresNome[1] ){
					EcranSocket.emit("Info", (" O "+Bombas[o].IDUti + " matou o "+ JogadoresNome[1]));
				}else{
					EcranSocket.emit("Info", (" O "+ JogadoresNome[1]+ "  suicidou-se"));
				}
				}
				KillJogador(1);
			}
			if(Ingamecontador>=3){
				if(Jogador3.x == i && Jogador3.y == k){
				
				console.log("Entrou")
				o=0;
				if(Nbomba>0){
				while(Bombas[o].ID!=ID){
					o++
				}
				if(Bombas[o].IDUti!=JogadoresNome[2]){
					EcranSocket.emit("Info", (" O "+Bombas[o].IDUti + " matou o "+ JogadoresNome[2]));
				}else{
					EcranSocket.emit("Info", (" O "+ JogadoresNome[2]+ "  suicidou-se"));
				}
				}
				KillJogador(2);
			}  
			}
			if(Ingamecontador>=4){
				if(Jogador4.x == i && Jogador4.y == k){
				
				console.log("Entrou")
				o=0;
				if(Nbomba>0){
				while(Bombas[o].ID!=ID){
					o++
				}
				if(Bombas[o].IDUti!=JogadoresNome[3] ){
					EcranSocket.emit("Info", (" O "+Bombas[o].IDUti + " matou o "+ JogadoresNome[3]));
				}else{
					EcranSocket.emit("Info", (" O "+ JogadoresNome[3]+  " suicidou-se"));
				}
				}
				KillJogador(3);
				}
			}
			i++;
		}
		i = x;
		while(Terreno[i][k]!="1"){
			BombaPos.push(i+"_"+k);
			if(Jogador1.x == i && Jogador1.y == k){
				
				console.log("Entrou")
				o=0;
				if(Nbomba>0){
				while(Bombas[o].ID!=ID ){
					o++
				}
				if(Bombas[o].IDUti!=JogadoresNome[0] ){
					EcranSocket.emit("Info", (" O "+Bombas[o].IDUti + " matou o "+ JogadoresNome[0]));
				}else{
					EcranSocket.emit("Info", (" O "+ JogadoresNome[0]+ "  suicidou-se"));
				}
				}
				KillJogador(0);

			}
			if(Jogador2.x == i && Jogador2.y == k){
				
				console.log("Entrou")
				o=0;
				if(Nbomba>0){
				while(Bombas[o].ID!=ID){
					o++
				}
				if(Bombas[o].IDUti!=JogadoresNome[1] ){
					EcranSocket.emit("Info", (" O "+Bombas[o].IDUti + " matou o "+ JogadoresNome[1]));
				}else{
					EcranSocket.emit("Info", (" O "+ JogadoresNome[1]+ "  suicidou-se"));
				}
				}
				KillJogador(1);
			}
			if(Ingamecontador>=3){
				if(Jogador3.x == i && Jogador3.y == k){
				
				console.log("Entrou")
				o=0;
				if(Nbomba>0){
				while(Bombas[o].ID!=ID){
					o++
				}
				if(Bombas[o].IDUti!=JogadoresNome[2] ){
					EcranSocket.emit("Info", (" O "+Bombas[o].IDUti + " matou o "+ JogadoresNome[2]));
				}else{
					EcranSocket.emit("Info", (" O "+ JogadoresNome[2]+ "  suicidou-se"));
				}
				}
				KillJogador(2);
			}  
			}
			if(Ingamecontador>=4){
				if(Jogador4.x == i && Jogador4.y == k ){
				
				console.log("Entrou")
				o=0;
				if(Nbomba>0){
				while(Bombas[o].ID!=ID){
					o++
				}
				if(Bombas[o].IDUti!=JogadoresNome[3] ){
					EcranSocket.emit("Info", (" O "+Bombas[o].IDUti + " matou o "+ JogadoresNome[3]));
				}else{
					EcranSocket.emit("Info", (" O "+ JogadoresNome[3]+ "  suicidou-se"));
				}
				}
				}
				KillJogador(3);
			}
			i--;
		}
		i = x;
			while(Terreno[i][k]!="1"){
			BombaPos.push(i+"_"+k);
			if(Jogador1.x == i && Jogador1.y == k){
				
				console.log("Entrou")
				o=0;
				if(Nbomba>0){
				while(Bombas[o].ID!=ID ){
					o++
				}
				if(Bombas[o].IDUti!=JogadoresNome[0]){
					EcranSocket.emit("Info", (" O "+Bombas[o].IDUti + " matou o "+ JogadoresNome[0]));
				}else{
					EcranSocket.emit("Info", (" O "+ JogadoresNome[0]+ "  suicidou-se"));
				}
				}
				KillJogador(0);
			}
			if(Jogador2.x == i && Jogador2.y == k){
				
				console.log("Entrou")
				o=0;
				if(Nbomba>0){
				while(Bombas[o].ID!=ID){
					o++
				}
				if(Bombas[o].IDUti!=JogadoresNome[1]){
					EcranSocket.emit("Info", (" O "+Bombas[o].IDUti + " matou o "+ JogadoresNome[1]));
				}else{
					EcranSocket.emit("Info", (" O "+ JogadoresNome[1]+ "  suicidou-se"));
				}
				}
				KillJogador(1);
			}
			if(Ingamecontador>=3){
				if(Jogador3.x == i && Jogador3.y == k ){
				
				console.log("Entrou")
				o=0;
				if(Nbomba>0){
				while(Bombas[o].ID!=ID){
					o++
				}
				if(Bombas[o].IDUti!=JogadoresNome[2] ){
					EcranSocket.emit("Info", (" O "+Bombas[o].IDUti + " matou o "+ JogadoresNome[2]));
				}else{
					EcranSocket.emit("Info", (" O "+ JogadoresNome[2]+ "  suicidou-se"));
				}
				}
				KillJogador(2);
			}  
			}
			if(Ingamecontador>=4){
				if(Jogador4.x == i && Jogador4.y == k){
				
				console.log("Entrou")
				o=0;
				if(Nbomba>0){
				while(Bombas[o].ID!=ID){
					o++
				}
				if(Bombas[o].IDUti!=JogadoresNome[3] ){
					EcranSocket.emit("Info", (" O "+Bombas[o].IDUti + " matou o "+ JogadoresNome[3]));
				}else{
					EcranSocket.emit("Info", (" O "+ JogadoresNome[3]+ "  suicidou-se"));
				}
				}
				KillJogador(3);
				}
			}
			k++;
		}
		k = y;
			while(Terreno[i][k]!="1"){
			BombaPos.push(i+"_"+k);
			if(Jogador1.x == i && Jogador1.y == k){
				
				console.log("Entrou")
				o=0;
				if(Nbomba>0){
				while(Bombas[o].ID!=ID ){
					o++
				}
				if(Bombas[o].IDUti!=JogadoresNome[0]){
					EcranSocket.emit("Info", (" O "+Bombas[o].IDUti + " matou o "+ JogadoresNome[0]));
				}else{
					EcranSocket.emit("Info", (" O "+ JogadoresNome[0]+ "  suicidou-se"));
				}
				}
				KillJogador(0);
			}
			if(Jogador2.x == i && Jogador2.y == k){
				
				console.log("Entrou")
				o=0;
				if(Nbomba>0){
				while(Bombas[o].ID!=ID){
					o++
				}
				if(Bombas[o].IDUti!=JogadoresNome[1]){
					EcranSocket.emit("Info", (" O "+Bombas[o].IDUti + " matou o "+ JogadoresNome[1]));
				}else{
					EcranSocket.emit("Info", (" O "+ JogadoresNome[1]+ "  suicidou-se"));
				}
				}
				KillJogador(1);
			}
			if(Ingamecontador>=3){
				if(Jogador3.x == i && Jogador3.y == k){
				
				console.log("Entrou")
				o=0;
				if(Nbomba>0){
				while(Bombas[o].ID!=ID){
					o++
				}
				if(Bombas[o].IDUti!=JogadoresNome[2]){
					EcranSocket.emit("Info", (" O "+Bombas[o].IDUti + " matou o "+ JogadoresNome[2]));
				}else{
					EcranSocket.emit("Info", (" O "+ JogadoresNome[2]+ "  suicidou-se"));
				}
				}
				KillJogador(2);
			}  
			}
			if(Ingamecontador>=4){
				if(Jogador4.x == i && Jogador4.y == k){
				
				console.log("Entrou")
				o=0;
				if(Nbomba>0){
				while(Bombas[o].ID!=ID){ 
					o++
				}
				if(Bombas[o].IDUti!=JogadoresNome[3]){
					EcranSocket.emit("Info", (" O "+Bombas[o].IDUti + " matou o "+ JogadoresNome[3]));
				}else{
					EcranSocket.emit("Info", (" O "+ JogadoresNome[3]+ "  suicidou-se"));
				}
				}
				KillJogador(3);
				}
			} 
			k--;
		}
		RemoveBomba(ID);
		EcranSocket.emit("Array", BombaPos);
}
function RemoveBombasAll(){
	for(var i=0; i<Bombas.length; i++){
		clearInterval(Bombas[i].Btemp);
	}
	Bombas=[];
	Nbomba=0;
}
function VeriBombas(){
	var k=0;
	while(k<Nbomba){
		var TempBomba=Bombas[k];
		console.log(TempBomba);
		TempBomba.Tempo--;
		if(TempBomba[k].Tempo==0){
			Explode(TempBomba.x, TempBomba.y, TempBomba.ID);
		}
		Bombas[k]=TempBomba;
	}
}