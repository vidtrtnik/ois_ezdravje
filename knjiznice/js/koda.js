
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";

var tabelaSimptomov = new Array();

var poizvedba = 0;
var i = 0;

var jsonBazaZdravil = {
	"name" : "Zdravila"
};

//var nov = "vnos3";
//jsonObj[nov] = {};
//jsonObj[nov]["ime"] = """;
//jsonObj[nov]["ehrstevilka"] = "";

var bazaVzorcni = {
            vnos1:
            {
                ime: "Nina",
                priimek: "Novak",
                datumrojstva: "1970-1-1",
                teza: "80",
                temperatura: "36.40",
                visina: "170",
                tlaksis: "120",
                tlakdia: "90",
                ehrstevilka: "4e0f8fcb-41d7-4b98-b797-e52844735295"
                
            },
            vnos2: 
            {
                ime: "Peter",
                priimek: "Pandel",
                datumrojstva: "1960-10-10",
                teza: "90",
                temperatura: "36.40",
                visina: "180",
                tlaksis: "130",
                tlakdia: "80",
                ehrstevilka: "32bae921-01b9-41f4-9941-b2af8a44f426"
                
            },
            vnos3: 
            {
                ime: "Marko",
                priimek: "Marolt",
                datumrojstva: "1980-6-6",
                teza: "66",
                temperatura: "41.00",
                visina: "199",
                tlaksis: "150",
                tlakdia: "60",
                ehrstevilka: "25213b85-e9cc-4edd-9849-1801b023728d"
                
            }
};

/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}


/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */
function generirajPodatke(stPacienta) {
		if(poizvedba != 0)
	{
		location.reload(true);
		return 0;
	}
  var vnos = "vnos" + stPacienta.toString();
  var x = document.getElementById("glavniSeznam");
  var option = document.createElement("option");
  option.text = bazaVzorcni[vnos].ime + " " + bazaVzorcni[vnos].priimek + " {" + bazaVzorcni[vnos].ehrstevilka + "}";
  x.add(option);
  x.lastElementChild.selected = true;
  var ehrId = bazaVzorcni[vnos].ehrstevilka;
  preberiOsnovneMeritve(ehrId, false);

  return ehrId;
}

function vnesiNovega()
{
    sessionId = getSessionId();
var ret = 0;
var datum = new Date();
	var ime = $("#polje_ime").val();
	var priimek = $("#polje_priimek").val();
	var datumRojstva = $("#polje_starost").val();
	var telesnaVisina = $("#polje_visina").val();
	var telesnaTeza = $("#polje_teza").val();
	var telesnaTemperatura = $("#polje_temperatura").val();
	var sistolicniKrvniTlak = $("#polje_tlaksis").val();
	var diastolicniKrvniTlak = $("#polje_tlakdia").val();

	if (!ime || !priimek || !datumRojstva || !telesnaTeza || !telesnaVisina || !telesnaTemperatura || !sistolicniKrvniTlak || !diastolicniKrvniTlak || ime.trim().length == 0 ||
      priimek.trim().length == 0 || datumRojstva.trim().length == 0) {
		ret = 0;
		alert("NAPAKA: Vnesi vse zahtevane podatke!");
		return ret;
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		$.ajax({
		    url: baseUrl + "/ehr",
		    type: 'POST',
		    success: function (data) {
		        var ehrId = data.ehrId;
		        var partyData = {
		            firstNames: ime,
		            lastNames: priimek,
		            dateOfBirth: datumRojstva,
		            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
		        };
		        $.ajax({
		            url: baseUrl + "/demographics/party",
		            type: 'POST',
		            contentType: 'application/json',
		            data: JSON.stringify(partyData),
		            success: function (party) {
		                if (party.action == 'CREATE') {
	//var nasicenostKrviSKisikom = $("#dodajVitalnoNasicenostKrviSKisikom").val();
	//var merilec = $("#dodajVitalnoMerilec").val();

	if (!ehrId || ehrId.trim().length == 0) {
		alert("vnesi podatke: " + ehrId);
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		var podatki = {
		    "ctx/language": "en",
		    "ctx/territory": "SI",
		    "ctx/time": datum,
		    "vital_signs/height_length/any_event/body_height_length": telesnaVisina,
		    "vital_signs/body_weight/any_event/body_weight": telesnaTeza,
		   	"vital_signs/body_temperature/any_event/temperature|magnitude": telesnaTemperatura,
		    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
		    "vital_signs/blood_pressure/any_event/systolic": sistolicniKrvniTlak,
		    "vital_signs/blood_pressure/any_event/diastolic": diastolicniKrvniTlak,
		    "vital_signs/indirect_oximetry:0/spo2|numerator": 100
		};
		var parametriZahteve = {
		    ehrId: ehrId,
		    templateId: 'Vital Signs',
		    format: 'FLAT',
		    committer: ' '
		};
		$.ajax({
		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(podatki),
		    success: function (res) {
		        alert("Podatki so uspešno vnešeni");
		        ret = ime + " " + priimek + " " + "{" + ehrId + "}";
		        console.log(ret);
		        var x = window.opener.document.getElementById("glavniSeznam");
        		var option = window.opener.document.createElement("option");
        		$("#dobljenehr").val(ehrId);
        		option.text = ret;
        		x.add(option);
				x.lastElementChild.selected = true;
				preberiOsnovneMeritve(ehrId, true);
		        return ret;
		    },
		    error: function(err) {
    		    console.log(err.responseText);
    		    ret = 0;
		    }
		});
	}
		                }
		            },
		            error: function(err) {
		            	alert("NAPAKA!");
		            	ret = 0;
		            }
		        });
		    }
		});
	}
	return ret;
	
}

// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija
function vnosOK() {
    var r = vnesiNovega();
    console.log("vrnjeno: " + r);
    
    if(r != 0)
    {
        var x = window.opener.document.getElementById("glavniSeznam");
        var option = window.opener.document.createElement("option");
        option.text = r;
        x.add(option);
    }
   return true;
};

function odpriObrazec()
{
   window.open("/obrazec.html", "_blank", "toolbar=no,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=500");
   return true;
}

function seznamSprememba(){
	if(poizvedba != 0)
	{
		location.reload(true);
	}
	tabelaSimptomov = [];
	document.getElementById('izpisSimptomov').innerHTML = "";
	var seznam = document.getElementById("glavniSeznam");
	var str = seznam.options[seznam.selectedIndex].text;
	var ehrId = str.substring(str.lastIndexOf("{")+1,str.lastIndexOf("}"));
	preberiOsnovneMeritve(ehrId, false);
	console.log(ehrId);
	
}


function preberiOsnovneMeritve(ehrId, vnos) {
	sessionId = getSessionId();


	if (!ehrId || ehrId.trim().length == 0) {
		alert("napaka: ehrid = 0");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
	    	type: 'GET',
	    	headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				if(!vnos)
				{
				document.getElementById('tabela_ime').innerHTML = party.firstNames;
				document.getElementById('tabela_priimek').innerHTML = party.lastNames;
				document.getElementById('tabela_starost').innerHTML = party.dateOfBirth;
				}
				else{
					window.opener.document.getElementById('tabela_ime').innerHTML = party.firstNames;
				window.opener.document.getElementById('tabela_priimek').innerHTML = party.lastNames;
				window.opener.document.getElementById('tabela_starost').innerHTML = party.dateOfBirth;
				}
					$.ajax({
  					    url: baseUrl + "/view/" + ehrId + "/" + "body_temperature",
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	if (res.length > 0) {
					    		if(!vnos){
					    			document.getElementById('tabela_temperatura').innerHTML = res[0].temperature + res[0].unit;
					    			if(res[0].temperature > 37)
					    			{
					    				document.getElementById('tabela_temperatura').innerHTML += '<font color="red">  (!!!) </font>';
					    				tabelaSimptomov.push("Vročina");
					    				document.getElementById('izpisSimptomov').innerHTML = tabelaSimptomov.join(" - ").toString();
					    			}
					    		}
					    		else{
					    			window.opener.document.getElementById('tabela_temperatura').innerHTML = res[0].temperature + res[0].unit;
					    			if(res[0].temperature > 37)
					    			{
					    				window.opener.document.getElementById('tabela_temperatura').innerHTML +='<font color="red">  (!!!) </font>';
					    				tabelaSimptomov.push("Vročina");
					    				window.opener.document.getElementById('izpisSimptomov').innerHTML = tabelaSimptomov.join(" - ").toString();
					    			}
					    		}
					    	}
					    	else {
					    		alert("NAPAKA: Ni podatkov");
					    	}
					    },
					    error: function() {
					    	alert("Napaka pri branju temperature");
					    }
					});
			
					$.ajax({
					    url: baseUrl + "/view/" + ehrId + "/" + "weight",
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	if (res.length > 0) {
					    		if(!vnos)
					    		{
						    	document.getElementById('tabela_teza').innerHTML = res[0].weight + res[0].unit;
						    	if(res[0].weight > 120)
					    			{
					    				document.getElementById('tabela_teza').innerHTML += '<font color="red">  (!!!) </font>';
					    				tabelaSimptomov.push("Teža");
					    				document.getElementById('izpisSimptomov').innerHTML = tabelaSimptomov.join(" - ").toString();
					    			}
					    		}
					    		else{
					    			
					    			window.opener.document.getElementById('tabela_teza').innerHTML = res[0].weight + res[0].unit;
					    			if(res[0].weight > 120)
					    			{
					    				window.opener.document.getElementById('tabela_teza').innerHTML += '<font color="red">  (!!!) </font>';
					    				tabelaSimptomov.push("Teža");
					    				window.opener.document.getElementById('izpisSimptomov').innerHTML = tabelaSimptomov.join(" - ").toString();
					    			}
					    		}
					    	} else {
					    		alert("NAPAKA: Temperatura - ni podatkov")
					    	}
					    },
					    error: function(err) {
					    	alert("NAPAKA:" + JSON.parse(err.responseText).userMessage + "'!");
					    }
					});
					
					$.ajax({
					    url: baseUrl + "/view/" + ehrId + "/" + "blood_pressure",
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	if (res.length > 0) {
					    		if(!vnos)
					    		{
						    		document.getElementById('tabela_tlakdia').innerHTML = res[0].diastolic + res[0].unit;
						    		document.getElementById('tabela_tlaksis').innerHTML = res[0].systolic + res[0].unit;
						    		if(res[0].diastolic > 90 || res[0].systolic > 120)
					    			{
					    				document.getElementById('tabela_tlaksis').innerHTML += '<font color="red">  (!!!) </font>';
					    				document.getElementById('tabela_tlakdia').innerHTML += '<font color="red">  (!!!) </font>';
					    				
					    				document.getElementById('izpisSimptomov').innerHTML = tabelaSimptomov.join(" - ").toString();
					    			}
					    		}
					    		else
					    		{
					    			window.opener.document.getElementById('tabela_tlakdia').innerHTML = res[0].diastolic + res[0].unit;
						    		window.opener.document.getElementById('tabela_tlaksis').innerHTML = res[0].systolic + res[0].unit;
						    		(res[0].diastolic > 90 || res[0].systolic > 120)
					    			{
					    				window.opener.document.getElementById('tabela_tlak').innerHTML += "  (!!!)";
					    				
					    				window.opener.document.getElementById('izpisSimptomov').innerHTML = tabelaSimptomov.join(" - ").toString();
					    			}
					    		}
					    		if(res[0].diastolic > 90 || res[0].systolic > 120)
					    		{
					    				if(tabelaSimptomov.indexOf("Tlak") == -1)
										{
											tabelaSimptomov.push("Tlak");
										}
					    		}
					    	} else {
					    		alert("NAPAKA: Tlak - ni podatkov")
					    	}
					    },
					    error: function(err) {
					    	alert("NAPAKA: " + JSON.parse(err.responseText).userMessage + "'!");
					    }
					});
					
					$.ajax({
					    url: baseUrl + "/view/" + ehrId + "/" + "height",
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	if (res.length > 0) {
					    		if(!vnos)
					    		{
						    		document.getElementById('tabela_visina').innerHTML = res[0].height + res[0].unit;
					    		}
					    		else
					    		{
					    			window.opener.document.getElementById('tabela_visina').innerHTML = res[0].height + res[0].unit;
					    		}
					    	} else {
					    		alert("visina - ni podatkov")
					    	}
					    },
					    error: function(err) {
					    	alert("NAPAKA: " + JSON.parse(err.responseText).userMessage + "'!");
					    }
					});
	    	}
		});
	}
}
				
				
function poizvejPoEHR(){
	var ehrId = $("#polje_ehrid").val();
	preberiOsnovneMeritve(ehrId, false);
	
	
}

