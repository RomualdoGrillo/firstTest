var debugMode = false//debug,normal
$(document).ready(function(){
	//************ inizializzazioni  ************
	$( "*" ).disableSelection();
	//************ inizializza UNDO  ************
	ssnapshot() //inizializza snapshot manager che gestisce UNDO
	//************ radio Buttons  ************
	$('input[type=radio][name=color]').change(function() {
    console.log(this.value);
    $('body').removeClass('whiteBorders greyBorders coloredBorders');//ripulisci valori precedenti
     $('body').addClass(this.value)//aggiungi la nuova classe
	});
	//**********collega combinazioni di tasti*********************************************************************** 
	$(document).on('keydown', function ( e ) {
		var keyPressed = keyToCharacter(e.which).toLowerCase();
		console.log('key pressed:' + keyPressed + ' code: ' + e.which )
    	//ctrl+a 
    	if ( e.ctrlKey && ( String.fromCharCode(e.which) === 'a' || String.fromCharCode(e.which) === 'A' ) ) {
			$('#telaRole *').removeClass('selected');
			$('#telaRole>[data-atom]').addClass('selected');// select all: all the atoms in telaRole
		}
    	//ctrl+c
    	if ( e.ctrlKey && ( String.fromCharCode(e.which) === 'c' || String.fromCharCode(e.which) === 'C' ) ) {
			ssnapshot.copy();
			console.log("control + c")
		}
    	//ctrl+v
    	else if ( e.ctrlKey && ( String.fromCharCode(e.which) === 'v' || String.fromCharCode(e.which) === 'V' ) ) {
			ssnapshot.paste();
			console.log("control + v")
		}
    	//ctrl+z
    	else if ( e.ctrlKey && ( String.fromCharCode(e.which) === 'z' || String.fromCharCode(e.which) === 'Z' ) ) {
			ssnapshot.undo();
			console.log("control + z")
		}
		//ctrl+x
    	else if ( e.ctrlKey && ( String.fromCharCode(e.which) === 'x' || String.fromCharCode(e.which) === 'X' ) ) {
			ssnapshot.copy();
			cancelSelected();
			console.log("control + x")
		}
		//canc or del  code of "cancel" = 46 code of "del" = 8
		else if ( e.which === 46 || e.which === 8  ) {
			cancelSelected();
			console.log("canc or del")
		}
		//shift+d   toggle Debug
    	else if ( e.shiftKey && ( String.fromCharCode(e.which) === 'd' || String.fromCharCode(e.which) === 'D' ) ) {
			debugToggle();
			console.log("control + d");	
		}
		//shift+s salva contenuto (ctrl+s è già associato al salvataggio della pagina da parte del browser)
		else if ( e.shiftKey && ( String.fromCharCode(e.which) === 's' || String.fromCharCode(e.which) === 'S' ) ) {
			console.log("Shift + s")
			var $toBeSaved 
			if( $('.selected').length == 0 ){ $toBeSaved = $('#telaAnd')[0].ATOM_getChildren() }//se nulla in particolare è selezionato salva tutto
			else{$toBeSaved = $('.selected')};
			if( $toBeSaved.length !=0 ){
				//var contentString = $toBeSaved[0].ATOM_createMathmlString(true)// in caso esistano più elementi selezionati solo il primo viene salvato(futuribile: salvarli tutti)
				var contentString = createMathmlString($toBeSaved,true)// in caso esistano più elementi selezionati solo il primo viene salvato(futuribile: salvarli tutti)
				var stringToBeSaved = '<math xmlns="http://www.w3.org/1998/Math/MathML">' + contentString + '</math>'
 				var fileName = prompt('Save as... Attenzione: Il file verrà salvato nella cartella "Download" !! non è possibile salvare in altre cartelle') 
				if(fileName !== null){
					saveTextAsFile(stringToBeSaved,fileName + ".mml");
				}
			}
		}
		//shift+l load file
		else if ( e.shiftKey && ( String.fromCharCode(e.which) === 'l' || String.fromCharCode(e.which) === 'L' ) ) {
			console.log("Shift + l");
			$('#fileToLoad').trigger('click');// #fileToLoad: ad esso è associato un evento
		}
		else{//****************applica proprietà***********
			var PActx =  newPActx();
			var $selected = $('.selected')
			//code of "arrowup" = 38 
			if ( e.which === 38) {
				//console.log("decompose up")
				PActx = decompose($selected,"up"/*up for factorize*/);
			}
			//code of "arrowright" = 39
			else if ( e.which === 39) {
				//console.log("decompose right")
				PActx = decompose($selected , "right");
			}
			//code of "arrowdown" = 40 or "arrowleft" = 37 
			else if ( e.which === 40 || e.which === 37 ) {
				//console.log("compose")
				PActx = compose($selected)
			}
			
			// ogni volta che si preme un tasto cerca se c'è prop applicabile
			if(!PActx.matchedTF){
			
				PActx = keyboardEvToFC($selected, keyPressed);
							
			}
			//*************** operazioni conclusive (dopo tutti i tentativi)*******************
			if(PActx.matchedTF == true ){		         		    
				refreshAndReplace(PActx);
				//********** Post ******************************************************
				postRefine(PActx.$transform)
				ssnapshot.take();
			}					
		}
	});

	//************ bottone Create! **************
	$('#create-link').click(function(){ $(".selected")[0].ATOMCreateDefinition() })
	
	//************ bottone Help **************
	$( "#help-link" ).click(function( event ) {
		window.open('./Help/Help.html');
	});

	//***** auto load file after a file is choosen***************
	$('#fileToLoad').change(function() {
		//passa di qui dopo che l'utente ha selezionato un nuovo file, non se l'utente preme annulla
		console.log('fileTOLoad change');
		var fileToLoad = jQuery('#fileToLoad')[0].files[0];
		var $target = $('#telaRole');
		loadFileConvert(fileToLoad, $($target[0]),"mml_aab");
		//forse la chiamata sopra è asincrona? ssnapshot scatta prima dell'effettivo caricamento
		//ssnapshot.take(); //todo: snapshot solo in base a risultato di loadFileConvert()
		this.value = "";//cancella il vecchio path altrimenti se carico due volte lo stesso file non si accorge del cambiamento
		});
		
	//************Attach events*******************************************************************************
	attachEventsAndExtend($('body')) //fai nascere tutto
	//************preload*******************************************************************************
	//inject(preload,$('#telaRole'))
	ssnapshot.take()
	//************Refresh***************************
	//$('[data-atom]').each(function(){addTypeDecorations($(this))})
	//refreshEmpty($('body'))
	//refreshInfix($('body'),true)
	RefreshEmptyInfixBraketsGlued($('body'),true,"eib")
});	
	
