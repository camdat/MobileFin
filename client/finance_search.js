

  Finance_Search = function(quer){

        function isInArray(value, array){
          return array.indexOf(value) > -1;
        }

        Array.prototype.remove = function(from, to) {
          var rest = this.slice((to || from) + 1 || this.length);
          this.length = from < 0 ? this.length + from : from;
          return this.push.apply(this, rest);
        };

        String.prototype.replaceAt = function(index, character) {
          return this.substr(0, index) + character + this.substr(index+character.length);
        };

      /*==== SET UP THE CLEAN VARIABLES  ====*/

            var toss = {};
            //Session.set('p_search', undefined);
            Session.set('TickCheck', false);
            Session.set('NameCheck', false);
            Session.set('LocCheck', false);

            var words = new Array();
            var quer_ngrams = nlp.ngram(quer, {max_size:2});
            var pos = nlp.pos(quer, {dont_combine: true}).sentences[0]; //makes sure no 'double word' strings are returned
            var nouns = pos.nouns() //var of just the nouns

            for(i=0;i<pos.tokens.length;i++){
             words[i] = pos.tokens[i].text;      //sets each word of query into spot in new array
            }

            var TickCheckPurgeWords = ['in','where','what','of','at','near','the'];
            var LocCheckPurgeWords = ['in','where','what','of','at','near','the'];
            var NameCheckPurgeWords = ['in','where','what','of','at','near','the'];
      /*******************************************/

      console.log(words);


      /*==== PARSING ALL UPPER CASE WORDS ====*/


      var skipper = 0;
      var AllCapped = [];
      var TickerPurgeWords = ['I', 'A', 'N'];
      var TickerPurgeSymbols = ['!','?','.','>'];

      //this loop parses out all possible tickers (words in all upper case)
      for(i=0;i<words.length;i++){
        for(j=0;j<words[i].length;j++){

          if(words[i][j] !== words[i][j].toUpperCase()){
            break;
          }
          skipper ++;
        }
        if(skipper == words[i].length){
          AllCapped[AllCapped.length] = words[i];
        }
        skipper = 0;
      }

      //this loop runs the possible tickers against the words to be purged from the possibilities array
      for(i=0;i<TickerPurgeWords.length;i++){
        if(isInArray(TickerPurgeWords[i],AllCapped)){
          AllCapped.remove(i);
        }
      }

      //this loop takes out all special characters that could be at the end of the possible tickers( ! ? , . ( ) # )
      /*for(i=0;i<AllCapped.length;i++){
        for(j=0;j<AllCapped[i].length;j++){
          if(isInArray(AllCapped[i][j], TickerPurgeSymbols)){
            AllCapped[i].replaceAt(AllCapped[i].indexOf(AllCapped[i][j]), '');
          }
        }
      }*/

      //console.log(AllCapped);

      /*****************************************************/




      /*==== COMPANY BY UPPER CASE TICKER NAME PARSING MECHANISM ====*/
      if(AllCapped.length !== 0){
        for(i=0;i<AllCapped.length;i++){
          $.ajax({
            url: 'http://apifin.synapsys.us/call_controller.php?action=search&option=ticker&param=' + AllCapped[i],
            dataType: 'json',
            async: false,
            success: function(r){
              if(r['success'] == true){
                Session.set('TickCheck', r['ticker']['search_data'][0]);
                //console.log(r['name']['search_data'][0]);
              }
            }
          });
        }
      }
      /****************************************************/




      //only 2nd degree ngram for these :D
      /*==== DOUBLE WORD COMPANY/EXEC NAMES PARSING MECHANISM ====*/
      if(Session.get('TickCheck') == false && Session.get('NameCheck') == false && Session.get('LocCheck') == false){
      for(i=0;i<quer_ngrams[1].length;i++){
        //http://apifin.synapsys.us/call_controller.php?action=search&option=name&param=mark%20zuckerberg
        $.ajax({
          url: 'http://apifin.synapsys.us/call_controller.php?action=search&option=name&param=' + quer_ngrams[1][i].word,
          dataType: 'json',
          async: false,
          success: function(r){
            if(r['success'] == true){
              Session.set('NameCheck', r['name']['search_data'][0]);
              //console.log(r['name']['search_data'][0]);
            }
          }
        });
      }
    }

      /**************************************************/


  //use api.real version of the is_city method?



      /*==== SINGLE WORD LOCATION PARSING MECHANISM ====*/
      if(Session.get('TickCheck') == false && Session.get('NameCheck') == false && Session.get('LocCheck') == false){
        for(i=0;i<words.length;i++){
          if(words[i].toLowerCase() !== 'the'){
          //http://apifin.synapsys.us/call_controller.php?action=search&option=location&param=ks
          $.ajax({
            url: 'http://apifin.synapsys.us/call_controller.php?action=search&option=location&param=' + words[i],
            dataType: 'json',
            async: false,
            success: function(r){
              if(r['success'] == true){
                console.log(words[i]);
                Session.set('LocCheck', r['location']['search_data'][0]);
                //console.log(r['location']['search_data'][0]);
              }
            }
          });
          }
        }
      }
      /**************************************/


      /*==== DOUNLE WORD LOCATION PARSING MECHANSIM ====*/
      if(Session.get('TickCheck') == false && Session.get('NameCheck') == false && Session.get('LocCheck') == false){
        for(i=0;i<quer_ngrams[1].length;i++){
          //http://apifin.synapsys.us/call_controller.php?action=search&option=location&param=ks
          $.ajax({
            url: 'http://apifin.synapsys.us/call_controller.php?action=search&option=location&param=' + quer_ngrams[1][i].word,
            dataType: 'json',
            async: false,
            success: function(r){
              if(r['success'] == true){
                console.log(quer_ngrams[1][i].word);
                Session.set('LocCheck', r['location']['search_data'][0]);
              //  console.log(r['location']['search_data'][0]);
              }
            }
          });
        }
      }
      /**************************************************/







      /*==== SINGLE WORD COMPANY NAME PARSING MECHANSIM BASED ON PROPER NOUNS ====*/
      if(Session.get('NameCheck') == false && Session.get('TickCheck') == false && Session.get('LocCheck') == false){
        for(i=0;i<words.length;i++){
          if(nlp.pos(words[i]).tags()[0][0] == 'NN'){
            $.ajax({
              url: 'http://apifin.synapsys.us/call_controller.php?action=search&option=name&param=' + words[i],
              dataType: 'json',
              async: false,
              success: function(r){
                if(r['success'] == true){
                  Session.set('NameCheck', r['name']['search_data'][0]);
                  //console.log(r['name']['search_data'][0]);
                }
              }
            });
          }
        }
      }
      /*********************************************************************************/





      /*==== DOUBLE WORD COMPANY NAME PARSING MECHANISM BASED ON PROPER NOUNS ====*/

        //impossible for now :(   would use second degree ngrams for this but the nlp.pos('str').tags() doesnt work with two words at a time.

      /****************************************************************************/




  //last resort / edge case zone


      //SHOULD I EVEN USE THESE??

      /*==== COMAPNY TICKER LOWERCASE PARSING MECAHANISM ====*/

      if(Session.get('TickCheck') == false && Session.get('LocCheck') == false && Session.get('NameCheck') == false){
        for(i=0;i<words.length;i++){
          $.ajax({
            url: 'http://apifin.synapsys.us/call_controller.php?action=search&option=ticker&param=' + words[i],
            dataType: 'json',
            async: false,
            success: function(r){
              if(r['success'] == true){
                Session.set('TickCheck', r['ticker']['search_data'][0]);
                //console.log(r['ticker']['search_data'][0]);
              }
            }
          });
        }
      }

      /*******************************************************/





      /*==== SINGLE WORD COMPANY/EXEC NAME PARSING MECHANISM [LAST RESORT!!!!!!!!!]====*/

      //maybe redirect to a suggestions page?

      if(Session.get('NameCheck') == false && Session.get('TickCheck') == false && Session.get('LocCheck') == false){
        for(i=0;i<words.length;i++){
          $.ajax({
            url: 'http://apifin.synapsys.us/call_controller.php?action=search&option=name&param=' + words[i],
            dataType: 'json',
            async: false,
            success: function(r){
              if(r['success'] == true){
                Session.set('NameCheck', r['name']['search_data'][0]);
                //console.log(r['name']['search_data'][0]);
              }
            }
          });
        }
      }

      /******************************************/




      /*==== ROUTING CONTROL LOGIC ====*/
      if(Session.get('TickCheck') !== false && Session.get('NameCheck') == false && Session.get('LocCheck') == false){
        //TICKER route
        //console.log(Session.get('TickCheck'));
        Router.go('content.companyprofile', {partner_id: Session.get('partner_id'), company_id: Session.get('TickCheck')['c_id']});
      }
      else if(Session.get('TickCheck') == false && Session.get('NameCheck') !== false && Session.get('LocCheck') == false){
        //NAME route + logic to determine type of name
        //console.log(Session.get('NameCheck'));

          if(Session.get('NameCheck')['name_type'] == 'company'){
            Router.go('content.companyprofile', {partner_id: Session.get('partner_id'), company_id: Session.get('NameCheck')['c_id']});
          }else if(Session.get('NameCheck')['name_type'] == 'officer'){
            Router.go('content.executiveprofile', {partner_id: Session.get('partner_id'), exec_id: Session.get('NameCheck')['o_id']})
          }
      }
      else if(Session.get('TickCheck') == false && Session.get('NameCheck') == false && Session.get('LocCheck') !== false){
        //LOCATION route
        //console.log(Session.get('LocCheck'));
        Router.go('content.location', {partner_id: Session.get('partner_id') /* ADDITIONAL PARAMS WILL BE ADDED */})
      }else{
        //Route null
        //console.log('ROUTE NULL // No Results');
        Router.go('content.noresults', {partner_id: Session.get('partner_id')});
      }

      /*********************************/


    } //end Finance_Search function