function dodajSimptom(){
	var seznam = document.getElementById("seznamSimptomov");
	var simptom= seznam.options[seznam.selectedIndex].text;
	
	if(tabelaSimptomov.indexOf(simptom) == -1)
	{
		tabelaSimptomov.push(simptom);
	}
	console.log(simptom + ", " + tabelaSimptomov.toString());
	document.getElementById('izpisSimptomov').innerHTML = tabelaSimptomov.join(" - ").toString();
}

function odstraniVseSimptome(){
	tabelaSimptomov = [];
	document.getElementById('izpisSimptomov').innerHTML = "";
	document.getElementById('izpisVsehZdravilT').innerHTML = "";
}

function poizvedbaZaZdravilaSTART(){
	poizvedba = 1;
	if(i == 0){jsonBazaZdravil.children=[];}
console.log("i:  " + i);
	jsonBazaZdravil.children[i] = [];
	jsonBazaZdravil.children[i] = {name: tabelaSimptomov[i]};
	var your_url = 'http://www.lekarnar.com/izdelki?utf8=%E2%9C%93&keywords=' + tabelaSimptomov[i];
	jQuery.ajax = (function(_ajax){

    var protocol = location.protocol,
        hostname = location.hostname,
        exRegex = RegExp(protocol + '//' + hostname),
        YQL = 'http' + (/^https/.test(protocol)?'s':'') + '://query.yahooapis.com/v1/public/yql?callback=?',
        query = 'select * from html where url="{URL}" and xpath="*"';

    return function(o) {

        var url = o.url;

        if ( /get/i.test(o.type) && !/json/i.test(o.dataType)) {

            // Manipulate options so that JSONP-x request is made to YQL

            o.url = YQL;
            o.dataType = 'json';

            o.data = {
                q: query.replace(
                    '{URL}',
                    url + (o.data ?
                        (/\?/.test(url) ? '&' : '?') + jQuery.param(o.data)
                    : '')
                ),
                format: 'xml'
            };

            // Since it's a JSONP request
            // complete === success
            if (!o.success && o.complete) {
                o.success = o.complete;
                delete o.complete;
            }

            o.success = (function(_success){
                return function(data) {

                    if (_success) {
                        // Fake XHR callback.
                        _success.call(this, {
                            responseText: data.results[0]
                                // YQL screws with <script>s
                                // Get rid of them
                                .replace(/<script[^>]+?\/>|<script(.|\s)*?\/script>/gi, '')
                        }, 'success');
                    }

                };
            })(o.success);

        }

        return _ajax.apply(this, arguments);

    };

})(jQuery.ajax);

$.ajax({
    url: your_url,
    type: 'GET',
    success: function(res) {
console.log("ZACETEK IZPISA");
        var text = res.responseText;

var string = text;
var re = /\h4 itemprop=\"name\">.*?\>/ig
var match;
var stevec = 0;

while (match = re.exec(string))
{
  var input = match[0], re1 = />.*?,/ig;
  try {
  	var t = re1.exec(input)[0];
  	var tmp = t.substring(t.lastIndexOf(">")+1);
  	if(stevec==0){jsonBazaZdravil.children[i].children = [];}
	jsonBazaZdravil.children[i].children[stevec] = {name: tmp};
	stevec += 1;
}
catch(err) {
   break;
}
}
//seznam_zdravil = tmp.split(',');
console.log("KONEC");

//document.getElementById('izpisVsehZdravil').innerHTML = "";
d3.selectAll("svg > *").remove();
if(i < tabelaSimptomov.length - 1)
{
	i += 1;
	poizvedbaZaZdravilaSTART();
}else{
	i=0;
	var s = JSON.stringify(jsonBazaZdravil);
	console.log(s);
	//console.log(zdravila);


      var vis = d3.select("#izpisVsehZdravil").append("svg:svg")
      .attr("width", 800)
      .attr("height", 600)
      .append("svg:g")
      .attr("transform", "translate(70, 0)"); // shift everything to the right
 
      var tree = d3.layout.tree()
    .size([600,300]);
 
      var diagonal = d3.svg.diagonal()

      .projection(function(d) { return [d.y, d.x]; });
 

      var nodes = tree.nodes(jsonBazaZdravil);

      var links = tree.links(nodes);
 
      var link = vis.selectAll("pathlink")
      .data(links)
      .enter().append("svg:path")
      .attr("class", "link")
      .attr("d", diagonal)
		.attr("fill", diagonal)
      var node = vis.selectAll("g.node")
      .data(nodes)
      .enter().append("svg:g")
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
 
      node.append("svg:circle")
      .attr("r", 3.5);
 
      node.append("svg:text")
      .attr("dx", function(d) { return d.children ? -8 : 8; })
      .attr("dy", 3)
      .attr("text-anchor", function(d) { return d.children ? "end" : "start"; })
      .text(function(d) { return d.name; })

    }
    }
	
});

}