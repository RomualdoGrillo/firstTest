var dummy

/*

function ATOMSadaptMatchUL($originalInput,$pattern,$property){//agisci sempre paragonando liste funzione ricorsiva
	var res = {matchedTF:false, msg:"", $newProp:$property, $pattern:$pattern ,$operand:$originalInput, $pattRole:""};
	if($originalInput.length==0 && $pattern.length==0){//se entrambe le liste sono vuote allora match
		res.matchedTF=true
		return res
	}
	res.$pattRole = $pattern.parent(); // $pattRole viene utilizzato per effettuare la sostituzione alla fine,
    // $pattern è un elemento che inizialmente si trova in quel membro ma potrebbe essere sostituito e quindi non farne più parte 
	//se il match non ha successo passa in uscita la proprietà iniziale
	var inputIndex;
    var patternIndex = 0;
    var paramType
    var $resList = $()
    var $pattArg
    var $inArg
     //clono l'input perchè lo voglio manipolare liberamente
    var $input = ATOMclone($originalInput);
    if(debugMode){$('#telaRole').append($input)}//debug   
    attachEventsAndExtend($input);

    //Debug clear colors
    $('*').removeClass("input").removeClass("pattern").removeClass("inputFocus").removeClass("patternFocus");
    //Debug add colors
    ATOMnodesAddClass($input,"input");
    ATOMnodesAddClass($pattern,"pattern");

	//********marca con data-order="1" gli elementi della lista iniziale ed anche i loro "ATOMchildren" fino alla N-esima generazione
	
	
	for( inputIndex=0; $input[inputIndex] != undefined; inputIndex++){
		
		//Debug clear colors
    	//$('*').removeClass("inputFocus")
    	//Debug add colors
    	//ATOMnodesAddClass($($input[inputIndex]),"inputFocus");
    	if( $($input[inputIndex]).attr('data-order') == undefined ){// non sovrascrivere ordine
			$($input[inputIndex]).attr('data-order',inputIndex)
    	}
	}
		
		//Debug clear colors
    	//$('*').removeClass("inputFocus")

	//********stabilisci se combacia
	while($pattern[patternIndex] != undefined){

		//Debug clear colors
    	$('*').removeClass("patternFocus")
    	//Debug add colors
    	ATOMnodesAddClass($($pattern[patternIndex]),"patternFocus");

		$resList = $();
		paramType = parameterType($($pattern[patternIndex]),res.$newProp);
        inputIndex = 0;
		//scorri la lista degli input superstiti
		for( inputIndex=0; $input[inputIndex] != undefined; inputIndex++){
			
			//Debug clear colors
    		$('*').removeClass("inputFocus")
    		//Debug add colors
    		ATOMnodesAddClass($($input[inputIndex]),"inputFocus");

			//paragona l'elemento pattern con l'elemento in input
			//todoooo se parametro è di tipo jolly non fa nessun controllo, dovrebbe controllare tutto meno il nome
			res.matchedTF = false //*probe* non match a meno che i prossimi test diano esito positivo
			if( (paramType == "x_" || paramType == "x__" || paramType == "x___") && titleRequirement($($pattern[patternIndex]),$($input[inputIndex])) ){//anche "n" è un possibile typo di var
				res.matchedTF = true;//Match!!!!!
			} 
            else if( equalExtATOM($($pattern[patternIndex]),$($input[inputIndex]),true,true) ){
               	//todooo: 
               	//for( each role)paragona i children del role
				//fatto questo dovrò fare qualcosa per eq i cui due membri risulteranno non più commutabili

               	//se l'esterno è uguale pargona la lista degli argomenti 
            	//(anche [] == [] se entrambe liste vuote allora MATCH)
            	$pattArg = $pattern[patternIndex].ATOM_getChildren();
            	$inArg = $input[inputIndex].ATOM_getChildren();
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
				ATOMnodesAddClass($input,"input");
    			ATOMnodesAddClass($($pattern[patternIndex]),"patternFocus");
    			ATOMnodesAddClass($($input[inputIndex]),"inputFocus");
            }
            if(  res.matchedTF  ){
            	//aggiungi alla res list
				$resList = $resList.add($input[inputIndex]);
				//rimuovi l'elemento dalla lista $input
                $($input[inputIndex]).remove();
                if( !(paramType == "x__" || paramType == "x___") ){//se il parametro non è di tipo x__ o x___
					break //passa al prossimo pattern senza esplorare i prossimi input
            	}					
			}
            			
	    }
	    //controlla che ci sia almeno un risultato (a meno che non sia facoltativo x_ _ _)
	    if(  paramType !== "x___" && $resList.length == 0 ){
			res.matchedTF = false;
			res.msg = "no input for parameter: " + $pattern[patternIndex].ATOM_getName();
			if(debugMode){$input.remove()}//debug 
			return res					
		}
	    //sostituisci il pattern con la lista di risultati ottenuta 
	    // se il pattern non è variabile e combacia vuol dire non è necessario sostituirlo NO OVERKILL
	    if( paramType == "x_" || paramType == "x__" || paramType == "x___" ){
	      	if(debugMode){$resList.find('*').removeClass("input").removeClass("inputFocus");}//debug
		    //rimuovere marcature in $resList altrimenti le si mischiano le marcature del transform e dell'input'
			ATOMSmarkUnmark($resList,"")
		    
		    $property = replaceInForall($($pattern[patternIndex]),$resList,$property) 
		}
		else{//fai passare attributi ??? title 
				
			
		}
		$input = $input.not($resList)//gli input che hanno trovato collocazione non vanno considerati al prossimo giro     	 
		patternIndex++
	    
	}
	//controlla che non siano avanzati input
	if(  $input.length !== 0 ){
			res.matchedTF = false;
			res.msg = "still some input " + $resList[0].ATOM_getName();
			if(debugMode){$input.remove()}//debug 
			return res					
	}
	//********rimetti in ordine
	//se trovi role_ul che contiene elementi marcati con un "data-order", allora riordina
	
	/*
	$property.find('.ul_role').each(function(i,e){
		var $list = $(e.children).filter('[data-atom]');
		//var $marked = $list.filter('[data-order]');
		//if( $marked.length != 0){//ci sono marcature in base alle quali ordinare?
		$list.sort( function(a,b){ return getOrder($(a)) > getOrder($(b))});
		//$list.remove();//questo distrugge gli event listeners associati
		//$(e).append($list);
		$list.each(function( index, element ){ $(e).prepend(element)})	
	})
	*/
	/*

	if(debugMode){$input.remove()}//debug 
	return res
}

*/