function attachEventsAndExtend($startElement,processDiscendence/*default is true*/,extend/*default is true*/){//di qui passano tutti, a seconda della classe: 1)estendi atom 2)attach events
	var element
	if(processDiscendence !== false){
		processDiscendence=true // processDiscendence default is true
		element = $startElement.add($startElement.find('[data-atom],[class*="_role"]'));// order is important!	
	}
	else{
		//se necessario estendi lo start node
		if( !$startElement.hasClass('born') ){ ATOMextend($startElement) }
		element = $startElement[0].ATOM_getNodes();
	}
	if(extend != false){ATOMextend($startElement,processDiscendence)}
	
	//console.log('attachEventsAndExtend call on ')
	//console.log(element)
	if( element.filter(".born").length ){
		console.log("called attachEventsAndExtend again on born element")
		console.log(element.filter(".born"))
		element = element.not(".born")
	}
	element.addClass("born")
	//*************click non su ATOM******
	//element.filter('[data-atom].asymmetric')
	
	
	//*************** Lock unlock ******** 
	element.filter('.asymmetric>.firstMember').click(function(){
		 event.stopPropagation();
		 var $atom = $(this).parent();
		 $atom.toggleClass('unlocked');
 		 refreshAsymmEq($atom);
		 ssnapshot.take();
		 })
	//initialize lock icons
	element.filter('[data-atom].asymmetric').each(function(i,e){ refreshAsymmEq($(e))})
	
	//*************** forThis  by dragging elements on forall bound var  ******** 
	element.filter('.forAllHeader>[data-atom]').droppable({
		hoverClass:'hover',
		drop:function(event,ui){
				if(ATOMclosedDef(this)){
					console.log('Drop on bvar: ui.draggable  ,   event.target ');
					console.log(ui.draggable);
					console.log(event.target);
					if( ATOMparent( $(event.target) ).hasClass('waiting') && typeOk(ui.draggable,$(event.target)) ){
						ATOMForThisPar( $(event.target) , $(ui.draggable) )
						ssnapshot.take()
					}
				}
			}
		})
	//************ dblclick **************
	/*element.filter('[data-atom],[class*="_role"]').dblclick(function(e){$*/
	element.filter('[data-atom]').dblclick(function(e){$
		e.stopPropagation();
		console.log('dblclick')
		console.log(this)
		var $atomDblclicked = $(this)
		var atomClass = $atomDblclicked.attr('data-atom')
		
		if( ( atomClass ==='ci' || atomClass ==='cn' ) && !ATOMclosedDef(this) ){//dblclick on ci
			ATOMrenamePrompt($atomDblclicked)
		}
		//******** forThis prompt ***********
		else if(  atomClass ==='ci'  && (ATOMclosedDef(this)) && ATOMparent($atomDblclicked).hasClass('waiting') ){//.cis and locked and waiting )todoooooo!! riscrivere
				var newVal=prompt('Specify a value')
				if(newVal != null){
					var type = $atomDblclicked.attr('data-type')
					var $newNode  = ATOMclone(prototypeSearch(  (isNaN(newVal))?"ci":"cn") )
					attachEventsAndExtend($newNode);
					$newNode[0].ATOM_setName( newVal );
					$newNode.attr('data-type',type)
					//$atom.attr("data-atom", (isNaN(newVal))?"ci":"cn" )// se numero allora classe "cn"
					ATOMForThisPar($atomDblclicked,$newNode)
					ssnapshot.take()
			}	
		}
			
		
		//******** remove "waiting" ***********
		else if(atomClass === 'forAll' && ATOMclosedDef(this)){
			if( $atomDblclicked.hasClass('waiting') ){
				$atomDblclicked.removeClass('waiting')// togli waiting	
			}
			else{//non in stato di waiting
				createForThis($atomDblclicked)
			}
	
		}
		//******** expand collapse ***********
		else if(atomClass === 'defTrue'){
			$atomDblclicked.toggleClass('expanded');
		}
		else if( atomClass != 'ci' && atomClass != 'cn'){
			$atomDblclicked.toggleClass('minimized');//??todo: uniformare con expanded
		}
		
	})
	//*************Draggable*********************
	element.filter('#tavolozza [data-atom]')//da tavolozza /*'.s_role>[data-atom]:not(.undraggable),*/
	.draggable({
    	appendTo: "#telaRole",
    	opacity: 0.35,
    	start: function(e, ui){
  			ui.helper.removeClass('born')
  			ui.helper.find('*').removeClass('born')
     	},
  		stop: function(e, ui){
  			ui.helper.css( "width", "" );//altrimenti al clone resta width=valore fisso
  			ui.helper.css( "height", "" );//altrimenti il contenuto può sconfinare dal contenitore
  			ui.helper.css( "position", "" );//altrimenti il contenuto può sconfinare dal contenitore
       		ui.helper.css( "display", "" );//altrimenti il contenuto può sconfinare dal contenitore
       		//il clone è prodotto automaticamente da Jquery, altrove in clone è sempre prodotto attraverso ATOMclone(), che ripulisce attributi
       		ui.helper.removeClass('ui-draggable')//ha classe draggablo solo perchè clone di un draggable
       		$('*').removeClass("target-associative");
     	},
     	helper:'clone',//The helper option must be set to "clone" in order to work flawlessly.
	})
	//*************mouseDown*********************
	element.filter('[data-atom]:not(.unselectable)')
	.mousedown(function(e) {
		//e.stopPropagation()// stop propagation blocca il sorting
		e.preventDefault();
		var $thisATOM=$(this);
		if(e.originalEvent.handledAlready === undefined){
			e.originalEvent.handledAlready = true //instead of stopPropagation, stopPropagation stop sorting and other events 
			//distruggi gli handler specifici di ciò che è stato cliccato la volta precedente
			$('.target-associative').removeClass('target-associative');
			$('.target-replaced').removeClass('target-replaced').droppable( "destroy" );//.droppable( "destroy" )
			$('.target-distributive').removeClass('target-distributive').droppable( "destroy" );
			$('.target-collection').removeClass('target-collection').droppable( "destroy" );
			if( e.ctrlKey||$thisATOM.hasClass("ui-draggable")||!ATOMclosedDef($thisATOM) ){//clone  or original opened:
				validTargetsFromOpened($thisATOM).addClass("target-associative");	
			}
			else{
				var $parent = ATOMparent($thisATOM);
				var op = undefined
				if ($parent !== undefined){op = $parent.attr("data-atom")}
				//*********** replacement**************
				//se mousedown su membro di equazione rendi droppable ogni elemento "equivalente"
				if($thisATOM.parent().hasClass('firstMember')||$thisATOM.parent().hasClass('secondMember')){// dragged membro di una equazione?
					var validReps = validReplaced($thisATOM).addClass("target-replaced");
					validReps.each(function(){ lineAB($thisATOM,$(this)) })
					validReps.droppable({
						hoverClass:'hover',
						drop:function(event,ui){
							console.log(((!ATOMclosedDef(ui.draggable))?'unlocked':'locked')+"--------drop------->"+(!(ATOMclosedDef($thisATOM))?'unlocked':'locked'))	
							console.log("dragged:")
							console.log(ui.draggable)
							console.log("target:")
							console.log(event.target)
							ATOMReplaceLink($(this),ui.draggable)
							ssnapshot.take()
						}
					})
				}
				//***********prop associativa**************
				immediateAssValid($thisATOM,op).addClass("target-associative");
				//***********prop distributiva**************
				var opD = opIsDistDop(op);
				var validsForDist = validForDist($thisATOM,op,opD).addClass("target-distributive");
				validsForDist.droppable({
						//tolerance: pointer,//rende impossibile attivare la distribuzione
						hoverClass:'hover',
						drop:function(event,ui){
							console.log(((!ATOMclosedDef(ui.draggable))?'unlocked':'locked')+"--------drop------->"+((!ATOMclosedDef($thisATOM))?'unlocked':'locked'))	
							console.log("dragged:")
							console.log(ui.draggable)
							console.log("target:")
							console.log(event.target)
							ATOMdistribute(ui.draggable,$(this),op,opD)
							//*****refresh
							//refreshEmpty($(event.target))//refresh empty
							//refreshInfix($(event.target),true);//refresh infix
							RefreshEmptyInfixBraketsGlued($(event.target),true,"ei")
							ssnapshot.take()
						}
					})
				//***********Collection**************
				var validColl = validForColl($thisATOM,op,opD).addClass("target-collection");
				validColl.droppable({
						hoverClass:'hover',
						drop:function(event,ui){
							ATOMcollect(ui.draggable,$(this),op,opD);
							//refreshEmpty(ATOMparent($(this)))//refresh empty
							//refreshInfix(ATOMparent($(this)),true);//refresh infix
							RefreshEmptyInfixBraketsGlued(ATOMparent($(this)),true,"ei");
							ssnapshot.take();
						}
					})	
			}
			
			$thisATOM.filter('.ui-draggable').draggable("option","connectToSortable",".target-associative");
			$thisATOM.filter( function(){return $thisATOM.parent().hasClass('ui-sortable')}).parent().sortable("option","connectWith",".target-associative")
		}
	}).mouseup(function(e){
		//in versione stabile su mouseup rimettere aspetto normale ai target specifici
		clearLines()
	})

	//*************sortable*********************
	element.filter( '[class*="_role"]:not(.unsortable)' ).sortable({//todo: ol_role are sortable only when opened 
		//cursorAt: { top:0, left:0 },//problemi: il cursore salta fuori dalla sagoma al momento del grab
		opacity: 0.35,
		//delay: 200,
		//tolerance: "pointer",// con questo il sorting funziona benissimo, ma in alcuni casi è impossibile il drop
		//handle: ":not('.infix')",//strano: se filtro gli infix funzionano male le nested list
		//usato workaround via css .infix{pointer-events: none;}
		helper: function (e, li) {
			if(e.ctrlKey){
			var newElement = ATOMclone(li);
			newElement.insertAfter(li);
			attachEventsAndExtend(newElement);
			}
			var result = ATOMclone(li)
			result.addClass("helper");
			return result
		},
		receive: function(event, ui){
			console.log('sortable receive:')
			ui.item.css( "display", "" );
			ui.item.siblings().css( "display", "" );// stranamente, quando si droppano elementi, a volte i sibling aquisiscono stile locale "block"
			attachEventsAndExtend($(ui.helper));//todo:evitare di passare più volte in Birth??
			//ssnapshot.take();//viene fotografato l'elemento ricevuto ma nella posizione sbagliata'
        },
		stop: function () {
				console.log('sortable stop:');
				$('.helper').remove()// a volte l'helper non viene distrutto automaticamente ???
				//$('*').removeClass('target-associative')// a volte mouseup a volte drag stop??
				//console.log("sorting stop")
				$(".toBeCollected").remove();
				$(this).children().css( "display", "" );
				$(".cleanPointless").each(function(i,el){ATOMcleanIfPointless($(this),false)});
				RefreshEmptyInfixBraketsGlued(ATOMparent($(this)),true,"ei");
		},

	});
	//*************select*********************
	element.filter('[data-atom]:not(.unselectable)').click(function(){
		event.stopPropagation();
		//var $thisATOM=$(this).parent();
		var $thisATOM=$(this);
		if(event.ctrlKey){//click +ctrl on .ATOM   ---multi select---
			if($thisATOM.hasClass('selected')){
				$thisATOM.find('[data-atom]').removeClass('selected').removeClass('unselected');
			}
			else{
				$thisATOM.addClass('selected');
			}
		}
		else if(event.shiftKey){//click +shift on [data-atom]   ---unselect---
			if($thisATOM.hasClass('selected')){
				$thisATOM.removeClass('selected');
				$thisATOM.find('[data-atom]').removeClass('selected').removeClass('unselected');
			}
			else if($thisATOM.hasClass('unselected')){
				$thisATOM.removeClass('unselected');
				$thisATOM.find('[data-atom]').removeClass('selected').removeClass('unselected');
			}
			//else if( (LookForAncestor($thisATOM,'.selected')!= undefined) && (LookForAncestor($thisATOM,'unselected') == undefined) ){//se è selexted, a meno che non si unselected		
			else if(   ( $thisATOM.closest('.selected').length != 0 )   && ( $thisATOM.closest('.unselected').length == 0) ){//se è selexted, a meno che non sia unselected		
			
				$thisATOM.addClass('unselected');
				$thisATOM.find('[data-atom]').removeClass('selected').removeClass('unselected');
			}
		}
		else{//click on [data-atom]   ---select---
			
			if($thisATOM.hasClass('selected')){
				$('[data-atom]').removeClass('selected').removeClass('unselected');//clear selected unselected
			}
			else{
				$('[data-atom]').removeClass('selected').removeClass('unselected');//clear selected unselected
				$thisATOM.addClass('selected');
			}
		}
	})

}


