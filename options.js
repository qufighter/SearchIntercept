// shared functions (help page and other)

function toggleNextSiblingVisiblity(ev){
    var sib = ev.target.nextSibling;
    if( sib.style.display == 'block' ){
        sib.style.display = 'none';
    }else{
        sib.style.display = 'block';
    }
    ev.preventDefault();
}

var noAutoSearchPattern = 'private|words';
var searchEngines=[
    {name:'Google', url: 'https://www.google.com/search?q=%s'},
    {name:'Bing', url: 'https://www.bing.com/search?q=%s'}
];

function searchEngineOptions(){
    var seo = [];
    var lastLocValid = false;
    for( var e=0,el=searchEngines.length; e<el; e++ ){
        seo.push(Cr.elm('option',{value:searchEngines[e].url},[Cr.txt(searchEngines[e].name)]));
        if(localStorage.lastLoc == searchEngines[e].url){
            lastLocValid = true;
        }
    }
    if( !lastLocValid ){
        delete localStorage.lastLoc;
    }
    return seo;
}

function editSearchEngineOptions(ev){
    toggleNextSiblingVisiblity(ev);
}

document.addEventListener('DOMContentLoaded', function () {
    var h = window.location.href;
    var s = h.indexOf('q=');
    if( s > -1 ){
        var s = decodeURIComponent(h.substr(s+2).replace(/\+/g,' '));
        document.getElementById('q').value=s;
        if( !s.match(new RegExp(noAutoSearchPattern, 'gi')) ){
            document.getElementById('q').select();
        }
    }

    Cr.empty(document.getElementById('selectContainer'));
    var selEng = Cr.elm('select',{id:'selectedEngine'},searchEngineOptions(),document.getElementById('selectContainer'));
    if(localStorage.lastLoc) selEng.value = localStorage.lastLoc;

    document.getElementById('searchForm').addEventListener('submit',function(ev){
        localStorage.lastLoc = document.getElementById('selectedEngine').value;
        window.location = document.getElementById('selectedEngine').value.replace('%s', encodeURIComponent(document.getElementById('q').value).replace(/%20/g, '+'));
        ev.preventDefault();
    });

    document.getElementById('editTrigger').addEventListener('click',editSearchEngineOptions);

    //help page stuff

    var as=document.getElementsByClassName('autoselect');
    for( var asi=0,asl=as.length;asi<asl;asi++ ){
        (function(elm, origv){
            elm.addEventListener('mouseover',function(ev){
                ev.target.value=origv; // in case they choose cut instead of copy the value will be preserved
                ev.target.select();
            })
        })(as[asi], as[asi].value);
    }

    document.getElementById('helpTrigger').addEventListener('click',toggleNextSiblingVisiblity);

});