/*
function getOrder($atom){
	var order=Number($atom.attr('data-order'))
	if( isNaN(order) ){//se non ha un numero d'ordine cerca tra i children
		var $childrenT = $atom[0].ATOM_getChildren().filter(function(){ return $(this).find('[title="t"]').length != 0 });
		for(var i=0; i<$childrenT.length ; i++){
			order = getOrder($($childrenT[i]))
			if( !isNaN(order) ){return order}
		}
		var $children = $atom[0].ATOM_getChildren();
		for(var i=0; i<$children.length ; i++){
			order = getOrder($($children[i]))
			if( !isNaN(order))
			return order
		}
	}
	return order
}
*/

/*
function compose($toBeComp){
	var res = {matchedTF:false ,replacedAlready:"", msg:"", $newProp: "",$pattern:"",$operand:""}
	//**** la funzione può essere applicata?
	//var $toBeComp=$('.selected')
	var $parent=ATOMparent($toBeComp);
	var op = $parent.attr('data-atom');
	if($toBeComp.length == 0){res.msg = ("nothing selected"); return res}
	//se 1 solo selezionato cerca di comporlo con l'antecedente'
	if($toBeComp.length == 1){
		//controlla se si tratta di elemento neutro, in tal caso fallo semplicemente sparire.
		var tBcClass = $toBeComp.attr("data-atom"); 
		if( tBcClass === "cn" || tBcClass === "ci"){
			var name = $toBeComp[0].ATOM_getName()
			if( (op === "times" && name === "1")||
				(op === "plus" && name === "0")||
				(op === "and" && name === "true")||
				(op === "or" && name === "false") ){
				//$toBeComp.remove()
				//res.replacedAlready=true;
				res.$operand = $toBeComp;
				res.$transform= $([]);
				res.matchedTF=true;
				return	res
				}

		}
		var $AtomBesideSelected

		//Attualmente il contenuto dei role si dispone leftRight e topDown mentre comporre è visto come left e down.
		//di conseguenza per decidere qual'è l'elemento con cui comporre devo distiguere a seconda dell'orientazione.'
		if( $toBeComp.css('display') === "inline-block"){
			$AtomBesideSelected = $(".selected").prevAll('[data-atom]:first');
		}
		else{
			$AtomBesideSelected = $(".selected").nextAll('[data-atom]:first');
		}
		$AtomBesideSelected.addClass("selected");
		$toBeComp = $toBeComp.add($AtomBesideSelected);
		//debug colors
		$('*').removeClass("toBeComposed");
    	//Debug add colors
    	ATOMnodesAddClass($toBeComp,"toBeComposed");	
	}
	if( !checkSiblings($toBeComp)){res.msg = ("not siblings"); return res}
	//*** calcolo generale 
	//Pattern Matching
	ATOMSmarkUnmark($toBeComp,"d")
	//calcolo via algoritmi specifici
	if( op !== "plus" && op !== "times" && op !== "or"){res.msg = ("no composition defined for: " + op); return res};
	//**** calcolo via algoritmo ****
		
	var partial = undefined
	for (var i = 0, len = $toBeComp.length; i < len; i++){//for perchè potrebbe sommare o moltiplicare una lista di n elementi
		var currRes = AtomsToVal( $($toBeComp[i]));
		if(currRes.val == 0 && currRes.exp == -1){// trovato elemento "indigesto" /0
			console.warn("1/0 is meaningless")
			res.matchedTF=false;//non procedere alla sostituzione
			break
		}
		if( currRes.type !== "cn" && currRes.type !== "ci"){// trovato elemento "indigesto"
			partial = currRes
			res.matchedTF=false;
			break
		}
		if( partial == undefined){//*** prima iterazione, il risultato parziale coincide con il primo operando
			partial = currRes;
		}
		else{
			if( op === "times" ){
				//conteggia segni
				partial.sign = partial.sign * currRes.sign;
				//conteggia il valore
				if( partial.val == 1){//se il parziale ha valore 1
					partial.val = currRes.val;
					partial.exp = currRes.exp;
					partial.type = currRes.type;
					res.matchedTF=true;//composed!!
				}
				else if( currRes.val == 1){
					//se valore currRes ha valore 1, non è necessario modificare altro oltre il segno che è già stato computato
					res.matchedTF=true;//composed!!
				}
				else if( partial.val === currRes.val && (partial.exp == currRes.exp * -1) ){//reciproci? C.E. se ha senso l’esp iniziale lo ha anche questa operazione
					partial.exp = 1;
					partial.val  = 1;
					partial.type = "cn";
					res.matchedTF=true;//composed!!
				}
				else if( currRes.type === "cn" && partial.type === "cn" && (partial.exp == currRes.exp)){//esponenti concordi
					partial.val = partial.val * currRes.val;
					res.matchedTF=true;//composed!!
				}
				else if(false){
					var num
					var den
					if(partial.exp == 1){
						num = partial.val;
						den = currRes.val;
					}
					else{
						num = currRes.val;
						den = partial.val;
						}
					if( num%den == 0){//divisione tra interi ?? tarpare ??
						partial.val = num/den;
					}
					else{
						//partial.canBeReplaced = false;
						res.matchedTF=false;//se nessun tentativo è andato a buon fine...
						break	
					}
				}
				else{
					//partial.canBeReplaced = false;
					res.matchedTF=false;//se nessun tentativo è andato a buon fine...
					break
				}
			}
			else if( op === "plus"){

				if( partial.val == 0){//se il parziale ha valore 0
					partial = currRes;
					res.matchedTF=true;//composed!!
				}
				else if( currRes.val == 0){//se valore currRes ha valore 0, non è necessario modificare 
					res.matchedTF=true;//composed!!
				}
				else if( currRes.type === "cn" && partial.type === "cn"){//numerici
					//compute algebric val
					var algRes = currRes.val * currRes.sign + partial.val * partial.sign;
					partial.val = Math.abs(algRes);
					partial.sign = Math.sign(algRes)
					res.matchedTF=true;//composed!!
				}
				else if(currRes.type === "ci" && partial.type === "ci" && (currRes.exp == partial.exp) && (currRes.sign == partial.sign * -1) ){//opposti?
							partial.val = 0;
							partial.exp = 1;
							partial.sign = 1;
							res.matchedTF=true;//composed!!
				}
				else{
						//partial.canBeReplaced = false;
						break
				}
			
			}
			else if(op === "and"){
				partial = currRes
				//partial.canBeReplaced = false;
				break

			}
		}
	}
	//if( partial.canBeReplaced){ 
	if( res.matchedTF == true){
		///****Create Result********
		res.$transform = ValToAtoms(partial)
		res.$operand = $toBeComp
	}
	else {//rimetti le cose come stavano tranne le semplificazioni iniziali
		ATOMSmarkUnmark($toBeComp,"")	
	}
	return res
}

*/