function cancelSelected(){
	toBeCancelled = $('.selected').filter(function( index ) {
    	return !ATOMclosedDef(this);
  	})
  	if( toBeCancelled.length !=0 ){
		toBeCancelled.each(function(i,element){
			console.log(  $(element).remove()  )
		});
  		ssnapshot.take();
  	}
}

function refreshAsymmEq($atom){// adegua l'icona del lucchetto allo stato unlocked/non unlocked
	var $firstMember = $atom.find('>.firstMember')
		$firstMember.addClass("ui-icon");
	if($atom.hasClass('unlocked')){
			$firstMember.addClass("ui-icon-unlocked");
			$firstMember.removeClass("ui-icon-bullet");
		 }
		 else{
			$firstMember.addClass("ui-icon-bullet");
			$firstMember.removeClass("ui-icon-unlocked");
		 }
}

function keyToCharacter(key){
	if(key === 37){return "←"}
	else if(key === 38){return "↑"}
	else if(key === 39){return "→"}
	else if(key === 40){return "↓"}
	else{ return String.fromCharCode(key)}
}

function refreshAndReplace(PActx){
	console.log("Applied property: " + PActx.msg)
	//**** determina l'operazione più esterna su cui fare il refresh
	var $toBeRefreshed 
	
    if( PActx.replacedAlready == true){// sostituzione già effettuano internamente alla proprietà
	$toBeRefreshed = ATOMparent( PActx.$transform )
    }
    else{
    	$toBeRefreshed = ATOMparent( PActx.$operand )
    	PActx.$transform.insertBefore(PActx.$operand[0]);
		PActx.$operand.remove()
		attachEventsAndExtend(PActx.$transform,true,true);
    //********select on exit
	//$('*').removeClass('selected')
	//$(PActx.$transform[0]).addClass('selected')	
    }
	//********Refresh***************

	if( $toBeRefreshed !== undefined &&  $toBeRefreshed.length != 0 ){
				
		RefreshEmptyInfixBraketsGlued($toBeRefreshed,true,"gi");
		ATOMcleanIfPointless( $toBeRefreshed ,false);
	}
	return PActx
}

function debugToggle(){
	debugMode = !debugMode //toggle debugMode
	if(debugMode){
				$('#telaRole').addClass('debug');
				$('#tavolozza').addClass('hidden');
			}
	else{
		$('#telaRole').removeClass('debug');
		$('#tavolozza').removeClass('hidden');
	}
}