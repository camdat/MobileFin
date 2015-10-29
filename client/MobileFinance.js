function ExecSearch() {
  var LocationText = $('.fi_mainsearch input')[0].value;
  if ( LocationText.match(/^[^\,]*\,[^\,]*$/) ) {
    LocationText = LocationText.split(',');
    LocationText[0] = LocationText[0].trim();
    LocationText[1] = LocationText[1].trim();
    LocationText[0] = LocationText[0].replace(/.+?[\.\?\!](\s|$)/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
    LocationText[1] = LocationText[1].toUpperCase();
    if ( LocationText[1].length != 2 ) {
      console.log("Incorrect state length");
      return;
    }
    var location_id = LocationText[0] + "_" + LocationText[1];
  } else {
    return;
  }
  window.location.href = LocationURL(location_id);
  // Router.go('content.finance.location',{location_id: location_id});
  // $('.fi_mainsearch input')[0].value = "";
}

function GetSuggest(nowTime) {
  var searchString = $('.fi_mainsearch input')[0].value;
  if ( searchString == "" ) {
    $('.fi_search_recommendations').removeClass('active');
  } else {
    var HTMLString = '';
    var data = [{city:'Wichita', state:'KS'}, {city:'Derby', state:'KS'}, {city: 'Andover', state: 'KS'}];
    for ( var index = 0; index < data.length; index++ ) {
      if ( index < 10 ) {
        if ( index != 0 ) {
          HTMLString = HTMLString + '<div class="border-li"></div>';
        }
        HTMLString = HTMLString + '<a style="color: #000" href=""><div class="fi_search_recommendations_item">' + data[index].city + ", " + data[index].state + '<i class="fa fa-angle-right"></i></div></a>';
      }
    }
    $('.fi_search_recommendations')[0].innerHTML = HTMLString;
    $('.fi_search_recommendations').addClass('active');


    // Meteor.call('GetSuggestion',encodeURIComponent(searchString),nowTime,function(error, data){
    //   if ( error ) {
    //     console.log('Suggestion Error',error);
    //     return false;
    //   }
    //
    //   if ( Session.get('SuggestTime') > data.time ) {
    //     return false;
    //   }
    //
    //   Session.set('SuggestTime',data.time);
    //
    //   data = data.data;
    //
    //   if ( data.length == 0 ) {
    //     $('.fi_search_recommendations').removeClass('active');
    //     return false;
    //   }
    //   //var HTMLString = '<div class="caret-top"></div><i class="fa fa-times fi_search_recommendations_close"></i>';
    //   var HTMLString = '';
    //   for ( var index = 0; index < data.length; index++ ) {
    //     if ( index < 10 ) {
    //       if ( index != 0 ) {
    //         HTMLString = HTMLString + '<div class="border-li"></div>';
    //       }
    //       HTMLString = HTMLString + '<a style="color: #000" href="' + LocationURL(data[index].city + "_" + data[index].state) + '"><div class="fi_search_recommendations_item">' + data[index].city + ", " + data[index].state + '<i class="fa fa-angle-right"></i></div></a>';
    //     }
    //   }
    //   $('.fi_search_recommendations')[0].innerHTML = HTMLString;
    //   $('.fi_search_recommendations').addClass('active');
    // });
  }
}

Template.finance_homepage.events({
  'keyup .fi_mainsearch input': function(event) {

    if($('.fi_mainsearch input')[0].value == "" || $('.fi_mainsearch input')[0].value == undefined)
    {
      $('.fi_searchbtn').css("background-color", "rgb(48, 152, 255)");
      $(".fi_mainsearch").removeClass("boxhighlight-black");
      $(".fi_mainsearch").addClass("boxhighlight");
    }
    if ( event.which === 13 ) {
      event.preventDefault();
        //ExecSearch();
      Finance_Search($('.fi_mainsearch input')[0].value);
      return "";
    }
    if ( typeof StartTime == "undefined" ) {
      StartTime = 0;
    }
    var d = new Date();
    d = d.getTime();
    curTime = d;
    if ( d - StartTime < 250 ) {
      setTimeout(function(curTime){GetSuggest(curTime);},250,curTime);
      return "";
    }
    StartTime = d;
    GetSuggest(curTime);
  },
  'click .fi_search_recommendations_item': function(event) {
    $('.fi_mainsearch input')[0].value = $(event.target)[0].innerHTML.replace('<i class="fa fa-angle-right"></i>', '');
    $('.fi_search_recommendations').removeClass('active');
    $('.fi_searchbtn').css("background-color", "black");
    $(".fi_mainsearch").addClass("boxhighlight-black");
     Search($('.fi_mainsearch input')[0].value);
  },
  'click .fi_search_recommendations_close': function() {
    $('.fi_search_recommendations').removeClass('active');
    return false;
  },
  'click .fi_searchbtn.fa-search': function() {
     Finance_Search($('.fi_mainsearch input')[0].value);
  },

  'mousedown .fi_searchbtn': function(){
    $('.fi_searchbtn').css("background-color", "black");
    $(".fi_mainsearch").addClass("boxhighlight-black");
  },

  'mouseup .fi_searchbtn': function(){
    $('.fi_searchbtn').css("background-color", "#3098ff");
    $(".fi_mainsearch").removeClass("boxhighlight-black");
  },

  'focus .fi_mainsearch-text': function(){
    $(".fi_mainsearch").addClass("boxhighlight");
  },
  'focusout .fi_mainsearch-text' : function(){
    $(".fi_mainsearch").removeClass("boxhighlight");
  }
});

Template.finance_homepage.onCreated(function() {
  // Session.set('SuggestTime',0);
  // this.autorun(function(){
  //   var data = Session.get('UserLoc');
  //   if ( typeof data == "undefined" ) {
  //     return false;
  //   }
  //   $('.fi_properties_now').css('display','block');
  //   $('.fi_features_note').css('display','block');
  // });

  // this.autorun(function(){
  //   var response = Session.get('UserLoc');
  //   if ( typeof response == "undefined" ) {
  //     return false;
  //   }
  //
  //   Meteor.call('get_nearby_city',response['ip'],function(error,response) {
  //     if ( error ) {
  //       console.log("ERROR",error);
  //       return "";
  //     }
  //     if ( response == "" ) {
  //       return "";
  //     }
  //     Session.set("CityInfo",response);
  //     $(".fi_explore").css("display","block");
  //   });
  // });
});

Template.finance_homepage.onRendered(function(){
  //$('.finance_body_faq').css('display','none');
  var template = this;
  var menu = this.find('#menu');
  var panel = this.find('#panel');
  var slideout = new Slideout({
    'panel': panel,
    'menu': menu,
    'padding': 256,
    'tolerance': 70
  });

  // Toggle button
  var togglebtn = this.find('#togglebtn');
  togglebtn.addEventListener('click', function() {
    slideout.toggle();
  });

  //images for features boxes
  $("#feature1").css({"background-image":"URL(http://cdn.joyfulhome.com/Image_Interactive_Map.png)","float":"left"});
  $("#feature2").css({"background-color":"#000000","float":"left"});
  $("#feature3").css({"background-image":"URL(http://cdn.joyfulhome.com/Image_Trending_News.png)","float":"right"});
  $("#feature4").css({"background-image":"URL(http://cdn.joyfulhome.com/Image_Top_100_List.png)","float":"right"});

  $(".fi_explore-blue").css({"background-image":"URL(http://cdn.joyfulhome.com/Icons_Explore.png)"});
  $(".fi_features_note-blue").css({"background-image":"URL(http://cdn.joyfulhome.com/Icons_Features.png)"});
});

Template.finance_homepage.helpers({
  Cities:[
    {URL: LocationURL(), class: "fi_explore-image1",id: "explore1", CityName: 'Wichita', State: 'KS', txt: 'Home to 10 Companies', index: 0, image: 'http://cdn.joyfulhome.com/Home_Stock_Images/08_L.png'},
    {URL: LocationURL(), class: "fi_explore-image2",id: "explore2", CityName: 'Derby', State: 'KS', txt: '3 Companies', index: 1, image: 'http://cdn.joyfulhome.com/Home_Stock_Images/21_L.png'},
    {URL: LocationURL(), class: "fi_explore-image3",id: "explore3", isString: true, GeoLocation: 'Wichita', txt: 'is home to 6 Public Companies', image: ''},
    {URL: LocationURL(), class: "fi_explore-image1",id: "explore4", CityName: 'Haysville', State: 'KS', txt: '2 Companies', index: 2, image: 'http://cdn.joyfulhome.com/Home_Stock_Images/24_L.png'},
    {URL: LocationURL(), class: "fi_explore-image1",id: "explore5", CityName: 'Andover', State: 'KS', txt: '6 Companies', index: 3, image: 'http://cdn.joyfulhome.com/Home_Stock_Images/27_L.png'},
    {URL: LocationURL(), class: "fi_explore-image2",id: "explore6", CityName: 'Salina', State: 'KS', txt: '5 Companies', index: 4, image: 'http://cdn.joyfulhome.com/Home_Stock_Images/15_L.png'}
  ],
  CityListURL: function() {
    // var currentloc = Session.get("HomePageLocation");
    // if ( typeof currentloc == "undefined" ) {
    //   return "";
    // }
    // return Router.path('content.finance.cityview',{
    //   state_id:currentloc['state'], city_id:currentloc['city']
    // });
    return '';
  },
  TopHomesURL: function() {
    // var data = Session.get("HomePageLocation");
    // if ( typeof data == "undefined" ) {
    //   return "";
    // }
    // return Router.path('content.finance.listview',{
    //   partner_id: Session.get("partner_id"),
    //   list_name: "largest_homes",
    //   state_id: data['state'],
    //   city_id: data['city']
    // });
    return '';
  },
  // Cities: function() {
  //   var data = Session.get("CityInfo");
  //   var currentloc = Session.get("HomePageLocation");
  //   if ( typeof data == "undefined" || typeof currentloc == "undefined" ) {
  //     return "";
  //   }
  //   //randomize images for Explore areas
  //   var x = Math.floor((Math.random() * 5) + 1);
  //   var random = randomimage();
  //   var guide = [
  //     {class: "fi_explore-image1",id: "explore1", index: 0, image: random[x]},
  //     {class: "fi_explore-image2",id: "explore2", index: 1, image: random[x+1]},
  //     {class: "fi_explore-image3",id: "explore3", isString: true},
  //     {class: "fi_explore-image1",id: "explore4", index: 2, image: random[x+2]},
  //     {class: "fi_explore-image1",id: "explore5", index: 3, image: random[x+3]},
  //     {class: "fi_explore-image2",id: "explore6", index: 4, image: random[x+4]}
  //   ];
  //   var ReturnArray = [];
  //   for ( var index = 0; index < guide.length; index++ ) {
  //     ReturnArray[index] = guide[index];
  //     if ( guide[index].isString ) {
  //       ReturnArray[index]['String'] = "Here are 5 of " + data.number + " cities within " + data['distance'] + " miles of your location";
  //       //Will set variable to footer to equal your current location based on ip geocode
  //       // ReturnArray[index]['URL'] = Router.path('content.finance.cityview',{
  //       //   state_id:currentloc['state'], city_id:currentloc['city']
  //       // });
  //     } else {
  //       var localInd = guide[index]['index'];
  //       ReturnArray[index]['String'] = toTitleCase(data['data'][localInd]['city']) + ", " + data['data'][localInd]['state'];
  //       ReturnArray[index]['URL'] = Router.path('content.finance.location',{
  //         location_id: data['data'][localInd]['city'] + "_" + data['data'][localInd]['state']
  //       });
  //     }
  //   }
  //   return ReturnArray;
  // },
  //CityName: function() {
    // var data = Session.get("HomePageLocation");
    // if ( typeof data == "undefined" ) {
    //   return "";
    // }
    // return StringToSentence(data['city']);
  //},
  CityProfileURL: function() {
    // var data = Session.get("HomePageLocation");
    // if ( typeof data == "undefined" ) {
    //   return "";
    // }
    // return Router.path('content.finance.location',{
    //   location_id: data['city'] + "_" + data['state']
    // });
    return '';
  },
  Top100URL: function() {
    // var data = Session.get("HomePageLocation");
    // if ( typeof data == "undefined" ) {
    //   return Router.path('content.finance.listoflists',{
    //     partner_id: Session.get("partner_id")
    //   });
    // }
    // return Router.path('content.finance.listoflists',{
    //   partner_id: Session.get("partner_id"),
    //   state_id: data['state'],
    //   city_id: data['city']
    // });
    return '';
  },
  MapViewURL: function() {
    // var data = Session.get("HomePageLocation");
    // if ( typeof data == "undefined" ) {
    //   return "";
    // }
    // return Router.path('content.finance.mapview',{
    //   list_name: 'most_recent_listings',
    //   state_id: data['state'],
    //   city_id: data['city']
    // });
    return '';
  },
  CitiesNearby: function() {
    // var data = Session.get("HomePageLocation");
    // if ( typeof data == "undefined" ) {
    //   return "";
    // }
    // return Router.path('content.finance.cityview',{
    //   list_name: 'most_recent_listings',
    //   state_id: data['state'],
    //   city_id: data['city']
    // });
    return '';
  }
});




//store few images for randomization on home page Exlore area
function randomimage(){
  var image_array = new Array();
  image_array['0'] = 'http://cdn.joyfulhome.com/Home_Stock_Images/08_L.png';
  image_array['1'] = 'http://cdn.joyfulhome.com/Home_Stock_Images/21_L.png';
  image_array['2'] = 'http://cdn.joyfulhome.com/Home_Stock_Images/24_L.png';
  image_array['3'] = 'http://cdn.joyfulhome.com/Home_Stock_Images/27_L.png';
  image_array['4'] = 'http://cdn.joyfulhome.com/Home_Stock_Images/15_L.png';
  image_array['5'] = 'http://cdn.joyfulhome.com/Home_Stock_Images/13_L.png';
  image_array['6'] = 'http://cdn.joyfulhome.com/Home_Stock_Images/03_L.png';
  image_array['7'] = 'http://cdn.joyfulhome.com/Home_Stock_Images/07_L.png';
  image_array['8'] = 'http://cdn.joyfulhome.com/Home_Stock_Images/02_L.png';
  image_array['9'] = 'http://cdn.joyfulhome.com/Home_Stock_Images/09_L.png';
  return image_array;
}
