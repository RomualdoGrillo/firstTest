/*function ATOMSadaptMatchUL($input,$pattern,$property){//agisci sempre paragonando liste funzione ricorsiva
	//limitazione: non gestisce elementi complessi? cioè che abbiano più di un role che accetta liste
	//se il match non ha successo passa in uscita la proprietà iniziale
	var res = {matchedTF:false, msg:"", $newProp:$property, $pattern:$pattern ,$operand:$input, $pattRole:""};
	if($input.length==0 && $pattern.length==0){//se entrambe le liste sono vuote allora match
		res.matchedTF=true
		return res
	}
	res.$pattRole = $pattern.parent(); // $pattRole viene utilizzato per effettuare la sostituzione alla fine,
    // $pattern è un elemento che inizialmente si trova in quel membro ma potrebbe essere sostituito e quindi non farne più parte 
	var inputIndex;
    var paramType
    var $resList = $()
    var $pattArg
    var $inArg
     //Clono l'input perchè lo voglio manipolare liberamente
    var $cInput = ATOMclone($input);
    if(debugMode){$('#telaRole').append($cInput)}//debug   
    attachEventsAndExtend($cInput);

    //Debug clear colors
    $('*').removeClass("input").removeClass("pattern").removeClass("inputFocus").removeClass("patternFocus");
    //Debug add colors
    ATOMnodesAddClass($cInput,"input");
    ATOMnodesAddClass($pattern,"pattern");

	//********marca con data-order="1" gli elementi della lista iniziale ed anche i loro "ATOMchildren" fino alla N-esima generazione
	var line = serialNumber()
	
	for( inputIndex=0; $cInput[inputIndex] != undefined; inputIndex++){
		var $e = $($cInput[inputIndex])
		//Debug clear colors
    	//$('*').removeClass("inputFocus")
    	//Debug add colors
    	//ATOMnodesAddClass($($cInput[inputIndex]),"inputFocus");
    	if( ATOMSmarkUnmark( $e  ) !== "s" ){//se l'elemento è soggetto a cambiare posto: è un dragged, non considerare la sua posiz.
    		ATOMSmarkLineOrder( $e ,line,inputIndex) 	
    	}
     	
	}
		
		//Debug clear colors
    	//$('*').removeClass("inputFocus")

	//********stabilisci se combacia
	var patternIndex = 0;
	while($pattern[patternIndex] != undefined){

		//Debug clear colors
    	$('*').removeClass("patternFocus")
    	//Debug add colors
    	ATOMnodesAddClass($($pattern[patternIndex]),"patternFocus");

		$resList = $();
		paramType = parameterType($($pattern[patternIndex]),res.$newProp);
        inputIndex = 0;
		//scorri la lista degli input superstiti
		for( inputIndex=0; $cInput[inputIndex] != undefined; inputIndex++){
			
			//Debug clear colors
    		$('*').removeClass("inputFocus")
    		//Debug add colors
    		ATOMnodesAddClass($($cInput[inputIndex]),"inputFocus");

			//paragona l'elemento pattern con l'elemento in input
			//todoooo se parametro è di tipo jolly non fa nessun controllo, dovrebbe controllare tutto meno il nome
			//lineAB($($pattern[patternIndex]),$($cInput[inputIndex]))
			res.matchedTF = false //*probe* non match a meno che i prossimi test diano esito positivo
			if( (paramType == "x_" || paramType == "x__" || paramType == "x___") && titleRequirement($($pattern[patternIndex]),$($cInput[inputIndex])) ){//anche "n" è un possibile typo di var
				res.matchedTF = true;//Match!!!!!
			} 
            else if( equalExtATOM($($pattern[patternIndex]),$($cInput[inputIndex]),true,true) ){			
               	//se l'esterno è uguale pargona la lista degli argomenti 
            	//(anche [] == [] se entrambe liste vuote allora MATCH)
           		//todooo: 
               	//for( each role)paragona i children del role
				//fatto questo dovrò fare qualcosa per eq i cui due membri risulteranno non più commutabili

				$pattArg = $pattern[patternIndex].ATOM_getChildren();
            	$inArg = $cInput[inputIndex].ATOM_getChildren();
            	var $parent = $pattern.parent()//AdaptMatchUL sostituisce all'interno del dom, si deve poi sincronizzare la lista $pattern
				//------------------> recursion
            	if(ATOMSadaptMatchUL($inArg,$pattArg,res.$newProp).matchedTF){
            	//<-----------------
                    res.matchedTF = true;//Match!!!!!
                    //se un elemento del pattern è stato sostituito, la lista $pattern deve essere aggiornata
		    		$pattern = $parent.children('[data-atom]')					                
                }
                //Debug rimetti i colori dopo che sono stati azzerati dalla chiamata ATOMSadaptMatchUL chiamato ricorsivamente 
    			//Debug clear colors
    			$('*').removeClass("input").removeClass("pattern").removeClass("inputFocus").removeClass("patternFocus");
				ATOMnodesAddClass($pattern,	"pattern");
				ATOMnodesAddClass($cInput,"input");
    			ATOMnodesAddClass($($pattern[patternIndex]),"patternFocus");
    			ATOMnodesAddClass($($cInput[inputIndex]),"inputFocus");
            }
            if(  res.matchedTF  ){
            	//aggiungi alla res list
				$resList = $resList.add($cInput[inputIndex]);
				//rimuovi l'elemento dalla lista $cInput
                $($cInput[inputIndex]).remove();
                if( !(paramType == "x__" || paramType == "x___") ){//se il parametro non è di tipo x__ o x___
					break //passa al prossimo pattern senza esplorare i prossimi input
            	}					
			}
            			
	    }
	    //controlla che ci sia almeno un risultato (a meno che non sia facoltativo x_ _ _)
	    if(  paramType !== "x___" && $resList.length == 0 ){
			res.matchedTF = false;
			res.msg = "no input for parameter: " + $pattern[patternIndex].ATOM_getName();
			if(debugMode){$cInput.remove()}//debug 
			return res					
		}
	    //sostituisci il pattern con la lista di risultati ottenuta 
	    // se il pattern non è variabile e combacia vuol dire non è necessario sostituirlo NO OVERKILL
	    if( paramType == "x_" || paramType == "x__" || paramType == "x___" ){
	      	if(debugMode){$resList.find('*').removeClass("input").removeClass("inputFocus");}//debug
		    //rimuovere marcature in $resList altrimenti si mischiano le marcature del transform e dell'input'
			ATOMSmarkUnmark($resList,"")
		    
		    $property = replaceInForall($($pattern[patternIndex]),$resList,$property) 
		}
		else{//fai passare attributi ??? title 
			var $resListClone = ATOMclone($resList);
			ATOMextend($resListClone)
			$resListClone[0].ATOM_getRoles().empty()
			$property = replaceInForall($($pattern[patternIndex]),$resListClone,$property)
		}
		$cInput = $cInput.not($resList)//gli input che hanno trovato collocazione non vanno considerati al prossimo giro     	 
		patternIndex++
	    
	}
	//controlla che non siano avanzati input
	if(  $cInput.length !== 0 ){
			res.matchedTF = false;
			res.msg = "still some input " + $resList[0].ATOM_getName();
			if(debugMode){$cInput.remove()}//debug 
			return res //sono avanzati degli input, no match					
	}
	if(debugMode){$cInput.remove()}//debug 
	return res
}
*/


