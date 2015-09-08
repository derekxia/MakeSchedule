var code = tokenRequest();
var term;
var numclasseschosen = 0;
var $classes = $('#classes');
var criteria;
var numclasses;
var schedules = [];
var override = []; 
var classarray = [];
var waitlisted = [];
var classes = [];
var filterinfo = [];
var catalognumber, coursedescr, subjectcode;


$(document).ready(function(){

    //get term code
	$.ajax({
		url: 'http://api-gw.it.umich.edu/Curriculum/SOC/v1/Terms/',
		type: 'GET',
		beforeSend: function (xhr) {
   		 	xhr.setRequestHeader("Authorization", "Bearer " + code);
   		 	xhr.setRequestHeader("Accept","application/json");
		},
		success: function(data){
			console.log(data)
			try{
				term = data.getSOCTermsResponse.Term[0].TermCode;
			}
			catch(err){
				term = data.getSOCTermsResponse.Term.TermCode;
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
    		if(errorThrown == "Unauthorized"){
    			alert("Authentication Error");
    		}
    		else{
    			alert("Unknown Error");
    		}
  		}
	});

	//get course id
	$("#tb").keyup(function(event){
	    if(event.keyCode == 13){
	        $("#submit").click();
	    }
	});
	$('#submit').click(function(){
		var courseid = [];
		var classnum = [];
		$classes.empty();
		criteria = $('#tb').val();		
		$.ajax({
			async: false,
			url: 'http://api-gw.it.umich.edu/Curriculum/SOC/v1/Terms/'+ term + '/Classes/Search/'+ criteria,
			type: 'GET',
			beforeSend: function (xhr) {
	   		 	xhr.setRequestHeader("Authorization", "Bearer " + code);
	   		 	xhr.setRequestHeader("Accept","application/json");
			},
			success: function(data){ 
				if($("#classes").css("visibility") == 'hidden'){
					$("#classes").css("visibility", 'visible');
				}
				$.each(data.searchSOCClassesResponse.SearchResult, function(i,classid){					
					classnum.push(classid.ClassNumber); 
					courseid.push(classid.CrseId);
				});	
			
				filteredarray = hasId(classnum, courseid, courseid[0]);
				className(classnum[0],term);
			
				var userpick = removeDuplicates(courseid,classnum);	
				for(numclasses = 0; numclasses < userpick.length; numclasses ++){
					$classes.append('<li class="' + 'pick' + '">'+ className(userpick[numclasses], term)[0] + '</li>'); 
				}
				
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
    			if(errorThrown == "Unauthorized"){
    				alert("Authentication Error");
    			}
    			else{ 
    				alert("Unknown Error");
    			}
  			}
		});
	});

	var filtercount = 0; 

	//runs when the user clicks a class from the search results
	$classes.delegate('.pick', 'click', function(){
		chosenClass = $(this).text();
		$classes.empty();
		if($("#classes").css("visibility") == 'visible'){
			$("#classes").css("visibility", 'hidden');
		}
	
		var res = chosenClass.split(" ");
		catalognumber = res[res.length-2];
		subjectcode = res[res.length-3];
		schoolcode = res[res.length-1];
		var output = [[]];
		numclasseschosen++;
		var arr = [[]];

		arr = ClassArray(catalognumber, subjectcode, schoolcode);
		//checks if its a disc lec or lab
		//if(arr[0].SectionType != )
		console.log(arr)
		//try{
		classarray.push([subjectcode + catalognumber + " " + arr[0].SectionType,arr]); 
		//}
		//catch(err){
			//classarray.push([subjectcode + catalognumber + " " + arr.SectionType,arr]); 
		//}
		
		$("#classeschosen").append('<li class="chosen" id="' + filtercount + 'f">'+ subjectcode + catalognumber + '</li>' );
		filtercount ++;
		$('#mon').append()
		if($(".generate").css("visibility") == 'hidden'){
			$(".generate").css("visibility", 'visible');
			$(".generate.more").css("visibility", 'hidden');
		}
		console.log(classLength("9:00AM - 10:30AM"))
		console.log(arr)
		classes.push((GenerateList(arr)));

		filterinfo.push(MultipleClasses(classarray));
		console.log(classes)

		if($("#classeschosen").css("visibility") == 'hidden'){
			$("#classeschosen").css("visibility", 'visible');
		}
	});
	
	var filterarray = [];	

	$('#filterinfo').delegate('li', 'click', function(){
		
		var classname1 = $(this).attr('class');
		classname1 = classname1.split(" ")
		var cname = classname1[classname1.length -2]
		var ctype = classname1[classname1.length-1]

		//console.log( cname, ctype)
		var text = $(this).attr('class');
		
		var att = text.split(" ");
		att = att[1];
		text = text.substring(1,2);
		text = parseInt(text);
		while(filterarray.length < text +1 ){
			filterarray.push(["",[],[],[],[]]);
		}
		
		
		var filtertext = $(this).text();
		console.log(filterarray)
		

		var color = $(this).css('color');
		console.log(color);
		if(color == "rgb(255, 0, 0)"){
			$(this).css('color', 'white');
			var index = 1;
			if(att == 'Instructors'){ 
				index = 2;
			}
			else if(att == "SectionNumber"){
				index = 3;
			}
			else if(att == 'Days'){
				index = 4;
			}
			filterarray[text][0] = cname.concat(" " + ctype);
			for(var i = 0; i < filterarray[text][index].length; i++){
				if(filterarray[text][index][i] == filtertext){
					filterarray[text][index].splice(i, 1);
				}
			}
		}
		else{
			$(this).css('color', 'red');
			var index = 1;
			if(att == 'Instructors'){ 
				index = 2;
			}
			else if(att == "SectionNumber"){
				index = 3;
			}
			else if(att == 'Days'){
				index = 4;
			}
			filterarray[text][0] = cname.concat(" " + ctype);
			filterarray[text][index].push(filtertext);
		}
		console.log(filterarray)
		
	});

	$('#classtype').delegate('button', 'click', function(){
		var text = $(this).attr('id');
		classnum = text.substring(1,2);
		text = text.substring(2,3);
	
		$('.chosen').trigger( "mouseover", [ classnum, text ]);
	});

	$('#classeschosen').delegate('.chosen', 'mouseover', function(event,classnum, num){

		$('.chosen').css('border', 'none');
		$('.chosen').css('border-bottom', 'solid');
		$('.chosen').css('border-bottom-color', 'white');
		$(this).css('border-style', 'solid');
		$(this).css('border-bottom-color', 'rgb(37, 94,105)');
		$("#filterinfo ul li").remove();
		$('#classtype button').remove();
		$('.chosen').css('background-color', 'rgb(67, 121, 131)');
		$("#filterinfo").css('background-color', 'rgb(37, 94,105)');


		if(typeof classnum == 'undefined'){
			var temp = $(this).attr('id');
			temp = temp.substring(0,1);
			classnum = temp;
		}

		$("#" +  classnum+ "f").css('background-color', 'rgb(37, 94,105)');

		if(typeof num == 'undefined'){
			num = 0;
		}

		var text = classnum;
		var classindex = parseInt(num);

		for(var i = 0; i < text; i++){
			
			classindex += (filterinfo[i].length);
		}

		for(var i = 0; i< filterinfo[text][num][1].length; i++){
			$('#prof').append("<li class='c"+ classindex+" Instructors " + filterinfo[text][num][0] +"''>" + filterinfo[text][num][1][i] + "</li>");
		}
		for(var i = 0; i< filterinfo[text][num][2].length; i++){
			$('#prof').append("<li class='c"+ classindex+" SectionNumber " + filterinfo[text][num][0] +"''>" +filterinfo[text][num][2][i]+ "</li>")
		}
		for(var i = 0; i< filterinfo[text][num][3].length; i++){
			$('#prof').append("<li class='c"+ classindex+" Times " + filterinfo[text][num][0] +"''>" + filterinfo[text][num][3][i] + "</li>")
		}
		for(var i = 0; i< filterinfo[text][num][4].length; i++){
			$('#prof').append("<li class='c"+ classindex +" Days " + filterinfo[text][num][0] +"''>" +filterinfo[text][num][4][i] + "</li>")
		}

		if($("#filterinfo").css("visibility") == 'hidden'){
			$("#filterinfo").css("visibility", 'visible');
		}

		for(var i = 0; i< filterinfo[text].length; i++){
			var temp = filterinfo[text][i][0];
			
			temp = temp.split(" ");
			temp = temp[1];
		
			$('#classtype').append("<button id='c" + text + i + "'>"+ temp + "</button>")
		}

		if(filterarray[classindex]){
			for(var i = 1; i < filterarray[classindex].length; i++){
				for(var j = 0; j < filterarray[classindex][i].length; j++){
					if(filterarray[classindex][i].length > 0){
						$( "li:contains('" + filterarray[classindex][i][j] + "')" ).css("color", "red");
					}
				}
				
			}
		}
		
	});

	var combinations;

	$('#exceptions').delegate('.pickexception', 'click', function(){
		var text = $(this).text();
		var temp = text.split(" ");
		text =  [temp[0]  , temp[1] , temp[2]];
		console.log(text)
		console.log(classes)
		for(var i = 0; i < classes.length; i++){
			for(var j = 0 ; j< classes[i].length; j++){
				for(var k = 0; k < classes[i][j].length; k++){
					if(classes[i][j][k].Classname == temp[0] + " " + temp[1] && classes[i][j][k].SectionNumber == temp[2]){
						classes[i][j][k].Override = "true";
					}
				}
				
			}
		}
		override.push(text);
	});

	$('.generate').click(function(){
		if($("table").css("visibility") == 'hidden'){
			 $("table").css("visibility", 'visible');
		}
		if($("#intro").css("visibility") == 'visible'){
			 $("#intro").css("visibility", 'hidden');
		}
		if($("#pagenumbers").css("visibility") == 'hidden'){
			 $("#pagenumbers").css("visibility", 'visible');
		}
		if($("#pagenumbers").css("visibility") == 'hidden'){
			 $("#pagenumbers").css("visibility", 'visible');
		}
		if($("#classeschosen").css("visibility") == 'hidden'){
			 $("#classeschosen").css("visibility", 'visible');
		}
		if($("#exceptions").css("visibility") == 'hidden'){
			 $("#exceptions").css("visibility", 'visible');
		}

		$('.pickexception').remove();

		waitlisted = [];

		if($(this).text().indexOf('More') == -1){	
			$('.remove').remove();
			schedules = [];
			var parameterstring = [];
			var filteredparameterstring = [];
			for(var u = 0; u < classes.length; u++){
				parameterstring.push([])
			}
			
			for(var i = 0; i < classes.length; i++){
				for(var t= 0; t< classes[i].length; t++){
					parameterstring[i].push([]);
					for(var z = 0; z< classes[i][t].length; z++){
						var copiedObject = jQuery.extend(true, {}, classes[i][t][z]);
						parameterstring[i][t].push(copiedObject);
					}
				}
	
			}
			console.log(parameterstring)
			while(filteredparameterstring.length < parameterstring.length){
				filteredparameterstring.push([]);
			}
			for(var i = 0; i < parameterstring.length; i++){

				for(var j = 0; j < parameterstring[i].length; j++){
					var length = parameterstring[i][j].length
					
					console.log(filterarray)
					
					outside://check if the class has the attribute the user chose, if not, it removes the object
					for(var z = 0; z < length; z++){
						var object = parameterstring[i][j][z];
						for(var f = 0; f < filterarray.length; f++){
							if(filterarray[f][0] == object.Classname){
								console.log(filterarray)
								if(hasAttrs(filterarray[f],  object)){
									console.log('hasttrrs')
									if(z == length-1){
										filteredparameterstring[i].push(parameterstring[i][j]);
									}
								}
								else{		
									break outside;
								}
							}
							else if(z == length - 1){
								filteredparameterstring[i].push(parameterstring[i][j]);
							}
						}
						if(z == length - 1){
							filteredparameterstring[i].push(parameterstring[i][j]);
						}
						
					}


				}
			}

			console.log(filteredparameterstring)

			removeWaitlist(filteredparameterstring, waitlisted);
			console.log(filteredparameterstring)
		
			for(var h = 0; h<waitlisted.length; h++){
				$('#exceptions').append("<li class='pickexception'>" + waitlisted[h].Classname + " " + waitlisted[h].SectionNumber + " Waitlist Size: " + waitlisted[h].WaitTotal + "</li>");
			}
			console.log(waitlisted)
			console.log(filteredparameterstring);
			combinations = cartesian.apply(null, filteredparameterstring);
			
			console.log(combinations)
			combinations = mergeArray(combinations)
			console.log(combinations)
			 
			var weekarray = [];	
			var label = 0;
		}
		for(var i = 0; i < combinations.length; i++){
			var days = new Array(5);
			for (var x = 0; x < 5; x++){
    				days[x] = new Array(48);
 			} 
			for(var j = 0; j< combinations[i].length; j++){
					output = weekArray(combinations, i, j, days);
					if(output == "conflict"){
						break;
					}
			}	
			if(output != "conflict"){
				label = label+1;
				if(label == 10){
					$('#pagenumbers').append("<button class='remove next' id='10'>" + ("10 to 19") + "</button>");
				}
				else if(label<10){
					if(label ==1){
						$('#pagenumbers').append("<button class='remove first'>" + (label) + "</button>");
					}
					else{
						$('#pagenumbers').append("<button class='remove'>" + (label) + "</button>");
					}
				}
				schedules.push(output);
				if(schedules.length%100 == 0){
					 $("#errormessage").append('There are more than 100 schedules');
					 combinations.splice(0, i+1);
					 
					 break;
				}
			}
			
			
			//schedules.push(output);
		}
		console.log(schedules)
		if(schedules.length == 0){
			$("#noclass").append("There are no possible schedules. You can choose to override certain classes by clicking");
		}
		if($(this).text().indexOf('More') != -1){
			displayButtons();
		}
		$( "#pagenumbers .first" ).trigger( "click" );
		////console.log('.' + 5 + ' .'+ (4+1) )
	});


$('#pagenumbers ').delegate('button', 'click', function(){
	//$(".clear").remove();
	//var classinfo;
	page = $(this).text();
	var that = this;
	if(page.indexOf('to')!='-1'){
		//console.log(page)
		displayButtons(page);
	}
	else{
		$(".clear").remove();
		////console.log(page);
		for(var i = 0; i<schedules[page-1].length; i++){
			var classinfo = "reset";
			var span = 1;
			for(var j = 0; j<schedules[page-1][i].length; j++){
				if(typeof  schedules[page-1][i][j] != "undefined"){
					if(classinfo == schedules[page-1][i][j].Classname + " Section " +  schedules[page-1][i][j].SectionNumber || classinfo ==schedules[page-1][i][j].Classname + " Section " +  schedules[page-1][i][j].SectionNumber + schedules[page-1][i][j].EnrollmentStatus+schedules[page-1][i][j].WaitTotal ){
						//console.log("first")
						var index = j - span

						span = $('.' + index + " ." + (100+i) ).attr('rowSpan');
						////console.log(span)
						span++;
						////console.log(span)
						//var index = j - span -1;
						////console.log($('.' + (j-1) + " ." + (100+i) ).attr('rowSpan'))
						$('.' + index + " ." + (100+i) ).attr('rowSpan', span);
						////console.log($('.' + (j-1) + " ." + (100+i) ).attr('rowSpan'))
						
					}
					else{
						
						var length1 = Math.floor(j/2)
						if(schedules[page-1][i][j].EnrollmentStatus == "Wait List"){
							classinfo = schedules[page-1][i][j].Classname + " Section " +  schedules[page-1][i][j].SectionNumber + schedules[page-1][i][j].EnrollmentStatus+schedules[page-1][i][j].WaitTotal ;
						}
						else{
							classinfo = schedules[page-1][i][j].Classname + " Section " +  schedules[page-1][i][j].SectionNumber;
						}
						span = 1;
						$('.' + j  ).append("<td rowSpan='1' class='clear " + (i + 100) + "'>"+classinfo+"</td>");
					
					}
				}
				else{
						$('.' + j  ).append("<td class='clear blank'></td>");
			

				}
			}
		}
		
	}

	$( "td:contains(' ')" ).css("background", "rgb(146, 181, 209)");
	$( "td:contains('Wait')" ).css("background", "rgb(239, 159, 175)");
	$( "td:contains(' ')" ).css("color", "rgb(25,25,112)");
	//$('.12pm .Mo').text("new");
	//$(".8am.Mo").text( "yooooooooooooo" );
	$("table").click(function(){
		var text = $(this).attr('id')
		console.log(text);
	});
});

function isInArray(value, array) {
  for(var i = 0; i < array.length; i++){
  	if(array[i] == value){
  		return true;
  	}
  }
  return false;
}


function removeWaitlist(filteredparameterstring, waitlisted){
	console.log(filteredparameterstring)
	debugger;
	for(var i = 0; i < filteredparameterstring.length; i++){
		for(var j = 0; j <filteredparameterstring[i].length; j++){
			for(var k = 0; k < filteredparameterstring[i][j].length; k++){
				//IF filtereIJK.OVERRIDE ==FALSE THEN SPLICE< OR ELSE KEEP 

				if(!('Override'  in filteredparameterstring[i][j][k]) && filteredparameterstring[i][j][k].Override != "true"  && (filteredparameterstring[i][j][k].EnrollmentStatus == "Closed" || filteredparameterstring[i][j][k].EnrollmentStatus == "Wait List")){						
					console.log(filteredparameterstring[i][j][k].EnrollmentStatus)
					if(filteredparameterstring[i][j][k].EnrollmentStatus == "Wait List"){
						console.log('yeee')
						if(isInArray(filteredparameterstring[i][j][k], waitlisted)!= true){
							waitlisted.push(filteredparameterstring[i][j][k]);
							console.log(waitlisted)
						}
					}
					if(k == filteredparameterstring[i][j].length -1){
						filteredparameterstring[i].splice(j,1);
						j--;
						break;
					}

				}
			}
		}
					
	}
}

function displayButtons(page){
	$('.remove').remove()
	////console.log($('#pagenumbers').text)
	var label = page;
	////console.log(label)
	var str = label.split(" ");
	label = str[0];

	var x = 0;
	////console.log(label)
	while(label<schedules.length && x<10){

		////console.log("in loop");
		$('#pagenumbers').append("<button class='remove'>" + (label) + "</button>");
		label++;
		x++;
	
	}
	if((label%100==0)){
		if($(".generate.more").css("visibility") == 'hidden'){
			 	$(".generate.more").css("visibility", 'visible');
			 
		}
	}
	else{	
		$('#pagenumbers').append("<button class='remove next'>" + (label) + " to " + (label+9) + "</button>");
	}			// c
				//$('#pagenumbers').append("<button>" + (label) + "</button>");
}

function GenerateList(classarray){
	var levels = {}; //returns int for what level it is
	var level = {}; //returns  the object representing the class for the current level
	var cur = 1;
	var outputarray = [];
	var temparray = [[]];
	var tempindex = 0;
	var repeat;
	for(var i = 0; i < classarray.length; i++){
		var sectiontype = classarray[i].SectionType;
		if(i>0 && levels[sectiontype] == 1){
			level = {};
			repeat = false;
		}

		if(i>0 && levels[sectiontype] < levels[classarray[i-1].SectionType] ){ //evaluates true if a lower level is next so cartesian needs to run 
			if(temparray.length > 1  ){
				console.log("iscalled");
				outputarray = outputarray.concat(cartesian.apply(null, temparray));
				repeat = "false";
				temparray = [[]];
				tempindex = 0; 
			}
			else{
				var temp = [];
				
				temp = temp.concat(temparray)
				for(var f = 0; f < temp[0].length-1; f++){
					if(temp[0][f].length < temp[0][f+1].length){
						temp[0].splice(f,1);
						f--;
					}
				}
				outputarray = outputarray.concat(temp[0]);
				for (var key in level) {
				  if (key > levels[sectiontype]) {
				    delete level[key];
				  }
				}
				for (var key in levels){
					if (levels[key] > levels[sectiontype]){
						delete levels[key];
						cur--;
					}
				}
				repeat = "false";
				temparray = [[]];
				tempindex = 0; 
			}
		}
					
		if(levels[sectiontype] == null){
			levels[sectiontype] = cur;
			cur +=1;
		}
		else if(levels[sectiontype] == levels[classarray[i-1].SectionType]){
			repeat = 'true';
		}
		//level[levels[sectiontype]] = classarray[i];
		if(repeat == "true" && levels[sectiontype] > levels[classarray[i-1].SectionType]){ //evaluates true if repeat and larger
			level = {};
			tempindex +=1;
			temparray[tempindex] = [];
			//console.log(temparray.length);
		}
		level[levels[sectiontype]] = classarray[i];
		temparray[tempindex].push([]);
		for(var j = 1; j < levels[sectiontype]+1; j ++){
			//console.log(temparray[tempindex].length)
			if(level[j]!= null){
				temparray[tempindex][temparray[tempindex].length-1].push(level[j]);
			}
			//console.log(temparray.length);
		}
		console.log(temparray);
	}
	
	if(temparray.length>1){
		outputarray = outputarray.concat(cartesian.apply(null, temparray));
		outputarray = mergeArray(outputarray);
	}
	else if(temparray[0].length>0){
		for(var f = 0; f < temparray[0].length-1; f++){
			if(temparray[0][f].length < temparray[0][f+1].length){
				temparray[0].splice(f,1);
				f--;
			}
		}
		outputarray = outputarray.concat(temparray[0]);
	}
	console.log(outputarray);
	return outputarray;
}
function weekArray(combinations, i, j, days){
				
				if(combinations[i][j].Meeting.Days){
					var classday =  new Array(5);
					if(combinations[i][j].Meeting.Days.indexOf('Mo') != -1){
						classday[0] = 1;
					}
					if(combinations[i][j].Meeting.Days.indexOf('Tu') != -1){
						classday[1] = 1;
					}
					if(combinations[i][j].Meeting.Days.indexOf('We') != -1){
						classday[2] = 1;
					}
					if(combinations[i][j].Meeting.Days.indexOf('Th') != -1){
						classday[3] = 1;
					}
					if(combinations[i][j].Meeting.Days.indexOf('Fr') != -1){
						classday[4] = 1;
					}
					////console.log(classday)
					//startandlength[0] ==start, 2 is length 
					var startandlength = classLength(combinations[i][j].Meeting.Times);
					for(var x = 0; x<5; x++){
						if(classday[x] == 1){
							////console.log(days)
							for(var z = 0; z < startandlength[1]*2; z ++){
								if(typeof days[x][startandlength[0]*2 + z] == "undefined"){
									days[x][startandlength[0]*2 + z] = combinations[i][j];
								}
								else{
									if(j == 3){
										console.log('in conflict')
									}
									return "conflict";
								}
							}
							
						}
					}
				}
				else{
					for(var h = 0; h < combinations[i][j].Meeting.length; h++){
							var classday =  new Array(5);
							////console.log(i)
							if(combinations[i][j].Meeting[h].Days.indexOf('Mo') != -1){
								////console.log('mo2', i, combinations[i][j].Meeting[h].Days)
								classday[0] = 1;
							}
							if(combinations[i][j].Meeting[h].Days.indexOf('Tu') != -1){
								classday[1] = 1;
							}
							if(combinations[i][j].Meeting[h].Days.indexOf('We') != -1){
								classday[2] = 1;
							}
							if(combinations[i][j].Meeting[h].Days.indexOf('Th') != -1){
								classday[3] = 1;
							}
							if(combinations[i][j].Meeting[h].Days.indexOf('Fr') != -1){
								classday[4] = 1;
							}
							////console.log(classday)
							//startandlength[0] ==start, 2 is length 
							var startandlength = classLength(combinations[i][j].Meeting[h].Times);
							for(var x = 0; x<5; x++){
								if(classday[x] == 1){
									////console.log(days)
									for(var z = 0; z < startandlength[1]*2; z ++){
										if(typeof days[x][startandlength[0]*2 + z] == "undefined"){
											days[x][startandlength[0]*2 + z] = combinations[i][j];
										}
										else{
											return "conflict";
										}
									}
									
								}
							}
					}
				}
				
				return days;
	

}
//return the length of the class in half hours
function classLength(timeString){
	
	var position = timeString.indexOf(':');
	var position2 = getPosition(timeString, ':', 2);
	var classLength;
	////console.log(parseInt(timeString.substring(position2+1, position2+2),10))


	if(timeString.charAt(position+3) == 'A' && timeString.charAt(position2+3) == 'A'){
		classLength = 12 - parseInt(timeString.substring(0, position),10) - parseInt(timeString.substring(position+1, position+3),10)/60
					- (12- (parseInt(timeString.substring(timeString.indexOf('-')+2, position2),10)) - parseInt(timeString.substring(position2+1, position2+3),10)/60);
		if(parseInt(timeString.substring(0,position),10) == '12'){
			return [parseInt(timeString.substring(0, position))+(parseInt(timeString.substring(position+1, position+3)))/60, 12 - classLength];
		}	
		else{
			return [parseInt(timeString.substring(0, position))+(parseInt(timeString.substring(position+1, position+3)))/60, classLength];
		}
	}
	if(timeString.charAt(position+3) == 'A' && timeString.charAt(position2+3) == 'P'){
		classLength = 12 - parseInt(timeString.substring(0, position),10) - parseInt(timeString.substring(position+1, position+3),10)/60
					+ ((parseInt(timeString.substring(timeString.indexOf('-')+2, position2),10)) + parseInt(timeString.substring(position2+1, position2+3),10)/60);


		
		if(parseInt(timeString.substring(timeString.indexOf('-')+2, position2),10) == '12'){
			return [parseInt(timeString.substring(0, position))+(parseInt(timeString.substring(position+1, position+3)))/60, classLength - 12];
		}	
		else{
			return [parseInt(timeString.substring(0, position))+(parseInt(timeString.substring(position+1, position+3)))/60, classLength];
		}
	}
	if(timeString.charAt(position+3) == 'P' && timeString.charAt(position2+3) == 'P'){
		classLength = - (parseInt(timeString.substring(0, position),10) + parseInt(timeString.substring(position+1, position+3),10)/60)
					+ ((parseInt(timeString.substring(timeString.indexOf('-')+2, position2),10)) + parseInt(timeString.substring(position2+1, position2+3),10)/60);
		////console.log(classLength)
		if(parseInt(timeString.substring(0,position),10) == '12'){
			return [12, classLength + 12];
		}	
		else{
			////console.log('yay', parseInt(timeString.substring(0, position))+(parseInt(timeString.substring(position+1, position+3)))/60+12);
			return [parseInt(timeString.substring(0, position))+(parseInt(timeString.substring(position+1, position+3)))/60+12, classLength];
		}
	}
}

	
});

function getPosition(str, m, i) {
   return str.split(m, i).join(m).length;
}
//returns an array with lab and discussion sections as separate classes

//double time sections aren't accoutned for ie: chem 130 with meeting[2]
function MultipleClasses(classarray){
	console.log(classarray)
	var filter = [];
	var classtypes = [];
	var numinputs = numclasseschosen - 1;
	
	
	classtypes.push(classarray[numinputs][1][0].SectionType);
	
	
	var details = classarray[numinputs][0].split(" ");
	filter.push([details[0] + " "+  classarray[numinputs][1][0].SectionType, [], [], [], []]);
	var count = 0;
	var limit = classarray[numinputs][1].length;
	console.log(classarray)
	for(i = 0; count<limit;){
		for(j = 0; j<classtypes.length; j++){
			if(classarray[numinputs][1][i].SectionType==classtypes[j]){
				filter[j][1].push(classarray[numinputs][1][i].Meeting.Instructors);
				filter[j][2].push(classarray[numinputs][1][i].SectionNumber);
				filter[j][3].push(classarray[numinputs][1][i].Meeting.Times);
				filter[j][4].push(classarray[numinputs][1][i].Meeting.Days);
				classarray[numinputs][1][i].Classname = details[0]+ " " + classtypes[j];
				classarray[numinputs +(j)][1].push(classarray[numinputs][1][i]);
				classarray[numinputs][1].splice(i,1);
				count ++;
				break;
			}	
			else if(j == classtypes.length - 1){
				filter.push([ details[0] + " " + classarray[numinputs][1][i].SectionType, [classarray[numinputs][1][i].Meeting.Instructors],  [classarray[numinputs][1][i].SectionNumber],  [classarray[numinputs][1][i].Meeting.Times],  [classarray[numinputs][1][i].Meeting.Days]]);
				classarray[numinputs][1][i].Classname = details[0] + " " + classarray[numinputs][1][i].SectionType;
				classarray.push([details[0] +" "+  classarray[numinputs][1][i].SectionType,[]]);
				classtypes.push(classarray[numinputs][1][i].SectionType);
				classarray[numinputs +(1)+j][1].push(classarray[numinputs][1][i]);
				classarray[numinputs][1].splice(i,1);
				count ++;
				numclasseschosen++;
				break;
		    }
		}
    }

    var unique;
    for(var h = 0; h<classtypes.length; h++){
    	for(var t = 1; t< 5; t++){
    		var unique = [];
    		$.each(filter[h][t], function(i, element){
    			if($.inArray(element, unique) == -1 && typeof element!= "undefined") unique.push(element);
			});
			filter[h][t] = unique;
    	}
    }
   
    return filter;
}

//returns list of sections for the user selected course
function ClassArray(catalognumber, subjectcode, schoolcode){
	var arr;
	$.ajax({
			async: false,
			url: 'https://api-gw.it.umich.edu/Curriculum/SOC/v1/Terms/'+ term + '/Schools/' + schoolcode + '/Subjects/' + subjectcode + '/CatalogNbrs/' + catalognumber + '/Sections',
			type: 'GET',
			beforeSend: function (xhr) {
	   		 	xhr.setRequestHeader("Authorization", "Bearer " + code);
	   		 	xhr.setRequestHeader("Accept","application/json");
			},
			success: function(data){
				arr = data.getSOCSectionsResponse.Section;
				if(typeof arr === "object"){
					arr = [arr]
				}
				console.log(data)
			}
	});
	return arr;
}


function mergeArray(array){
	var out = [];
	for(var i = 0; i < array.length; i++){
		out.push([])
		for(var j = 0; j < array[i].length; j++){
			out[i] = out[i].concat(array[i][j]);
		} 
	}
	return out;
}

//returns array of objects representing each class that was selected by the user
function ClassObjects(coursename, classNumberArray){
	var arr = [];
	for(var i =0; i<classNumberArray.length ; i++){
		$.ajax({
			url: 'http://api-gw.it.umich.edu/Curriculum/SOC/v1/Terms/'+ term +'/Classes/'+ classNumberArray[i],
			type: 'GET',
			beforeSend: function (xhr) {
	   		 	xhr.setRequestHeader("Authorization", "Bearer " + code);
	   		 	xhr.setRequestHeader("Accept","application/json");
			},
			success: function(data){
				arr.push({
							time: data.getSOCSectionListByNbrResponse.ClassOffered.Meeting.Times,
							teacher: data.getSOCSectionListByNbrResponse.ClassOffered.Meeting.Instructors,
							name:data.getSOCSectionListByNbrResponse.ClassOffered.SubjectCode+data.getSOCSectionListByNbrResponse.ClassOffered.CatalogNumber,
							description:data.getSOCSectionListByNbrResponse.ClassOffered.CourseDescr,
							location:data.getSOCSectionListByNbrResponse.ClassOffered.Meeting.Location,
							days:data.getSOCSectionListByNbrResponse.ClassOffered.Meeting.Days,
							credits:data.getSOCSectionListByNbrResponse.ClassOffered.CreditHours,
							capacity: data.getSOCSectionListByNbrResponse.ClassOffered.EnrollmentCapacity,
							total: data.getSOCSectionListByNbrResponse.ClassOffered.EnrollmentTotal,
						  });
				//arr.push(obj);
				console.log(arr);
			}
		});
	}
	console.log(arr);
	return arr;
}
//returns array with classes as chosen by user(with the right id)
function hasId(classnum, courseid, id){
	var arr = [];
	for(var i = 0; i < classnum.length; i ++){
		if(courseid[i] == id){
			arr.push(classnum[i]);
		}
	}
	return arr;
}
//returns true if that class has all the attrs
function hasAttrs(attributes, classobject){
	console.log(attributes)
	console.log(classobject.SectionNumber)
	if(classobject.SectionNumber == 900){
		console.log("yeeeeeee")
	}
	var hasatt = false;
	//attributes
	// [times] [instructors] [sections] [days]
	for(var i  = 0; i < attributes[1].length; i++){
		if(classobject.Meeting.Times == attributes[1][i]){
			hasatt = true;
		}
	}
	if(!hasatt && attributes[1].length != 0){
		return false;
	}
	hasatt= false;
	for(var i  = 0; i < attributes[2].length; i++){
		if(classobject.Meeting.Instructors == attributes[2][i]){
			hasatt = true;
		}
	}
	if(!hasatt&& attributes[2].length != 0){
		return false;
	}
	hasatt= false;
	for(var i  = 0; i < attributes[3].length; i++){
		if(classobject.SectionNumber == attributes[3][i]){
			hasatt = true;
		}
	}
	if(!hasatt&& attributes[3].length != 0){
		return false;
	}
	hasatt= false;
	for(var i  = 0; i < attributes[4].length; i++){
		if(classobject.Meeting.Days == attributes[4][i]){
			hasatt = true;
		}
	}
	if(!hasatt && attributes[4].length != 0){
		return false;
	}
	else{
		return true;
	}
}

//returns true if the class has the coursename
function isCourse(classnum,term,coursename){
	$.ajax({
		url: 'http://api-gw.it.umich.edu/Curriculum/SOC/v1/Terms/'+ term +'/Classes/'+ classnum,
		type: 'GET',
		beforeSend: function (xhr) {
   		 	xhr.setRequestHeader("Authorization", "Bearer " + code);
   		 	xhr.setRequestHeader("Accept","application/json");
		},
		success: function(data){
			if(data.getSOCSectionListByNbrResponse.ClassOffered.CourseDescr == coursename){
				return true;
			}
			else{
				return false;
			}
		}
	});
}
//returns an array with the class name[0] and the courseid[1]
function className(classnum, term){
	var arra = [];
	$.ajax({
		async: false,
		url: 'http://api-gw.it.umich.edu/Curriculum/SOC/v1/Terms/'+ term +'/Classes/'+ classnum,
		type: 'GET',
		beforeSend: function (xhr) {
   		 	xhr.setRequestHeader("Authorization", "Bearer " + code);
   		 	xhr.setRequestHeader("Accept","application/json");
		},
		success: function(data){
			////console.log(data, classnum, 'http://api-gw.it.umich.edu/Curriculum/SOC/v1/Terms/'+ term +'/Classes/'+ classnum)
			a = data.getSOCSectionListByNbrResponse.ClassOffered.SubjectCode;
			b = data.getSOCSectionListByNbrResponse.ClassOffered.CatalogNumber;
			c = data.getSOCSectionListByNbrResponse.ClassOffered.CourseDescr;
			d = data.getSOCSectionListByNbrResponse.ClassOffered.Acad_Group;
			arra.push(c + " " + a + " " + b + " " + d);
		}
	});
	return arra;
}
function removeDuplicates(course, classnum) {
  var out = [];
  var compare = [];
  compare.push(course[0]);
  for(i = 0; i<course.length; i++){
  	for(j = 0; j<compare.length; j++){
  		if(course[i]==compare[j]){
  			break;
  		}	
  		if(j == compare.length - 1){
			compare.push(course[i]);
			out.push(classnum[i]);
		}
  	}
  }
  if(out.length == 0){
  	out.push(classnum[0])
  	return out;
  }
  return out;
}


function cartesian() {
	alert(arguments.length);
    var r = [], arg = arguments, max = arg.length-1;
    function helper(arr, i) {
        for (var j=0, l=arg[i].length; j<l; j++) {
            var a = arr.slice(0); // clone arr          
            a.push(arg[i][j]); 
            if(i==max){   
                r.push(a);
            } 
            else{          	
                helper(a, i+1);
            }
        }
    }
    helper([], 0);
    return r;
}
function cartesian1() {
	alert(arguments.length);
    var r = [], arg = arguments, max = arg.length-1;
    function helper(arr, i) {
        for (var j=0, l=arg[i].length; j<l; j++) {
            var a = arr.slice(0); // clone arr
            console.log("max is " + max+ "i is "+ i)
            if(typeof arg[i]!== "undefined" && jQuery.isArray(arg[i][j])){
            	console.log("yee")
            	a = a.concat(arg[i][j]);
            }
            else{
            	a.push(arg[i][j]);
            }
            
            
            if(i==max){
            	console.log(i)
            	console.log(max)
            	//access every element of the cartesian array
            	//change stuff here instead of before 
            	for(i in a){

            	}
                r.push(a);
            } 
            else{
            	console.log('running agian')
                helper(a, i+1);
            }
        }
    }
    console.log('running 0')
    helper([], 0);
    return r;
}

//API AUTHENTICATION
function tokenRequest(){
	var key = "j4QApPnnlrm3_cpHV6h4sNJ5Lhka"
	var secret = "qIX7VsQW64krR0NTN9n4gSQER8oa"

	var encodedAuth = btoa(key + ":" + secret);
	var output;

	$.ajax({
		url: 'https://api-km.it.umich.edu/token',
		async: false,
		type: 'POST',
		data: "grant_type=client_credentials&scope=PRODUCTION",

		beforeSend: function (xhr) {
   		 	xhr.setRequestHeader("Authorization", "Basic " + encodedAuth);
   		 	xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		},

		success: function(data){
			console.log(data)
			output = data.access_token;
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
     		alert("Authentication Error");
  		}
	});

	return output;


}