/*
//decidi il numero d'ordine di una lista di ATOMS
function RecGetOrder($atom){
	var res = ATOMSmarkLineOrder($atom);
	if( isNaN(res.order) ){//se non ha un numero d'ordine cerca tra i children
		var $children = $atom[0].ATOM_getChildren();
		for(var i=0; i<$children.length ; i++){
			res = RecGetOrder($($children[i]))
			if( !isNaN(res.order))
			return res
		}
	}
	return res
}
*/






/*
function ATOMSmarkLineOrder($atom,line,order){
	if(line === ""){// elimina proprietà
		//$atom.removeProp("line");
		//$atom.removeProp("order");
		$atom.removeAttr("data-line");
		$atom.removeAttr("data-order");
	}
	else if(line == undefined ){// leggi proprietà
		var res = {line:undefined,order:undefined}
		res.line = $atom.attr("data-line");
		res.order = $atom.attr("data-order");	
		return res
	}
	else{
		//$atom.prop("line",line);
		//$atom.prop("order",order);		
		$atom.attr("data-line",line);
		$atom.attr("data-order",order);		
	}
}
*/

/*
function order($property){
	//gli eq vanno per ora gestiti separatamente
	var $eqList = 	$property.find('[data-atom="eq"]').addBack('[data-atom="eq"]');//sottoalbero + root
	$eqList.each(function(i,e){
		var $firstMember = e.ATOM_getRoles('.firstMember').children()
		var $secondMember = e.ATOM_getRoles('.secondMember').children()
		if( $firstMember != undefined && $secondMember != undefined){
			if( ATOMSmarkLineOrder( $secondMember ).order == 0 || ATOMSmarkLineOrder( $firstMember).order == 1 ){
				//in questi casi inverti primo e secondo membro;
				$firstMember.prepend($secondMember);
				e.ATOM_getRoles('.secondMember').append($firstMember);		
			} 
		}
	});
	//se trovi role_ul che contiene elementi marcati con un "data-order", allora riordina
	$property.find('.ul_role').each(function(i,e){
		var $list = $(e.children).filter('[data-atom]');
		//var $marked = $list.filter('[data-order]');
		//if( $marked.length != 0){//ci sono marcature in base alle quali ordinare?
		$list.sort( function(a,b){ return  ATOMcompareOrder($(a),$(b))  });
		//$list.remove();//questo distrugge gli event listeners associati
		//$(e).append($list);
		$list.each(function( index, element ){ $(e).prepend(element)})	
	});	
}
*/

/*
function ATOMcompareOrder($atom1,$atom2){
	var o1= RecGetOrder($atom1);
	var o2= RecGetOrder($atom2);
	//if($atom1.prop("line") == $atom2.prop("line")){
	if( o1.line == o1.line ){
	
		return o1.order > o2.order
	}
	else{
		return false  //non è possibile paragonare, quindi non spostare	
	}
}
*/